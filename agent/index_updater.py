def atualizar_index(titulo, caminho):
    novo_card = f'''
        <div class="card">
            <a href="{caminho}">{titulo}</a>
        </div>
'''

    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # Evita duplicação
    if caminho in html:
        return

    inicio = "<!-- QUIZZES_AUTOMATICOS_INICIO -->"
    fim = "<!-- QUIZZES_AUTOMATICOS_FIM -->"

    if inicio not in html or fim not in html:
        raise Exception("Marcadores de quizzes automáticos não encontrados no index.html")

    antes, resto = html.split(inicio)
    meio, depois = resto.split(fim)

    meio = meio.strip() + novo_card

    novo_html = antes + inicio + "\n" + meio + "\n" + fim + depois

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(novo_html)
