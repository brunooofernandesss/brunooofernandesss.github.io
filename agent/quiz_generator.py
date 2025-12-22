import os
import requests

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY não encontrada nas variáveis de ambiente")

API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"


def gerar_quiz(texto_pdf: str) -> str:
    prompt = f"""
Gere exatamente 40 questões no formato JavaScript abaixo.

REGRAS OBRIGATÓRIAS:
- NÃO use JSON
- NÃO use markdown
- NÃO escreva explicações
- NÃO escreva texto fora do bloco
- NÃO coloque const questions =
- Cada questão deve seguir exatamente este formato:

{{
  question: "Texto da pergunta",
  options: [
    "A) ...",
    "B) ...",
    "C) ...",
    "D) ..."
  ],
  correctAnswer: "B) ...",
  comment: "Comentário explicativo",
  topic: "Tema específico da pergunta relacionada ao texto"
}}

- Todas as 40 questões devem estar separadas por vírgula
- NÃO coloque vírgula após a última questão

Texto base:
{texto_pdf}
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
        json=payload,
        timeout=120
    )

    response.raise_for_status()

    texto = response.json()["candidates"][0]["content"]["parts"][0]["text"]

    # 🔧 LIMPEZA CRÍTICA (protege seu frontend)
    texto = texto.strip()

    if texto.startswith("```"):
        texto = texto.replace("```javascript", "").replace("```js", "").replace("```", "").strip()

    return texto
