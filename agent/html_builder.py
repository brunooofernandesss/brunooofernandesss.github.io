def criar_html(titulo, conteudo):
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>{titulo}</title>
</head>
<body>
    <h1>{titulo}</h1>

    <pre>
{conteudo}
    </pre>

</body>
</html>
"""
