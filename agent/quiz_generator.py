import os
import requests

API_KEY = os.environ["GEMINI_API_KEY"]
API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent"

def gerar_quiz(texto):
    prompt = f"""
Crie um quiz com 40 questões de múltipla escolha,
baseado no texto abaixo.
Retorne em JSON com:
- pergunta
- alternativas (A–D)
- resposta correta

Texto:
{texto[:12000]}
"""

    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }

    r = requests.post(
        f"{API_URL}?key={API_KEY}",
        json=payload,
        timeout=60
    )

    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"]
