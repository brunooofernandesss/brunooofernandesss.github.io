document.addEventListener('DOMContentLoaded', async function() {
    
    // Identificação da página atual
    const pathAtual = decodeURIComponent(window.location.pathname.split('/').pop());
    const storageKey = 'progresso_maximo_' + pathAtual;

    // --- 1. SELEÇÃO DE ELEMENTOS ---
    const btnAnt = document.getElementById('btnAnt');
    const btnProx = document.getElementById('btnProx');
    const btnHome = document.getElementById('btnHome');
    
    // Seleciona os cards de questão (Lista Corrida)
    const allCards = document.querySelectorAll('.card');
    const cards = Array.from(allCards).filter(card => 
        !card.contains(btnProx) && 
        !card.contains(btnAnt) && 
        !card.classList.contains('results') &&
        !card.classList.contains('generated-questions-section') &&
        !card.classList.contains('error-diagnosis-section')
    );

    // Garante que todas apareçam
    cards.forEach(card => card.style.display = 'block');

    // --- 2. PLAYLIST (ÍNDICE AUTOMÁTICO) ---
    async function configurarBotoesNavegacao() {
        if (!btnAnt && !btnProx) return;

        try {
            const response = await fetch('index.html');
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            const links = Array.from(doc.querySelectorAll('a'))
                .map(a => a.getAttribute('href'))
                .filter(href => href && href.includes('.html') && !href.includes('index.html') && !href.includes('ranking.html'));

            const playlist = links.map(link => decodeURIComponent(link.split('/').pop()));
            const indiceAtual = playlist.indexOf(pathAtual);

            if (indiceAtual !== -1) {
                if (btnAnt) {
                    if (indiceAtual > 0) {
                        btnAnt.innerText = "Quiz Anterior";
                        btnAnt.onclick = () => window.location.href = links[indiceAtual - 1];
                    } else {
                        btnAnt.style.display = 'none';
                    }
                }
                if (btnProx) {
                    if (indiceAtual < playlist.length - 1) {
                        btnProx.innerText = "Próximo Quiz";
                        btnProx.onclick = () => window.location.href = links[indiceAtual + 1];
                    } else {
                        btnProx.innerText = "Finalizar (Menu)";
                        btnProx.onclick = () => window.location.href = "index.html";
                    }
                }
            } else {
                if(btnAnt) btnAnt.style.display = 'none';
                if(btnProx) btnProx.innerText = "Voltar ao Menu";
                if(btnProx) btnProx.onclick = () => window.location.href = "index.html";
            }
        } catch (erro) {
            console.error("Erro playlist:", erro);
        }
    }
    configurarBotoesNavegacao();

    // --- 3. PROGRESSO (ONDE PAREI) ---
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

    if (maiorQuestaoRespondida > 0 && maiorQuestaoRespondida < cards.length) {
        setTimeout(() => {
            const retomar = confirm(`Você avançou até a questão ${maiorQuestaoRespondida + 1}. Quer rolar até lá?`);
            if (retomar) {
                cards[maiorQuestaoRespondida].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 600);
    }

    if (btnHome) {
        btnHome.addEventListener('click', () => window.location.href = "index.html");
    }

    // --- 4. CORREÇÃO BLINDADA (A SOLUÇÃO DO 0%) ---
    const btnVerificar = document.getElementById('btnVerificar') || 
                         document.querySelector('.btn-verificar') ||
                         document.getElementById('verifyAnswersBtn');

    // Verifica se existe botão e se NÃO é o quiz avançado (que tem lógica própria)
    if (btnVerificar && btnVerificar.id !== 'verifyAnswersBtn') {
        
        btnVerificar.addEventListener('click', function() {
            let acertos = 0;
            let total = 0;
            let respondidas = 0; // Só para log/controle

            cards.forEach(questao => {
                total++; // Conta +1 questão para o total

                // 1. Tenta achar o que o aluno marcou
                const inputSelecionado = questao.querySelector('input[type="radio"]:checked');
                
                // 2. Prepara para descobrir se acertou
                let acertouNessa = false;

                if (inputSelecionado) {
                    respondidas++;
                    const valor = inputSelecionado.value;
                    const labelPai = inputSelecionado.parentElement;

                    // TRIPLA VERIFICAÇÃO DE ACERTO (Resolve o problema do Gemini vs Manual)
                    if (
                        valor === "certa" || // Método antigo
                        inputSelecionado.getAttribute('data-answer') === 'true' || // Método novo input
                        (labelPai && labelPai.getAttribute('data-answer') === 'true') // Método novo label
                    ) {
                        acertouNessa = true;
                    }

                    // Feedback Visual (Pintura)
                    if (acertouNessa) {
                        acertos++;
                        if (labelPai) labelPai.style.backgroundColor = "#d4edda"; // Verde
                    } else {
                        if (labelPai) labelPai.style.backgroundColor = "#f8d7da"; // Vermelho
                    }
                }

                // 3. Gabarito Visual (Sempre mostra a correta, mesmo se pulou)
                const inputCerto = questao.querySelector('input[value="certa"], input[data-answer="true"]');
                const labelCerto = questao.querySelector('label[data-answer="true"]');
                
                if (inputCerto && inputCerto.parentElement) {
                    inputCerto.parentElement.style.border = "2px solid #28a745";
                } else if (labelCerto) {
                    labelCerto.style.border = "2px solid #28a745";
                }
            });

            // CÁLCULO FINAL SEGURO
            // Se total for 0 (erro de carregamento), nota é 0 para não dividir por zero.
            const notaFinal = total > 0 ? ((acertos / total) * 100).toFixed(1) : 0;
            
            alert(`Você acertou ${acertos} de ${total} questões.\n(Respondidas: ${respondidas})\nAproveitamento: ${notaFinal}%`);

            // ENVIO PARA O FIREBASE (RANKING)
            if (typeof salvarResultadoNoFirebase === "function") {
                salvarResultadoNoFirebase(acertos, total);
            } else if (typeof calcularESalvarAutomatico === "function") {
                calcularESalvarAutomatico(acertos, total);
            } else {
                console.log("Sistema de Ranking offline neste quiz.");
            }
        });
    }
});
