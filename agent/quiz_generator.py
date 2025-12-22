import os
import requests

API_KEY = os.getenv("GEMINI_API_KEY")

API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent"

headers = {
    "Content-Type": "application/json"
}

payload = {
    "contents": [
        {
            "parts": [
                {"text": "Gere um quiz com 40 questões baseado no texto abaixo:\n\n" + texto_pdf}
            ]
        }
    ]
}

response = requests.post(
    f"{API_URL}?key={API_KEY}",
    headers=headers,
    json=payload,
    timeout=60
)

response.raise_for_status()
data = response.json()
