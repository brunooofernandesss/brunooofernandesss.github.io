import json

def criar_html(nome, quiz_json):
    quiz = json.loads(quiz_json)

    perguntas = ""
    respostas = []

    for i, q in enumerate(quiz):
        respostas.append(q["correta"])
        perguntas += f"<p>{i+1}. {q['pergunta']}</p>"
        for j, alt in enumerate(q["alternativas"]):
            perguntas += f"""
            <label>
              <input type="radio" name="q{i}" value="{j}">
              {alt}
            </label><br>
            """
        perguntas += "<hr>"

    return f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>{nome}</title>
</head>
<body>

<h1>{nome}</h1>

<form>
{perguntas}
<button type="button" onclick="verificar()">Verificar</button>
</form>

<script>
const respostas = {respostas};

function verificar() {{
  let acertos = 0;
  respostas.forEach((c, i) => {{
    const r = document.querySelector(`input[name="q${{i}}"]:checked`);
    if (r && parseInt(r.value) === c) acertos++;
  }});
  alert("Acertos: " + acertos + "/" + respostas.length);
}}
</script>

</body>
</html>
"""
