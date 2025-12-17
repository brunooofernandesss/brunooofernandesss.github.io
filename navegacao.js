document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. LÓGICA DE NAVEGAÇÃO (ANT/PROX) ---
    const cards = document.querySelectorAll('.card');
    let currentCard = 0;

    const btnAnt = document.getElementById('btnAnt');
    const btnProx = document.getElementById('btnProx');
    const btnHome = document.getElementById('btnHome');

    function showCard(index) {
        cards.forEach((card, i) => {
            card.style.display = i === index ? 'block' : 'none';
        });
        
        // Rola suavemente para o topo da questão
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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

    if (btnHome) {
        btnHome.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }

    // --- 2. LÓGICA DE CORREÇÃO (BLINDADA) ---
    
    // Tenta achar o botão de verificar por ID ou Classe
    const btnVerificar = document.getElementById('btnVerificar') || document.querySelector('.btn-verificar');

    if (btnVerificar) {
        btnVerificar.addEventListener('click', function() {
            let acertos = 0;
            let total = 0;
            
            // Seleciona todas as perguntas (divs com classe card)
            const questoes = document.querySelectorAll('.card');
            
            questoes.forEach(questao => {
                total++;
                
                // Procura a opção marcada (input radio checado)
                const opcaoSelecionada = questao.querySelector('input[type="radio"]:checked');
                
                // Procura a opção correta (pelo value="certa" ou atributo data-answer="true")
                // Isso cobre os dois formatos que você usa no site
                const opcaoCorreta = questao.querySelector('input[value="certa"]') || 
                                     questao.querySelector('input[data-answer="true"]') ||
                                     questao.querySelector('input[data-correta="true"]');

                // --- AQUI ESTÁ A CORREÇÃO DO ERRO DE 0% ---
                if (opcaoSelecionada) {
                    // O aluno marcou algo. Vamos ver se acertou.
                    
                    // Verifica se o valor é "certa" OU se tem o atributo data-answer='true'
                    if (opcaoSelecionada.value === "certa" || opcaoSelecionada.getAttribute('data-answer') === 'true') {
                        acertos++;
                        // Pinta o pai (label) de verde
                        if(opcaoSelecionada.parentElement) opcaoSelecionada.parentElement.style.backgroundColor = "#d4edda";
                    } else {
                        // Errou: Pinta de vermelho
                        if(opcaoSelecionada.parentElement) opcaoSelecionada.parentElement.style.backgroundColor = "#f8d7da";
                    }
                } else {
                    // SE ESTIVER EM BRANCO:
                    // Não faz nada (não soma ponto), mas o código NÃO TRAVA.
                    // Apenas segue para a próxima questão.
                }

                // Opcional: Sempre mostrar qual era a correta (mesmo se errou ou deixou em branco)
                if (opcaoCorreta && opcaoCorreta.parentElement) {
                    // Adiciona uma borda verde na resposta certa para o aluno saber qual era
                    opcaoCorreta.parentElement.style.border = "2px solid #28a745";
                }
            });

            // Mostra o alerta simples
            const notaFinal = ((acertos / total) * 100).toFixed(1);
            alert(`Você acertou ${acertos} de ${total} questões.\nAproveitamento: ${notaFinal}%`);

            // --- 3. INTEGRAÇÃO COM RANKING ---
            // Verifica se a função de salvar do Firebase existe antes de chamar
            if (typeof salvarResultadoNoFirebase === "function") {
                salvarResultadoNoFirebase(acertos, total);
            } else if (typeof calcularESalvarAutomatico === "function") {
                calcularESalvarAutomatico(acertos, total); // Nome antigo que usamos
            } else {
                console.log("Sistema de Ranking não detectado neste simulado.");
            }

        });
    }
});
