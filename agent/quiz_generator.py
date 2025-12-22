import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def gerar_quiz(texto):
    prompt = f"""
Crie 10 perguntas de múltipla escolha com 4 alternativas,
apenas uma correta, baseadas no texto abaixo.

Formato JSON:
[
  {{
    "pergunta": "...",
    "alternativas": ["A", "B", "C", "D"],
    "correta": 0
  }}
]

Texto:
{texto[:12000]}
"""

    model = genai.GenerativeModel("gemini-1.5-flash")
    resposta = model.generate_content(prompt)
    return resposta.text
