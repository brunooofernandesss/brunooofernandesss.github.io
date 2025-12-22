def atualizar_index(nome, caminho):
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    inicio = "<!-- QUIZZES_AUTOMATICOS_INICIO -->"
    fim = "<!-- QUIZZES_AUTOMATICOS_FIM -->"

    if inicio not in html or fim not in html:
        print("Marcadores não encontrados. Nenhuma alteração feita.")
        return

    novo_card = f'''
        <div class="card">
            <a href="{caminho}">{nome}</a>
        </div>
    '''

    bloco = html.split(inicio)[1].split(fim)[0]

    if novo_card.strip() in bloco:
        return  # já existe

    novo_bloco = bloco + novo_card

    html_novo = html.replace(
        inicio + bloco + fim,
        inicio + novo_bloco + fim
    )

    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html_novo)
