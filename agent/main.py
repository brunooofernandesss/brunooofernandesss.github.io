import os
from pdf_reader import ler_pdf
from quiz_generator import gerar_quiz
from html_builder import criar_html
from index_updater import atualizar_index

PDFS = "pdfs"
QUIZZES = "quizzes"

os.makedirs(QUIZZES, exist_ok=True)

for pdf in os.listdir(PDFS):
    if not pdf.lower().endswith(".pdf"):
        continue

    nome = pdf.replace(".pdf", "")
    quiz_path = f"{QUIZZES}/{nome}.html"

    if os.path.exists(quiz_path):
        print(f"Quiz já existe: {quiz_path}")
        continue

    texto = ler_pdf(f"{PDFS}/{pdf}")
    quiz = gerar_quiz(texto)
    html = criar_html(nome, quiz)

    with open(quiz_path, "w", encoding="utf-8") as f:
        f.write(html)

    atualizar_index(nome, quiz_path)

print("✅ Agente finalizado com sucesso")
