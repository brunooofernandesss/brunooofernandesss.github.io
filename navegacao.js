document.addEventListener("DOMContentLoaded", function() {

    // 🛑 1. CHECAGEM DE SEGURANÇA (Proteção da Home)
    // Se estiver na Home (tem cardsContainer), o script para aqui.
    if (document.getElementById('cardsContainer')) {
        return; 
    }

    // --- 2. PREPARAÇÃO DO LAYOUT (LISTA INFINITA) ---
    // Seleciona todos os cards de questões, ignorando placares ou diagnósticos
    const allCards = document.querySelectorAll('.card');
    const cards = Array.from(allCards).filter(card => 
        !card.classList.contains('results') && 
        !card.classList.contains('generated-questions-section') &&
        !card.classList.contains('error-diagnosis-section')
    );
    // Garante que todas as questões apareçam (rolagem vertical)
    cards.forEach(card => card.style.display = 'block');


    // --- 3. CRIAÇÃO DOS BOTÕES FLUTUANTES (Seu código que funcionou) ---
    
    // Cria o estilo CSS dinamicamente
    const estilo = document.createElement('style');
    estilo.innerHTML = `
        .nav-float { 
            position: fixed; bottom: 20px; right: 20px; display: flex; gap: 10px; z-index: 99999; 
        }
        .btn-nav { 
            padding: 10px 15px; background: #4f46e5; color: white; text-decoration: none; 
            border-radius: 50px; font-family: sans-serif; font-weight: bold; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: 0.2s; font-size: 14px; 
            display: flex; align-items: center; border: 2px solid white; cursor: pointer;
        }
        .btn-nav:hover { background: #3730a3; transform: translateY(-2px); }
        .btn-home { background: #2c3e50; } 
        @media (max-width: 600px) { 
            .nav-float { bottom: 10px; right: 10px; left: 10px; justify-content: center; } 
            .btn-nav { flex: 1; justify-content: center; font-size: 13px; } 
        }
    `;
    document.head.appendChild(estilo);

    // Cria a barra de navegação no HTML
    const container = document.createElement('div');
    container.className = 'nav-float';
    
    // Botão Home
    const btnHome = document.createElement('a');
    btnHome.href = "index.html";
    btnHome.className = 'btn-nav btn-home';
    btnHome.innerHTML = '🏠 Home';
    container.appendChild(btnHome);
    
    document.body.appendChild(container);

    // --- 4. LÓGICA DE PLAYLIST (Descobre Ant/Prox lendo o Index) ---
    const urlAtual = window.location.pathname.split("/").pop();
    const arquivoAtual = decodeURIComponent(urlAtual);

    fetch("index.html")
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            // Pega links APENAS dos cards de simulados (ignora ranking)
            const links = Array.from(doc.querySelectorAll('.container .card a')).map(a => a.getAttribute('href'));
            
            const indexAtual = links.findIndex(link => decodeURIComponent(link) === arquivoAtual);

            if (indexAtual !== -1) {
                // Botão Anterior
                if (indexAtual > 0) {
                    const btnAnt = document.createElement('a');
                    btnAnt.href = links[indexAtual - 1];
                    btnAnt.className = 'btn-nav';
                    btnAnt.innerHTML = '⬅️ Ant';
                    container.insertBefore(btnAnt, btnHome);
                }
                // Botão Próximo
                if (indexAtual < links.length - 1) {
                    const btnProx = document.createElement('a');
                    btnProx.href = links[indexAtual + 1];
                    btnProx.className = 'btn-nav';
                    btnProx.innerHTML = 'Prox ➡️';
                    container.appendChild(btnProx);
                }
            }
        })
        .catch(err => console.log("Erro ao buscar links:", err));


    // --- 5. SISTEMA DE MEMÓRIA (Salvar onde parou) ---
    const storageKey = 'progresso_maximo_' + arquivoAtual;
    let maiorQuestaoRespondida = parseInt(localStorage.getItem(storageKey)) || -1;

    function atualizarProgresso(index) {
        if (index > maiorQuestaoRespondida) {
            maiorQuestaoRespondida = index;
            localStorage.setItem(storageKey, maiorQuestaoRespondida);
        }
    }

    cards.forEach((card, index) => {
        const inputs = card.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => {
            input.addEventListener('change', () => atualizarProgresso(index));
        });
    });

    // Pergunta se quer retomar
    if (maiorQuestaoRespondida > 0 && maiorQuestaoRespondida < cards.length) {
        setTimeout(() => {
            // Verifica se o usuário já não está lá embaixo (pra não perguntar à toa)
            if (window.scrollY < 100) {
                const retomar = confirm(`Você parou na questão ${maiorQuestaoRespondida + 1}. Quer rolar até lá?`);
                if (retomar) {
                    cards[maiorQuestaoRespondida].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 800);
    }


    // --- 6. CORREÇÃO BLINDADA (Resolve o Bug do 0% no Ranking) ---
    const btnVerificar = document.getElementById('btnVerificar') || 
                         document.querySelector('.btn-verificar') ||
                         document.getElementById('verifyAnswersBtn');

    // Só aplica a correção padrão se NÃO for o quiz avançado (que tem ID 'verifyAnswersBtn')
    // Se for o quiz avançado, ele usa a lógica dele mesmo (que você já consertou)
    if (btnVerificar && btnVerificar.id !== 'verifyAnswersBtn') {
        
        btnVerificar.addEventListener('click', function() {
            let acertos = 0;
            let total = 0;

            cards.forEach(questao => {
                total++; 
                const inputSelecionado = questao.querySelector('input[type="radio"]:checked');
                let acertouNessa = false;

                if (inputSelecionado) {
                    const valor = inputSelecionado.value;
                    const labelPai = inputSelecionado.parentElement;

                    // TRIPLA CHECAGEM (Manual + Gemini + Label)
                    if (
                        valor === "certa" || 
                        inputSelecionado.getAttribute('data-answer') === 'true' || 
                        (labelPai && labelPai.getAttribute('data-answer') === 'true')
                    ) {
                        acertouNessa = true;
                    }

                    // PINTURA
                    if (acertouNessa) {
                        acertos++;
                        if (labelPai) labelPai.style.backgroundColor = "#d4edda";
                    } else {
                        if (labelPai) labelPai.style.backgroundColor = "#f8d7da";
                    }
                }

                // GABARITO (Sempre mostra a certa)
                const inputCerto = questao.querySelector('input[value="certa"], input[data-answer="true"]');
                const labelCerto = questao.querySelector('label[data-answer="true"]');
                
                if (inputCerto && inputCerto.parentElement) {
                    inputCerto.parentElement.style.border = "2px solid #28a745";
                } else if (labelCerto) {
                    labelCerto.style.border = "2px solid #28a745";
                }
            });

            // RESULTADO
            const notaFinal = total > 0 ? ((acertos / total) * 100).toFixed(1) : 0;
            alert(`Você acertou ${acertos} de ${total} questões.\nAproveitamento: ${notaFinal}%`);

            // ENVIA PRO RANKING
            if (typeof salvarResultadoNoFirebase === "function") {
                salvarResultadoNoFirebase(acertos, total);
            } else if (typeof calcularESalvarAutomatico === "function") {
                calcularESalvarAutomatico(acertos, total);
            }
        });
    }
});
