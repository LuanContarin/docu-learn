from language_model import traduzir
from flask import Flask, request, jsonify

app = Flask(__name__)

# Rota de teste para ver se o servidor está no ar
@app.route('/')
def home():
  return "Servidor de Tradução IA está no ar!"

# Rota principal que o React Native vai chamar
@app.route('/traduzir', methods=['POST'])
def handle_translation():
  try:
    request_body = request.json
    if not request_body:
      return jsonify({'erro': 'Corpo da requisição vazio'}), 400
    
    texto_original = request_body['texto']
    if not texto_original:
      return jsonify({'erro': 'Nenhum texto fornecido no corpo da requisição'}), 400
    
    texto_traduzido = traduzir(texto_original)
        
    # Devolve a tradução em formato JSON
    return jsonify({
      'texto_original': texto_original,
      'texto_traduzido': texto_traduzido
    })
  except Exception as e:
    print(f"Erro ao traduzir: {e}")
    return jsonify({'erro': 'Erro interno do servidor ao processar a tradução'}), 500

# --- 7. INICIA O SERVIDOR ---
if __name__ == '__main__':
    print("\n📑Iniciando servidor Flask...")
    app.run(host='0.0.0.0', port=5000, debug=True)
    # app.run(host='0.0.0.0', port=5000, debug=False)
