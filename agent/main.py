import os
from pdf_reader import ler_pdf
from quiz_generator import gerar_quiz
from html_builder import criar_html
from index_updater import atualizar_index

PDFS_DIR = "pdfs"
QUIZZES_DIR = "quizzes"

def main():
    # Garante que a pasta de quizzes existe
    os.makedirs(QUIZZES_DIR, exist_ok=True)

    # Se não existir pasta de PDFs, sai sem erro
    if not os.path.exists(PDFS_DIR):
        print("Pasta 'pdfs/' não encontrada.")
        return

    arquivos = os.listdir(PDFS_DIR)

    # Filtra apenas PDFs válidos
    pdfs = [
        f for f in arquivos
        if f.lower().endswith(".pdf")
        and os.path.isfile(os.path.join(PDFS_DIR, f))
    ]

    if not pdfs:
        print("Nenhum PDF encontrado para processar.")
        return

    for pdf in pdfs:
        nome = os.path.splitext(pdf)[0]
        quiz_path = os.path.join(QUIZZES_DIR, f"{nome}.html")

        # Evita recriar quiz já existente
        if os.path.exists(quiz_path):
            print(f"Quiz já existe: {quiz_path}")
            continue

        print(f"Processando PDF: {pdf}")

        try:
            texto = ler_pdf(os.path.join(PDFS_DIR, pdf))

            if not texto.strip():
                print(f"PDF vazio ou ilegível: {pdf}")
                continue

            quiz = gerar_quiz(texto)
            html = criar_html(nome, quiz)

            with open(quiz_path, "w", encoding="utf-8") as f:
                f.write(html)

            atualizar_index(nome, quiz_path)

            print(f"Quiz gerado com sucesso: {quiz_path}")

        except Exception as e:
            print(f"Erro ao processar {pdf}: {e}")

if __name__ == "__main__":
    main()
