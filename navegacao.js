document.addEventListener('DOMContentLoaded', async function() {  
      
    // 🛑 1. PROTEÇÃO DA HOME (Não roda no index)  
    if (document.getElementById('cardsContainer')) return;  
  
    // --- VARIÁVEIS GERAIS ---  
    const pathAtual = decodeURIComponent(window.location.pathname.split('/').pop());  
    const storageKey = 'progresso_maximo_' + pathAtual;  
      
    // --- 2. PREPARAÇÃO VISUAL (Botões Flutuantes + Lista) ---  
    // Cria estilo dos botões flutuantes  
    const estilo = document.createElement('style');  
    estilo.innerHTML = `  
        .nav-float { position: fixed; bottom: 20px; right: 20px; display: flex; gap: 10px; z-index: 99999; }  
        .btn-nav { padding: 10px 15px; background: #4f46e5; color: white; text-decoration: none; border-radius: 50px; font-family: sans-serif; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: 0.2s; font-size: 14px; display: flex; align-items: center; border: 2px solid white; cursor: pointer; }  
        .btn-nav:hover { background: #3730a3; transform: translateY(-2px); }  
        .btn-home { background: #2c3e50; }   
        @media (max-width: 600px) { .nav-float { bottom: 10px; right: 10px; left: 10px; justify-content: center; } .btn-nav { flex: 1; justify-content: center; font-size: 13px; } }  
    `;  
    document.head.appendChild(estilo);  
  
    // Cria container e botão Home  
    const container = document.createElement('div');  
    container.className = 'nav-float';  
    const btnHome = document.createElement('a');  
    btnHome.href = "index.html";  
    btnHome.className = 'btn-nav btn-home';  
    btnHome.innerHTML = '🏠 Home';  
    container.appendChild(btnHome);  
    document.body.appendChild(container);  
  
    // Mostra todas as questões (para simulados tipo lista)  
    document.querySelectorAll('.card').forEach(card => {  
        if (!card.classList.contains('results') && !card.classList.contains('generated-questions-section') && !card.classList.contains('error-diagnosis-section')) {  
            card.style.display = 'block';  
        }  
    });  
  
    // --- 3. PLAYLIST (Ant/Prox automático lendo o Index) ---  
    fetch("index.html")  
        .then(res => res.text())  
        .then(html => {  
            const parser = new DOMParser();  
            const doc = parser.parseFromString(html, 'text/html');  
            const links = Array.from(doc.querySelectorAll('.container .card a')).map(a => a.getAttribute('href'));  
            const indexAtual = links.findIndex(link => decodeURIComponent(link) === pathAtual);  
  
            if (indexAtual !== -1) {  
                if (indexAtual > 0) {  
                    const btnAnt = document.createElement('a');  
                    btnAnt.href = links[indexAtual - 1];  
                    btnAnt.className = 'btn-nav';  
                    btnAnt.innerHTML = '⬅️ Ant';  
                    container.insertBefore(btnAnt, btnHome);  
                }  
                if (indexAtual < links.length - 1) {  
                    const btnProx = document.createElement('a');  
                    btnProx.href = links[indexAtual + 1];  
                    btnProx.className = 'btn-nav';  
                    btnProx.innerHTML = 'Prox ➡️';  
                    container.appendChild(btnProx);  
                }  
            }  
        }).catch(e => console.log("Erro playlist", e));  
  
  
    // --- 4. MEMÓRIA DE PROGRESSO ---  
    let maiorQuestao = parseInt(localStorage.getItem(storageKey)) || -1;  
    function salvarProgresso(i) {  
        if (i > maiorQuestao) { maiorQuestao = i; localStorage.setItem(storageKey, i); }  
    }  
    // Ouve cliques em radios (novos) ou cards (antigos)  
    document.querySelectorAll('.card').forEach((card, index) => {  
        card.addEventListener('click', () => salvarProgresso(index));  
    });  
    // Retomar  
    if (maiorQuestao > 0) {  
        setTimeout(() => {  
            if (window.scrollY < 100 && confirm(`Retomar da questão ${maiorQuestao + 1}?`)) {  
                document.querySelectorAll('.card')[maiorQuestao].scrollIntoView({behavior: 'smooth', block: 'center'});  
            }  
        }, 1000);  
    }  
  
  
    // ============================================================  
    // 5. O CONSERTADOR DE SIMULADOS ANTIGOS (Legacy Handler) 🛠️  
    // ============================================================  
    const btnAntigo = document.getElementById('submit'); // O botão dos módulos 1, 2, 3...  
      
    if (btnAntigo) {  
        console.log("Modo Simulado Antigo Ativado");  
        btnAntigo.addEventListener('click', function() {  
            // Espera 500ms para o script antigo calcular e escrever na tela  
            setTimeout(() => {  
                const divResultado = document.getElementById('results');  
                if (divResultado && divResultado.textContent) {  
                    // O texto é: "Você acertou X de Y questões."  
                    // Usamos Regex para capturar os números X e Y  
                    const numeros = divResultado.textContent.match(/acertou (\d+) de (\d+)/);  
                      
                    if (numeros) {  
                        const acertos = parseInt(numeros[1]);  
                        const total = parseInt(numeros[2]);  
                          
                        // Chama o Firebase (que já está na página)  
                        if (typeof salvarResultadoNoFirebase === "function") {  
                            salvarResultadoNoFirebase(acertos, total);  
                            console.log(`Salvo via Espião: ${acertos}/${total}`);  
                            alert("Nota salva no Ranking com sucesso! 🏆");  
                        } else {  
                            console.error("Conexão Firebase não encontrada.");  
                        }  
                    }  
                }  
            }, 500); // Meio segundo de delay é suficiente  
        });  
    }  
  
    // --- 6. CORREÇÃO DOS SIMULADOS NOVOS (Mantido) ---  
    const btnNovo = document.getElementById('btnVerificar') || document.querySelector('.btn-verificar') || document.getElementById('verifyAnswersBtn');  
      
    // Só roda se for botão novo E não for o avançado (verifyAnswersBtn)  
    if (btnNovo && btnNovo.id !== 'verifyAnswersBtn') {  
        btnNovo.addEventListener('click', function() {  
            let acertos = 0, total = 0;  
            const cards = document.querySelectorAll('.card'); // Recaptura para garantir  
              
            cards.forEach(card => {  
                // Ignora cards de sistema  
                if(card.classList.contains('results') || card.style.display === 'none') return;  
                  
                total++;  
                const input = card.querySelector('input:checked');  
                if (input) {  
                    // Lógica unificada de acerto  
                    const isCorrect = input.value === "certa" ||   
                                      input.getAttribute('data-answer') === 'true' ||   
                                      (input.parentElement && input.parentElement.getAttribute('data-answer') === 'true');  
                      
                    if (isCorrect) {  
                        acertos++;  
                        if(input.parentElement) input.parentElement.style.backgroundColor = "#d4edda";  
                    } else {  
                        if(input.parentElement) input.parentElement.style.backgroundColor = "#f8d7da";  
                    }  
                }  
                // Gabarito  
                const certo = card.querySelector('[data-answer="true"], [value="certa"]');  
                if (certo && certo.tagName === 'INPUT') certo.parentElement.style.border = "2px solid #28a745";  
                else if (certo) certo.style.border = "2px solid #28a745";  
            });  
  
            if(total > 0) {  
                alert(`Você acertou ${acertos} de ${total}.`);  
                if (typeof salvarResultadoNoFirebase === "function") salvarResultadoNoFirebase(acertos, total);  
            }  
        });  
    }  
});
