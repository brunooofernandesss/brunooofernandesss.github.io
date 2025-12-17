document.addEventListener('DOMContentLoaded', async function() {
    
    // --- 1. IDENTIFICAÇÃO DA PÁGINA ---
    // Pega o nome do arquivo atual (ex: 'Modulo06 (1).html') e decodifica os %20
    let pathAtual = decodeURIComponent(window.location.pathname.split('/').pop());
    
    // Se estiver vazio (raiz) ou for index.html ou ranking.html, NÃO RODA O SCRIPT DE QUIZ
    if (pathAtual === "" || pathAtual === "index.html" || pathAtual === "ranking.html") {
        return; // Sai do script para não dar erro na Home
    }

    const storageKey = 'progresso_maximo_' + pathAtual;

    // --- 2. SELEÇÃO DE ELEMENTOS DO QUIZ ---
    const btnAnt = document.getElementById('btnAnt');
    const btnProx = document.getElementById('btnProx');
    const btnHome = document.getElementById('btnHome');
    
    // Seleciona os cards de questão (Lista Corrida)
    // Filtra para não pegar botões, placares ou áreas de diagnóstico
    const allCards = document.querySelectorAll('.card');
    const cards = Array.from(allCards).filter(card => 
        !card.contains(btnProx) && 
        !card.contains(btnAnt) && 
        !card.classList.contains('results') && 
        !card.classList.contains('generated-questions-section') &&
        !card.classList.contains('error-diagnosis-section')
    );

    // Garante que todas as questões apareçam (rolagem vertical)
    cards.forEach(card => card.style.display = 'block');

    // --- 3. CONFIGURAÇÃO AUTOMÁTICA DA PLAYLIST (Lendo seu Index) ---
    async function configurarBotoesNavegacao() {
        if (!btnAnt && !btnProx) return;

        try {
            // Busca o conteúdo do index.html
            const response = await fetch('index.html');
            if (!response.ok) throw new Error("Erro ao ler index");
            
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            // Pega APENAS os links que estão dentro da div .container (os cards de simulado)
            // Isso ignora o botão de Ranking que está no header
            const containerLinks = doc.querySelectorAll('.container .card a');
            
            // Cria a lista limpa de arquivos
            const playlist = Array.from(containerLinks)
                .map(a => a.getAttribute('href')) // Pega o href cru (ex: Modulo06%20(1).html)
                .filter(href => href && href.endsWith('.html')) // Garante que é HTML
                .map(href => decodeURIComponent(href)); // Decodifica para comparar (tira os %20)

            // Descobre em qual posição estamos
            const indiceAtual = playlist.indexOf(pathAtual);

            if (indiceAtual !== -1) {
                // Configura Botão ANTERIOR
                if (btnAnt) {
                    if (indiceAtual > 0) {
                        btnAnt.innerText = "Quiz Anterior";
                        // Re-codifica para URL correta ao clicar
                        btnAnt.onclick = () => window.location.href = encodeURI(playlist[indiceAtual - 1]);
                    } else {
                        btnAnt.style.display = 'none'; // Primeiro da lista
                    }
                }

                // Configura Botão PRÓXIMO
                if (btnProx) {
                    if (indiceAtual < playlist.length - 1) {
                        btnProx.innerText = "Próximo Quiz";
                        btnProx.onclick = () => window.location.href = encodeURI(playlist[indiceAtual + 1]);
                    } else {
                        btnProx.innerText = "Finalizar (Menu)";
                        btnProx.onclick = () => window.location.href = "index.html";
                    }
                }
            } else {
                // Se não achou na lista (ex: arquivo novo), joga pro menu
                if(btnProx) {
                    btnProx.innerText = "Voltar ao Menu";
                    btnProx.onclick = () => window.location.href = "index.html";
                }
                if(btnAnt) btnAnt.style.display = 'none';
            }

        } catch (erro) {
            console.error("Erro ao configurar playlist:", erro);
        }
    }

    // Executa a configuração
    configurarBotoesNavegacao();

    // --- 4. SISTEMA DE PROGRESSO (Onde Parei) ---
    let maiorQuestaoRespondida = parseInt(localStorage.getItem(storageKey)) || -1;

    function atualizarProgresso(index) {
        if (index > maiorQuestaoRespondida) {
            maiorQuestaoRespondida = index;
            localStorage.setItem(storageKey, maiorQuestaoRespondida);
        }
    }

    // Monitora os cliques nas bolinhas
    cards.forEach((card, index) => {
        const inputs = card.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => {
            input.addEventListener('change', () => atualizarProgresso(index));
        });
    });

    // Pergunta se quer retomar (com delay para carregar imagens)
    if (maiorQuestaoRespondida > 0 && maiorQuestaoRespondida < cards.length) {
        setTimeout(() => {
            const retomar = confirm(`Você já respondeu até a questão ${maiorQuestaoRespondida + 1}. Quer rolar até lá?`);
            if (retomar) {
                cards[maiorQuestaoRespondida].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 800);
    }

    // Botão Home
    if (btnHome) {
        btnHome.addEventListener('click', () => window.location.href = "index.html");
    }

    // --- 5. CORREÇÃO BLINDADA (Resolve o Bug do 0%) ---
    const btnVerificar = document.getElementById('btnVerificar') || 
                         document.querySelector('.btn-verificar') ||
                         document.getElementById('verifyAnswersBtn');

    // Só roda a correção padrão se NÃO for o quiz avançado (que tem ID específico)
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

                    // TRIPLA CHECAGEM DE RESPOSTA (Manual + Gemini)
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
                        if (labelPai) labelPai.style.backgroundColor = "#d4edda"; // Verde
                    } else {
                        if (labelPai) labelPai.style.backgroundColor = "#f8d7da"; // Vermelho
                    }
                }

                // GABARITO VISUAL (Sempre mostra a certa)
                const inputCerto = questao.querySelector('input[value="certa"], input[data-answer="true"]');
                const labelCerto = questao.querySelector('label[data-answer="true"]');
                
                if (inputCerto && inputCerto.parentElement) {
                    inputCerto.parentElement.style.border = "2px solid #28a745";
                } else if (labelCerto) {
                    labelCerto.style.border = "2px solid #28a745";
                }
            });

            // CÁLCULO DA NOTA
            const notaFinal = total > 0 ? ((acertos / total) * 100).toFixed(1) : 0;
            alert(`Você acertou ${acertos} de ${total} questões.\nAproveitamento: ${notaFinal}%`);

            // SALVAR NO FIREBASE
            if (typeof salvarResultadoNoFirebase === "function") {
                salvarResultadoNoFirebase(acertos, total);
            } else if (typeof calcularESalvarAutomatico === "function") {
                calcularESalvarAutomatico(acertos, total);
            }
        });
    }
});
