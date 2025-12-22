import fitz  # PyMuPDF

def ler_pdf(caminho):
    texto = ""
    doc = fitz.open(caminho)
    for pagina in doc:
        texto += pagina.get_text()
    return texto
