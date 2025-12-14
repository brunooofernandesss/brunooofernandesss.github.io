// conexao_firebase.js - Versão Inteligente (Auto-Cálculo)

// Importa Firebase
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>');
document.write('<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics-compat.js"></script>');

window.addEventListener('load', function() {
    // 1. CONFIGURAÇÃO (Suas Chaves)
    const firebaseConfig = {
        apiKey: "AIzaSyDj-c4uArNjAr7cSg396yfQR6xuyumh5_M",
        authDomain: "simuladosmedicina-6a01b.firebaseapp.com",
        projectId: "simuladosmedicina-6a01b",
        storageBucket: "simuladosmedicina-6a01b.firebasestorage.app",
        messagingSenderId: "577452734306",
        appId: "1:577452734306:web:5926d087a27a216a97de3b",
        measurementId: "G-F125W28J18"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();
    const analytics = firebase.analytics();

    // 2. O ESPIÃO DE BOTÃO 🕵️‍♂️
    // Procura o botão de verificar respostas
    const btnVerificar = document.getElementById("verifyAnswersBtn");

    if (btnVerificar) {
        console.log("🔥 Firebase pronto para capturar nota.");
        
        // Adiciona um "ouvinte" extra ao clique do botão
        btnVerificar.addEventListener("click", function() {
            // Espera 1 segundo para o site corrigir e pintar as respostas de verde/vermelho
            setTimeout(() => {
                calcularESalvarAutomatico(db);
            }, 1000); 
        });
    }
});

function calcularESalvarAutomatico(db) {
    // Tenta descobrir a nota contando as classes CSS que o seu site usa
    // Geralmente os templates adicionam uma classe quando a resposta está certa
    // Ajuste "correct" ou "acerto" conforme o CSS do seu site
    
    // Procura elementos que ficaram verdes (corretos)
    // OBS: Como não vi seu CSS, estou chutando que ele usa a cor verde ou classe 'correct'
    // Se não funcionar, me avise para ajustarmos esse seletor!
    
    // Contagem genérica:
    let totalQuestoes = document.querySelectorAll('.card').length || document.querySelectorAll('.question').length;
    
    // Tenta achar onde o resultado escrito apareceu (Ex: "Você acertou 5 de 10")
    let textoResultado = document.body.innerText.match(/acertou (\d+) de (\d+)/i) || 
                         document.body.innerText.match(/Score: (\d+)\/(\d+)/i);

    let acertos = 0;

    if (textoResultado) {
        // Se achou o texto escrito na tela, confia nele
        acertos = parseInt(textoResultado[1]);
        if (!totalQuestoes) totalQuestoes = parseInt(textoResultado[2]);
    } else {
        // Se não achou texto, pergunta ao aluno (Fallback seguro)
        // Isso garante que funcione mesmo se o "robô" não conseguir ler a tela
        const inputNota = prompt("O sistema não leu a nota automática.\nQuantas questões você acertou?");
        if(inputNota) acertos = parseInt(inputNota);
        else return; // Cancelou
    }

    if (totalQuestoes > 0) {
        salvarNoBanco(db, acertos, totalQuestoes);
    }
}

function salvarNoBanco(db, acertos, total) {
    const nome = prompt("📝 Registro de Simulados\nDigite seu Nome ou Matrícula:");
    if (!nome) return;

    db.collection("resultados_alunos").add({
        aluno: nome,
        nota: acertos,
        total: total,
        porcentagem: ((acertos/total)*100).toFixed(0) + "%",
        simulado: document.title,
        data: new Date().toLocaleString("pt-BR")
    }).then(() => alert("✅ Nota Salva com Sucesso!"));
}
