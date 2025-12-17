document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. LÓGICA DE NAVEGAÇÃO (ANT/PROX) ---
    // Verifica se os botões de navegação existem na página
    const btnAnt = document.getElementById('btnAnt');
    const btnProx = document.getElementById('btnProx');
    const btnHome = document.getElementById('btnHome');
    
    // Seleciona os cards
    const cards = document.querySelectorAll('.card');

    // TRAVA DE SEGURANÇA:
    // Só ativa o modo "Slideshow" (esconder cards) se existirem botões de navegação (btnAnt/btnProx).
    // Se não tiver botões (como na página inicial), ele deixa tudo visível.
    if (btnAnt || btnProx) {
        let currentCard = 0;

        function showCard(index) {
            cards.forEach((card, i) => {
                card.style.display = i === index ? 'block' : 'none';
            });
            // Rola suavemente para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Inicia mostrando apenas o primeiro card
        if (cards.length > 0) {
            showCard(currentCard);
        }

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

    // Botão Home funciona em qualquer lugar
    if (btnHome) {
        btnHome.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }

    // --- 2. LÓGICA DE CORREÇÃO (BLINDADA) ---
    const btnVerificar = document.getElementById('btnVerificar') || document.querySelector('.btn-verificar');

    if (btnVerificar) {
        btnVerificar.addEventListener('click', function() {
            let acertos = 0;
            let total = 0;
            
            const questoes = document.querySelectorAll('.card');
            
            questoes.forEach(questao => {
                total++;
                const opcaoSelecionada = questao.querySelector('input[type="radio"]:checked');
                
                const opcaoCorreta = questao.querySelector('input[value="certa"]') || 
                                     questao.querySelector('input[data-answer="true"]') ||
                                     questao.querySelector('input[data-correta="true"]');

                if (opcaoSelecionada) {
                    if (opcaoSelecionada.value === "certa" || opcaoSelecionada.getAttribute('data-answer') === 'true') {
                        acertos++;
                        if(opcaoSelecionada.parentElement) opcaoSelecionada.parentElement.style.backgroundColor = "#d4edda";
                    } else {
                        if(opcaoSelecionada.parentElement) opcaoSelecionada.parentElement.style.backgroundColor = "#f8d7da";
                    }
                }

                if (opcaoCorreta && opcaoCorreta.parentElement) {
                    opcaoCorreta.parentElement.style.border = "2px solid #28a745";
                }
            });

            const notaFinal = ((acertos / total) * 100).toFixed(1);
            alert(`Você acertou ${acertos} de ${total} questões.\nAproveitamento: ${notaFinal}%`);

            // Salva no Ranking se possível
            if (typeof salvarResultadoNoFirebase === "function") {
                salvarResultadoNoFirebase(acertos, total);
            } else if (typeof calcularESalvarAutomatico === "function") {
                calcularESalvarAutomatico(acertos, total);
            }
        });
    }
});
