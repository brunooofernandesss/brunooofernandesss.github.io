def atualizar_index(nome, quiz_path):
    index_path = "index.html"

    with open(index_path, "r", encoding="utf-8") as f:
        html = f.read()

    inicio = "<!-- QUIZZES_AUTOMATICOS_INICIO -->"
    fim = "<!-- QUIZZES_AUTOMATICOS_FIM -->"

    if inicio not in html or fim not in html:
        raise Exception("Marcadores de quizzes automáticos não encontrados no index.html")

    novo_card = f"""
        <div class="card">
            <a href="{quiz_path}">{nome}</a>
        </div>
    """

    bloco_atual = html.split(inicio)[1].split(fim)[0]

    # Evita duplicar
    if quiz_path in bloco_atual:
        print("Quiz já está no index.")
        return

    novo_bloco = bloco_atual + novo_card

    html_final = html.replace(
        inicio + bloco_atual + fim,
        inicio + novo_bloco + fim
    )

    with open(index_path, "w", encoding="utf-8") as f:
        f.write(html_final)

    print(f"Index atualizado com quiz: {nome}")
