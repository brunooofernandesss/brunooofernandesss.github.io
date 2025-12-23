import { auth } from './firebase.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// --- 1. CSS BLINDADO (Fixação e Layout) ---
const style = document.createElement('style');
style.textContent = `
    /* RESET GERAL */
    html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: auto !important;
        background-color: #f3f4f6 !important;
        font-family: 'Inter', -apple-system, sans-serif !important;
        overflow-x: hidden !important; /* Evita rolagem lateral indesejada */
    }

    /* NAVBAR FIXA NO TOPO (A solução do problema) */
    .navbar {
        position: fixed !important; /* Fixa na tela */
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 64px !important;
        background-color: #ffffff !important;
        border-bottom: 1px solid #e5e7eb !important;
        padding: 0 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        z-index: 99999 !important; /* Garante que fique acima de tudo */
        box-sizing: border-box !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.03) !important;
    }

    /* ESPAÇAMENTO PARA O CONTEÚDO NÃO FICAR ESCONDIDO ATRÁS DA BARRA */
    body {
        padding-top: 84px !important; /* 64px da barra + 20px de respiro */
    }

    /* ESTILOS DA NAVBAR */
    .navbar-brand {
        font-weight: 700; font-size: 1.125rem; color: #0f172a;
        text-decoration: none; display: flex; align-items: center; gap: 10px;
    }
    .navbar-brand i { color: #2563eb; }

    .user-profile {
        display: flex; align-items: center; gap: 12px;
        padding: 6px 12px; border-radius: 6px; cursor: default;
        transition: background 0.2s;
    }
    .user-profile:hover { background-color: #f9fafb; }

    .user-avatar {
        width: 32px; height: 32px; background-color: #0f172a; color: white;
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        font-size: 0.875rem; font-weight: 600;
    }

    .user-info-text { display: flex; flex-direction: column; line-height: 1.2; text-align: right; }
    .user-name { font-size: 0.875rem; font-weight: 600; color: #111827; }
    .user-meta { font-size: 0.75rem; color: #6b7280; }

    /* LAYOUT DO CONTEÚDO (Simulado) */
    .quiz-container {
        max-width: 800px;
        width: 100%;
        margin: 0 auto 40px auto !important; /* Centraliza */
        padding: 0 20px !important;
        box-sizing: border-box !important;
        position: relative !important;
        z-index: 1 !important; /* Fica abaixo da navbar */
    }

    /* TAGS DE NAVEGAÇÃO */
    .nav-tags {
        display: flex; gap: 8px; margin-bottom: 24px; justify-content: center; flex-wrap: wrap;
    }
    .nav-tag {
        display: inline-flex; align-items: center; padding: 6px 12px;
        background-color: transparent; border-radius: 4px;
        color: #6b7280; font-size: 0.85rem; font-weight: 500;
        text-decoration: none; transition: all 0.15s ease;
    }
    .nav-tag:hover { color: #111827; background-color: rgba(0, 0, 0, 0.05); }
    .nav-tag.active { background-color: #e5e7eb; color: #0f172a; font-weight: 600; cursor: default; }

    /* CSS DO QUIZ (Mantendo visual limpo) */
    .card, .card-bloco {
        background-color: #ffffff; border: 1px solid #e5e7eb;
        border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    h1 { color: #0f172a; font-size: 1.8rem; margin-bottom: 30px; text-align: center; }
    
    .submit-btn { background-color: #2563eb; border-radius: 6px; font-weight: 600; }
    .submit-btn:hover { background-color: #1d4ed8; }

    /* MOBILE */
    @media (max-width: 640px) {
        .navbar { padding: 0 16px !important; }
        .user-info-text { display: none; }
    }
`;
document.head.appendChild(style);

// 2. FONTAWESOME
if (!document.querySelector('link[href*="font-awesome"]')) {
    const fa = document.createElement('link');
    fa.rel = 'stylesheet';
    fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fa);
}

// 3. INJEÇÃO DA ESTRUTURA
document.addEventListener("DOMContentLoaded", () => {
    // A) NAVBAR (Inserida diretamente no body como primeiro elemento)
    const navbarHTML = `
        <nav class="navbar">
            <a href="index.html" class="navbar-brand">
                <i class="fas fa-graduation-cap"></i> Medicina UNIP
            </a>
            <div class="user-profile">
                <div class="user-info-text">
                    <span class="user-name" id="displayUser">Carregando...</span>
                    <div class="user-meta"><span id="displayIp">...</span></div>
                </div>
                <div class="user-avatar" id="userAvatar"><i class="fas fa-user"></i></div>
            </div>
        </nav>
    `;
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

    // B) TAGS (Dentro do container do quiz)
    const quizContainer = document.querySelector('.quiz-container');
    const title = quizContainer ? quizContainer.querySelector('h1') : null;
    
    if (quizContainer) {
        const tagsHTML = `
            <div class="nav-tags">
                <a href="index.html" class="nav-tag active">Simulados</a>
                <a href="resumos.html" class="nav-tag">Resumos</a>
                <a href="planner.html" class="nav-tag">Planner</a>
            </div>
        `;
        if (title) title.insertAdjacentHTML('beforebegin', tagsHTML);
        else quizContainer.insertAdjacentHTML('afterbegin', tagsHTML);
    }
});

// 4. AUTENTICAÇÃO E DADOS
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const displayName = user.displayName || "Estudante";
        const email = user.email || "";
        
        const nameEl = document.getElementById('displayUser');
        if (nameEl) nameEl.textContent = displayName;
        
        const avatarEl = document.getElementById('userAvatar');
        if (avatarEl) {
            const initials = displayName.split(" ").map((n)=>n[0]).join("").substring(0,2).toUpperCase();
            avatarEl.textContent = initials;
        }

        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            const ipEl = document.getElementById('displayIp');
            if(ipEl) {
                ipEl.textContent = data.ip;
                ipEl.title = `Logado como: ${email}`;
            }
        } catch {
            const ipEl = document.getElementById('displayIp');
            if(ipEl) ipEl.style.display = 'none';
        }
    }
});
