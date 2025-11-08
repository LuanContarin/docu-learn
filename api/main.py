import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import M2M100Tokenizer, M2M100ForConditionalGeneration
import torch

MODEL_DIR = "./doculearn_finetuned_final"
API_PORT = 8000

print(f"Loading model from: {MODEL_DIR}")

try:
    tokenizer = M2M100Tokenizer.from_pretrained(MODEL_DIR)
    model = M2M100ForConditionalGeneration.from_pretrained(MODEL_DIR)
    
    # Try to move the model from GPU (CUDA) if available
    if torch.cuda.is_available():
        model.to("cuda")
        print("Model loaded in GPU (CUDA)")
    else:
        print("GPU (CUDA) not found. Model loaded in CPU.")
        
    print("Model and Tokenizer loaded successfully!")
    print()
    
except Exception as e:
    print(f"Error loading the model: {e}")
    exit()


# --- API ---
app = FastAPI(
    title="API de Tradução (EN → PT)",
    description="Uma API para traduzir de Inglês para Português."
)

class TranslationRequest(BaseModel):
    text: str

@app.post("/translate")
async def translate_en_to_pt(request: TranslationRequest):
    try:
        input_text = request.text
        
        tokenizer.src_lang = "en" 
        inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True)
        
        # Move inputs to GPU
        if torch.cuda.is_available():
            inputs = inputs.to("cuda")

        id_portuguese = tokenizer.lang_token_to_id["__pt__"]

        outputs = model.generate(
            **inputs, 
            max_length=512,
            forced_bos_token_id=id_portuguese
        )

        translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        print("original_text:", input_text)
        print("translated_text:", translated_text)

        return {
            "original_text": input_text,
            "translated_text": translated_text
        }

    except KeyError as e:
        return {
            "error": f"Erro de Chave: {e}. O código de idioma (ex: 'en_XX' ou 'pt_XX') está errado. Verifique a nota na documentação da API."
        }
    except Exception as e:
        return { "error": f"Erro durante a tradução: {e}" }

if __name__ == "__main__":
    print(f"Serving Uvicorn server at: http://127.0.0.1:{API_PORT}")
    print(f"Access the documentation at: http://127.0.0.1:{API_PORT}/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=API_PORT, reload=True)