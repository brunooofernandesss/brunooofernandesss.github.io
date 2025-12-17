document.addEventListener('DOMContentLoaded', async function() {
    
    // Identificação da página atual (ex: 'simulado01.html')
    // Decodifica para lidar com espaços (%20) e acentos
    const pathAtual = decodeURIComponent(window.location.pathname.split('/').pop());
    const storageKey = 'progresso_maximo_' + pathAtual;

    // --- 1. SELEÇÃO DE ELEMENTOS ---
    const btnAnt = document.getElementById('btnAnt');
    const btnProx = document.getElementById('btnProx');
    const btnHome = document.getElementById('btnHome');
    
    // Seleciona os cards de questão (Layout de Lista Corrida)
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

    // --- 2. INTELIGÊNCIA DE NAVEGAÇÃO ENTRE QUIZZES (PLAYLIST) ---
    // Esta função lê o index.html para descobrir quem vem antes e depois
    
    async function configurarBotoesNavegacao() {
        if (!btnAnt && !btnProx) return;

        try {
            // 1. Busca o conteúdo do index.html
            const response = await fetch('index.html');
            const text = await response.text();
            
            // 2. Transforma texto em HTML virtual para ler os links
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            
            // 3. Pega todos os links que estão dentro de cards ou listas no index
            // Filtra apenas links que terminam em .html e não são o próprio index ou ranking
            const links = Array.from(doc.querySelectorAll('a'))
                .map(a => a.getAttribute('href'))
                .filter(href => href && href.includes('.html') && !href.includes('index.html') && !href.includes('ranking.html'));

            // 4. Limpa os links (remove ./ ou caminhos absolutos para comparar apenas nomes)
            const playlist = links.map(link => decodeURIComponent(link.split('/').pop()));

            // 5. Descobre onde estamos na lista
            const indiceAtual = playlist.indexOf(pathAtual);

            if (indiceAtual !== -1) {
                // Configura Botão ANTERIOR
                if (btnAnt) {
                    if (indiceAtual > 0) {
                        btnAnt.innerText = "Quiz Anterior"; // Muda o texto para ficar claro
                        btnAnt.onclick = () => window.location.href = links[indiceAtual - 1];
                    } else {
                        btnAnt.style.display = 'none'; // Se for o primeiro, esconde
                    }
                }

                // Configura Botão PRÓXIMO
                if (btnProx) {
                    if (indiceAtual < playlist.length - 1) {
                        btnProx.innerText = "Próximo Quiz"; // Muda o texto para ficar claro
                        btnProx.onclick = () => window.location.href = links[indiceAtual + 1];
                    } else {
                        btnProx.innerText = "Finalizar (Voltar ao Início)";
                        btnProx.onclick = () => window.location.href = "index.html";
                    }
                }
            } else {
                // Se a página atual não estiver no index, esconde os botões de navegação lateral
                if(btnAnt) btnAnt.style.display = 'none';
                if(btnProx) btnProx.innerText = "Voltar ao Menu";
                if(btnProx) btnProx.onclick = () => window.location.href = "index.html";
            }

        } catch (erro) {
            console.error("Erro ao carregar lista de quizzes do index:", erro);
        }
    }

    // Executa a configuração da playlist
    configurarBotoesNavegacao();


    // --- 3. INTELIGÊNCIA DE PROGRESSO (MÁXIMO ALCANÇADO) ---
    
    // Recupera o máximo anterior
    let maiorQuestaoRespondida = parseInt(localStorage.getItem(storageKey)) || -1;

    // Função inteligente: Só atualiza se o aluno foi MAIS LONGE do que antes
    function atualizarProgresso(index) {
        if (index > maiorQuestaoRespondida) {
            maiorQuestaoRespondida = index;
            localStorage.setItem(storageKey, maiorQuestaoRespondida);
        }
    }

    // Adiciona os "espiões" nas bolinhas
    cards.forEach((card, index) => {
        const inputs = card.querySelectorAll('input[type="radio"]');
        inputs.forEach(input => {
            input.addEventListener('change', () => atualizarProgresso(index));
        });
    });

    // --- 4. RECUPERAÇÃO (RESUME) ---
    // Verifica se existe progresso salvo
    if (maiorQuestaoRespondida > 0 && maiorQuestaoRespondida < cards.length) {
        // Pequeno delay para garantir que imagens carregaram
        setTimeout(() => {
            // A pergunta é: "Você avançou até a questão X. Quer ir lá?"
            const retomar = confirm(`Seu progresso salvo vai até a questão ${maiorQuestaoRespondida + 1}. Deseja rolar até lá?`);
            if (retomar) {
                cards[maiorQuestaoRespondida].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 600);
    }

    // Botão Home Padrão
    if (btnHome) {
        btnHome.addEventListener('click', () => {
            window.location.href = "index.html";
        });
    }

    // --- 5. LÓGICA DE CORREÇÃO (MANTIDA) ---
    const btnVerificar = document.getElementById('btnVerificar') || 
                         document.querySelector('.btn-verificar') ||
                         document.getElementById('verifyAnswersBtn');

    if (btnVerificar && btnVerificar.id !== 'verifyAnswersBtn') {
        btnVerificar.addEventListener('click', function() {
            let acertos = 0;
            let total = 0;
            
            cards.forEach(questao => {
                total++;
                const inputSelecionado = questao.querySelector('input[type="radio"]:checked');
                let ehCorreta = false;
                
                if (inputSelecionado) {
                    const valorInput = inputSelecionado.value;
                    const labelPai = inputSelecionado.parentElement; 
                    
                    if (valorInput === "certa" || 
                        inputSelecionado.getAttribute('data-answer') === 'true' || 
                        (labelPai && labelPai.getAttribute('data-answer') === 'true')) {
                        ehCorreta = true;
                    }

                    if (ehCorreta) {
                        acertos++;
                        if (labelPai) labelPai.style.backgroundColor = "#d4edda";
                    } else {
                        if (labelPai) labelPai.style.backgroundColor = "#f8d7da";
                    }
                }

                // Gabarito visual
                const inputCerto = questao.querySelector('input[value="certa"], input[data-answer="true"]');
                const labelCerto = questao.querySelector('label[data-answer="true"]');
                
                if (inputCerto && inputCerto.parentElement) {
                    inputCerto.parentElement.style.border = "2px solid #28a745";
                } else if (labelCerto) {
                    labelCerto.style.border = "2px solid #28a745";
                }
            });

            const notaFinal = total > 0 ? ((acertos / total) * 100).toFixed(1) : 0;
            alert(`Você acertou ${acertos} de ${total} questões.\nAproveitamento: ${notaFinal}%`);

            if (typeof salvarResultadoNoFirebase === "function") {
                salvarResultadoNoFirebase(acertos, total);
            } else if (typeof calcularESalvarAutomatico === "function") {
                calcularESalvarAutomatico(acertos, total);
            }
        });
    }
});
