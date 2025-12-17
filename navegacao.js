document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. LÓGICA DE NAVEGAÇÃO (ANT/PROX) ---
    const btnAnt = document.getElementById('btnAnt');
    const btnProx = document.getElementById('btnProx');
    const btnHome = document.getElementById('btnHome');
    
    // Seleciona APENAS os cards que são questões (ignora cards de navegação/botões)
    // Filtramos para pegar apenas cards que NÃO contenham o botão 'btnProx' dentro deles
    const allCards = document.querySelectorAll('.card');
    const cards = Array.from(allCards).filter(card => !card.contains(btnProx) && !card.contains(btnAnt));

    // Se existirem botões E cards de questão, ativa o modo slide
    if ((btnAnt || btnProx) && cards.length > 0) {
        let currentCard = 0;

        function showCard(index) {
            cards.forEach((card, i) => {
                card.style.display = i === index ? 'block' : 'none';
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Inicia mostrando o primeiro
        showCard(currentCard);

        if (btnAnt) {
            btnAnt.addEventListener('click', () => {
                if (currentCard > 0) {
                    currentCard--;
                    showCard(currentCard);
                }
            });
        }

        if (btnProx) {
            btnProx.addEventListener('click', () => {
                if (currentCard < cards.length - 1) {
                    currentCard++;
                    showCard(currentCard);
                }
            });
        }
    }

    if (btnHome) {
        btnHome.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }

    // --- 2. LÓGICA DE CORREÇÃO (CORRIGIDA PARA GEMINI) ---
    const btnVerificar = document.getElementById('btnVerificar') || document.querySelector('.btn-verificar');

    if (btnVerificar) {
        btnVerificar.addEventListener('click', function() {
            let acertos = 0;
            let total = 0;
            
            // Usa a mesma lista filtrada de cards (questões)
            cards.forEach(questao => {
                total++;
                
                // 1. Pega a bolinha marcada
                const inputSelecionado = questao.querySelector('input[type="radio"]:checked');
                
                // 2. Procura ONDE está a marca de 'certa' (pode estar no input OU no label pai)
                let ehCorreta = false;
                
                if (inputSelecionado) {
                    const valorInput = inputSelecionado.value;
                    const labelPai = inputSelecionado.parentElement; // O elemento <label> em volta
                    
                    // Verifica 3 lugares: 
                    // A. Valor do input é "certa"
                    // B. O input tem data-answer="true"
                    // C. O LABEL pai tem data-answer="true" (Padrão Gemini)
                    if (valorInput === "certa" || 
                        inputSelecionado.getAttribute('data-answer') === 'true' || 
                        (labelPai && labelPai.getAttribute('data-answer') === 'true')) {
                        ehCorreta = true;
                    }

                    // PINTURA (Feedback Visual)
                    if (ehCorreta) {
                        acertos++;
                        if (labelPai) labelPai.style.backgroundColor = "#d4edda"; // Verde
                    } else {
                        if (labelPai) labelPai.style.backgroundColor = "#f8d7da"; // Vermelho
                    }
                }

                // 3. SEMPRE MOSTRAR QUAL ERA A CERTA (Gabarito Visual)
                // Procura inputs ou labels que tenham a marca de correta
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

            // ENVIA PRO RANKING (Se existir a função)
            if (typeof salvarResultadoNoFirebase === "function") {
                salvarResultadoNoFirebase(acertos, total);
            } else if (typeof calcularESalvarAutomatico === "function") {
                calcularESalvarAutomatico(acertos, total);
            }
        });
    }
});
