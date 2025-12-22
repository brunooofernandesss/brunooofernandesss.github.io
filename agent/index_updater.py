import os
import re

INICIO = "<!-- QUIZZES_AUTOMATICOS_INICIO -->"
FIM = "<!-- QUIZZES_AUTOMATICOS_FIM -->"

def atualizar_index(lista_quizzes=[]):
    index_path = "index.html"

    if not os.path.exists(index_path):
        raise FileNotFoundError("index.html não encontrado")

    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    if INICIO not in html or FIM not in html:
        raise Exception("Marcadores automáticos não encontrados no index.html")

    # -------------------------------
    # Pegar quizzes manuais
    quizzes_man = []
    manual_path = "quizzes/quizzesmanuais"
    if os.path.exists(manual_path):
        for file in os.listdir(manual_path):
            if file.endswith(".html"):
                quizzes_man.append(f"quizzesmanuais/{file}")  # caminho relativo no href

    # Combina automáticos + manuais
    todos_quizzes = lista_quizzes + quizzes_man

    # -------------------------------
    # Criar cards
    cards = ""
    for quiz in todos_quizzes:
        # Usar só o nome do arquivo sem extensão para exibir
        nome_exibicao = os.path.splitext(os.path.basename(quiz))[0]
        cards += f"""
        <div class="card">
            <a href="quizzes/{quiz}">{nome_exibicao}</a>
        </div>
        """

    # -------------------------------
    # Atualiza index
    html_final = re.sub(
        f"{INICIO}[\\s\\S]*?{FIM}",
        f"{INICIO}{cards}\n{FIM}",
        html
    )

    with open(index_path, "w", encoding="utf-8") as f:
        f.write(html_final)

    print("✅ Index sincronizado com quizzes automáticos e manuais")
