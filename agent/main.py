import os
from pdf_reader import ler_pdf
from quiz_generator import gerar_quiz
from html_builder import criar_html
from index_updater import atualizar_index

PDFS_DIR = "pdfs"
QUIZZES_DIR = "quizzes"

os.makedirs(QUIZZES_DIR, exist_ok=True)

# 🔹 PDFs atuais (fonte da verdade)
pdfs_atuais = {
    f.replace(".pdf", "")
    for f in os.listdir(PDFS_DIR)
    if f.lower().endswith(".pdf")
}

# 🔹 Quizzes existentes
quizzes_existentes = {
    f.replace(".html", "")
    for f in os.listdir(QUIZZES_DIR)
    if f.lower().endswith(".html")
}

# 🧹 1️⃣ REMOVER quizzes órfãos (PDF deletado)
for quiz in quizzes_existentes - pdfs_atuais:
    quiz_path = os.path.join(QUIZZES_DIR, quiz + ".html")
    print(f"🗑️ Removendo quiz órfão: {quiz}")
    os.remove(quiz_path)

# ✍️ 2️⃣ GERAR quizzes novos
for nome in pdfs_atuais:
    quiz_path = os.path.join(QUIZZES_DIR, nome + ".html")

    if os.path.exists(quiz_path):
        continue

    print(f"🧠 Gerando quiz para: {nome}")
    texto = ler_pdf(os.path.join(PDFS_DIR, nome + ".pdf"))
    quiz = gerar_quiz(texto)
    html = criar_html(nome, quiz)

    with open(quiz_path, "w", encoding="utf-8") as f:
        f.write(html)

# 📄 3️⃣ SINCRONIZAR INDEX
atualizar_index(sorted(pdfs_atuais))
