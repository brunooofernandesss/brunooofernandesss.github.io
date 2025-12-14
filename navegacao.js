document.addEventListener("DOMContentLoaded", function() {
    // 🛑 1. CHECAGEM DE SEGURANÇA (O Pulo do Gato)
    // Se a página tiver o container de cards, significa que estamos na Home (index.html).
    // Nesse caso, PARAMOS O SCRIPT AQUI. Não cria botão, não faz nada.
    if (document.getElementById('cardsContainer')) {
        return; 
    }

    // Se chegou aqui, é porque NÃO é a Home (é um simulado). Pode criar os botões!

    // 2. CRIA O ESTILO DOS BOTÕES
    const estilo = document.createElement('style');
    estilo.innerHTML = `
        .nav-float { 
            position: fixed; bottom: 20px; right: 20px; display: flex; gap: 10px; z-index: 99999; 
        }
        .btn-nav { 
            padding: 10px 15px; background: #4f46e5; color: white; text-decoration: none; 
            border-radius: 50px; font-family: sans-serif; font-weight: bold; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: 0.2s; font-size: 14px; 
            display: flex; align-items: center; border: 2px solid white;
        }
        .btn-nav:hover { background: #3730a3; transform: translateY(-2px); }
        .btn-home { background: #2c3e50; } 
        @media (max-width: 600px) { 
            .nav-float { bottom: 10px; right: 10px; left: 10px; justify-content: center; } 
            .btn-nav { flex: 1; justify-content: center; font-size: 13px; } 
        }
    `;
    document.head.appendChild(estilo);

    // 3. CRIA A BARRA DE NAVEGAÇÃO
    const container = document.createElement('div');
    container.className = 'nav-float';
    
    // Botão Home (Sempre aparece nos simulados)
    const btnHome = document.createElement('a');
    btnHome.href = "index.html";
    btnHome.className = 'btn-nav btn-home';
    btnHome.innerHTML = '🏠 Home';
    container.appendChild(btnHome);
    
    // Insere na página
    document.body.appendChild(container);

    // 4. LÓGICA DE PRÓXIMO / ANTERIOR
    // Busca o index.html para saber a ordem dos simulados
    const paginaHome = "index.html";
    
    // Tenta pegar o nome do arquivo atual da URL
    // Decodifica para lidar com espaços e acentos (ex: Módulo%2001.html vira Módulo 01.html)
    const urlAtual = window.location.pathname.split("/").pop();
    const arquivoAtual = decodeURIComponent(urlAtual);

    fetch(paginaHome)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // Pega todos os links dentro dos cards
            const links = Array.from(doc.querySelectorAll('.container .card a')).map(a => a.getAttribute('href'));
            
            // Procura onde o arquivo atual está na lista
            // Comparamos os textos decodificados para garantir que acentos batam
            const indexAtual = links.findIndex(link => decodeURIComponent(link) === arquivoAtual);

            if (indexAtual !== -1) {
                // Adiciona Anterior (se não for o primeiro)
                if (indexAtual > 0) {
                    const btnAnt = document.createElement('a');
                    btnAnt.href = links[indexAtual - 1];
                    btnAnt.className = 'btn-nav';
                    btnAnt.innerHTML = '⬅️ Ant';
                    container.insertBefore(btnAnt, btnHome); // Coloca antes do Home
                }
                // Adiciona Próximo (se não for o último)
                if (indexAtual < links.length - 1) {
                    const btnProx = document.createElement('a');
                    btnProx.href = links[indexAtual + 1];
                    btnProx.className = 'btn-nav';
                    btnProx.innerHTML = 'Prox ➡️';
                    container.appendChild(btnProx); // Coloca depois do Home
                }
            }
        })
        .catch(err => console.log("Erro ao buscar links:", err));
});
