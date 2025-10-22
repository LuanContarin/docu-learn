import json
import numpy as np
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, LSTM, Dense, Embedding

MODEL_CONFIG_PATH = "models/tradutor_config.json"
MODEL_WEIGHTS_PATH = "models/tradutor_pesos.weights.h5"

print("📑Carregando configurações do modelo...")
try:
  with open(MODEL_CONFIG_PATH, 'r', encoding='utf-8') as f:
    config = json.load(f)
except FileNotFoundError:
  print(f"ERRO: Arquivo '{MODEL_CONFIG_PATH}' não encontrado.")
  exit()

# --- 1. CARREGAR CONFIGURAÇÕES E VOCABULÁRIOS ---
# Carrega os parâmetros de configuração
latent_dim = config['latent_dim']
num_encoder_tokens = config['num_encoder_tokens']
num_decoder_tokens = config['num_decoder_tokens']
max_encoder_seq_length = config['max_encoder_seq_length']
max_decoder_seq_length = config['max_decoder_seq_length']

# Carrega os vocabulários (dicionários)
input_token_index = config['input_token_index']
target_token_index = config['target_token_index']

# JSON salva chaves como strings. Convertemos de volta para inteiros.
reverse_target_char_index = {
  int(k): v for k, v in config['reverse_target_char_index'].items()
}

# --- 2. RECONSTRUIR A ARQUITETURA EXATA DO MODELO ---
# --- Encoder ---
encoder_inputs = Input(shape=(None,), name='encoder_input')
enc_emb = Embedding(num_encoder_tokens, latent_dim, name='enc_embedding')(encoder_inputs)
encoder_lstm = LSTM(latent_dim, return_state=True, name='encoder_lstm')
_, state_h, state_c = encoder_lstm(enc_emb)
encoder_states = [state_h, state_c] 

# --- Decoder ---
decoder_inputs = Input(shape=(None,), name='decoder_input')
dec_emb_layer = Embedding(num_decoder_tokens, latent_dim, name='dec_embedding')
dec_emb = dec_emb_layer(decoder_inputs)
decoder_lstm = LSTM(latent_dim, return_sequences=True, return_state=True, name='decoder_lstm')
decoder_outputs, _, _ = decoder_lstm(dec_emb, initial_state=encoder_states)
decoder_dense = Dense(num_decoder_tokens, activation='softmax', name='decoder_output')
decoder_outputs = decoder_dense(decoder_outputs)

model = Model([encoder_inputs, decoder_inputs], decoder_outputs)

# --- 3. CARREGAR OS PESOS TREINADOS (O "CÉREBRO") ---
print("📑Carregando pesos do modelo treinado...")
try:
  model.load_weights(MODEL_WEIGHTS_PATH)
except FileNotFoundError:
  print(f"ERRO: Arquivo '{MODEL_WEIGHTS_PATH}' não encontrado.")
  exit()

# --- 4. RECONSTRUIR OS MODELOS DE INFERÊNCIA (PARA TRADUÇÃO) ---
# Agora que os pesos estão carregados, criamos os modelos de uso real.
print("📑Criando modelos de inferência...")
encoder_model = Model(encoder_inputs, encoder_states)

decoder_state_input_h = Input(shape=(latent_dim,))
decoder_state_input_c = Input(shape=(latent_dim,))
decoder_states_inputs = [decoder_state_input_h, decoder_state_input_c]
dec_emb2 = dec_emb_layer(decoder_inputs)
decoder_outputs2, state_h2, state_c2 = decoder_lstm(dec_emb2, initial_state=decoder_states_inputs)
decoder_states2 = [state_h2, state_c2]
decoder_outputs2 = decoder_dense(decoder_outputs2)
decoder_model = Model([decoder_inputs] + decoder_states_inputs, [decoder_outputs2] + decoder_states2)

print("📑Modelo de IA carregado com sucesso. Pronto para traduzir!")

def traduzir(frase_original):
  """Pega uma string em inglês e retorna a tradução em português."""
    
  # Converte a frase de entrada em números (vetorização)
  input_seq = np.zeros((1, max_encoder_seq_length), dtype='float32')
  for t, char in enumerate(frase_original):
    if char in input_token_index:
      input_seq[0, t] = input_token_index[char]
        
  # Codifica a frase para obter o "vetor de contexto"
  states_value = encoder_model.predict(input_seq, verbose=0)

  # Prepara a entrada do decoder (começa com o token de início '\t')
  target_seq = np.zeros((1, 1))
  target_seq[0, 0] = target_token_index['\t']

  stop_condition = False
  decoded_sentence = ''
    
  # Loop de decodificação (gera um caractere por vez)
  while not stop_condition:
    # Roda o decoder para o próximo caractere
    output_tokens, h, c = decoder_model.predict([target_seq] + states_value, verbose=0)

    # Pega o caractere mais provável
    sampled_token_index = np.argmax(output_tokens[0, -1, :])
    sampled_char = reverse_target_char_index[sampled_token_index]
        
    # Adiciona o caractere (a menos que seja o token de parada)
    if sampled_char != '\n':
      decoded_sentence += sampled_char

    # Condição de parada: achou o token de fim ou atingiu o limite
    if (sampled_char == '\n' or len(decoded_sentence) > max_decoder_seq_length):
      stop_condition = True

    # Prepara a próxima entrada do loop
    target_seq = np.zeros((1, 1))
    target_seq[0, 0] = sampled_token_index
        
    # Atualiza o estado da "memória" do decoder
    states_value = [h, c]

  return decoded_sentence.strip()
