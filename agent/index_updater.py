import os
import re

INICIO = "<!-- QUIZZES_AUTOMATICOS_INICIO -->"
FIM = "<!-- QUIZZES_AUTOMATICOS_FIM -->"

def atualizar_index(lista_quizzes):
    index_path = "index.html"

    if not os.path.exists(index_path):
        raise FileNotFoundError("index.html não encontrado")

    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    if INICIO not in html or FIM not in html:
        raise Exception("Marcadores automáticos não encontrados no index.html")

    cards = ""
    for nome in lista_quizzes:
        cards += f"""
        <div class="card">
            <a href="quizzes/{nome}.html">{nome}</a>
        </div>
        """

    html_final = re.sub(
        f"{INICIO}[\\s\\S]*?{FIM}",
        f"{INICIO}{cards}\n{FIM}",
        html
    )

    with open(index_path, "w", encoding="utf-8") as f:
        f.write(html_final)

    print("✅ Index sincronizado com PDFs")
