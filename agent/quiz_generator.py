import os
import requests
import json

API_KEY = os.getenv("GEMINI_API_KEY")
API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"

def gerar_quiz(texto):
    prompt = f"""
Gere um quiz com 40 questões de múltipla escolha baseado EXCLUSIVAMENTE no texto abaixo.

Regras:
- Cada questão deve ter 4 alternativas (A, B, C, D)
- Indique claramente a alternativa correta
- Nível: prova de medicina
- Não invente conteúdo fora do texto

TEXTO:
{texto}
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    response = requests.post(
        f"{API_URL}?key={API_KEY}",
        headers={"Content-Type": "application/json"},
        data=json.dumps(payload),
        timeout=120
    )

    response.raise_for_status()

    data = response.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]
