import os
import requests
import json

API_KEY = os.getenv("GEMINI_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"

def gerar_quiz(texto_pdf):
    prompt = f"""
Gere um quiz com 40 questões de múltipla escolha baseado no texto abaixo.
Cada questão deve ter 5 alternativas (A–E) e indicar a correta.

Texto:
{texto_pdf}
"""

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    response = requests.post(
        f"{API_URL}?key={API_KEY}",
        json=payload,
        timeout=120
    )

    response.raise_for_status()
    return response.json()["candidates"][0]["content"]["parts"][0]["text"]
