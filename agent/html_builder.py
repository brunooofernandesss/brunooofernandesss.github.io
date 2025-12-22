def criar_html(titulo, quiz_texto):
    return f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{titulo}</title>
</head>
<body>
<h1>{titulo}</h1>
<pre>{quiz_texto}</pre>
</body>
</html>
"""
