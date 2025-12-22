import os
from pdf_reader import ler_pdf
from quiz_generator import gerar_quiz
from html_builder import criar_html
from index_updater import atualizar_index

PDFS_DIR = "pdfs"
QUIZZES_DIR = "quizzes"

os.makedirs(QUIZZES_DIR, exist_ok=True)

pdfs = [
    f for f in os.listdir(PDFS_DIR)
    if f.lower().endswith(".pdf")
]

if not pdfs:
    print("Nenhum PDF encontrado.")
    exit(0)

for pdf in pdfs:
    nome = pdf.replace(".pdf", "")
    quiz_path = f"{QUIZZES_DIR}/{nome}.html"

    if os.path.exists(quiz_path):
        print(f"Quiz já existe: {quiz_path}")
        continue

    print(f"Lendo PDF: {pdf}")
    texto = ler_pdf(os.path.join(PDFS_DIR, pdf))

    if not texto.strip():
        print(f"PDF vazio ou não legível: {pdf}")
        continue

    quiz = gerar_quiz(texto)
    html = criar_html(nome, quiz)

    with open(quiz_path, "w", encoding="utf-8") as f:
        f.write(html)

    atualizar_index(nome, quiz_path)
