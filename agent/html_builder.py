def criar_html(titulo, questions_text):
    # Note que usei f""" ... """
    # Tudo que é do Python (titulo, questions_text) usa { }
    # Tudo que é CSS ou JS usa {{ }}
    
    return f"""
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{titulo}</title>
    <style>
        body {{ font-family: sans-serif; margin: 0; padding: 20px; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; background-color: #f4f4f4; }}
        .quiz-container {{ max-width: 800px; width: 100%; }}
        h1 {{ color: #333; text-align: center; margin-bottom: 30px; }}
        .card {{ background-color: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }}
        .question {{ font-weight: bold; margin-bottom: 10px; color: #333; }}
        .options {{ margin-top: 15px; }}
        
        /* Estilos das opções */
        .option, label.option, label, #newQuestionsContent label {{ display: flex; align-items: center; margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; transition: background-color 0.2s ease; position: relative; }}
        
        /* Ocultar Radio inputs */
        .option input[type="radio"], label input[type="radio"], #newQuestionsContent input[type="radio"], #newQuestionsContent label input[type="radio"] {{ display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; left: -9999px !important; }}
        
        .option:hover, label.option:hover, label:hover, #newQuestionsContent label:hover {{ background-color: #e9e9e9; }}
        .option.selected, label.option.selected, label.selected, #newQuestionsContent label.selected {{ background-color: #d1e7dd; border-color: #28a745; }}
        .option.correct, label.option.correct, label.correct, #newQuestionsContent label.correct {{ background-color: #d4edda; border-color: #28a745; }}
        .option.incorrect, label.option.incorrect, label.incorrect, #newQuestionsContent label.incorrect {{ background-color: #f8d7da; border-color: #dc3545; }}
        
        .submit-btn {{ display: block; width: 100%; padding: 15px; background-color: #007bff; color: white; border: none; border-radius: 5px; font-size: 18px; cursor: pointer; transition: background-color 0.3s ease; margin-top: 30px; }}
        .submit-btn:hover {{ background-color: #0056b3; }}
        
        .results {{ text-align: center; margin-top: 30px; font-size: 20px; font-weight: bold; color: #333; }}
        .scissor-icon {{ margin-right: 10px; width: 20px; height: 20px; opacity: 0.5; cursor: pointer; }}
        .scissor-icon.hidden {{ display: none; }}
        .struck-through {{ text-decoration: line-through; color: #888; }}
        
        .comment {{ margin-top: 10px; padding: 10px; background-color: #f0f0f0; border-left: 4px solid #007bff; font-style: italic; color: #555; display: none; }}
        .comment.show {{ display: block; }}
        
        .card-bloco {{ border: 1px solid #ddd; border-radius: 6px; padding: 10px; background: #fff; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }}
        
        /* Diagnóstico e Erros */
        .error-diagnosis-section {{ margin-top: 50px; padding: 30px; background-color: #ffe0b2; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.15); display: none; text-align: center; font-size: 1.1em; color: #333; }}
        .error-diagnosis-section h2 {{ color: #e65100; margin-bottom: 20px; font-size: 1.8em; }}
        .error-diagnosis-section ul {{ list-style: none; padding: 0; margin: 0; }}
        .error-diagnosis-section li {{ background-color: #ff9800; color: white; padding: 8px 15px; margin: 8px 0; border-radius: 5px; display: inline-block; margin-right: 10px; font-weight: bold; }}
    </style>
</head>
<body>

    <div class="quiz-container" id="quiz-container">
        <h1>{titulo}</h1>
        
        <div id="quiz"></div>
        
        <button class="submit-btn" id="verifyAnswersBtn">Verificar Respostas</button>
        <button class="generate-questions-btn submit-btn" id="generateNewQuestionsBtn" style="display:none;">Gerar Novas Perguntas</button>
        
        <div class="results card-bloco" id="results"></div>
        <div id="statusMessage" style="text-align: center; margin-top: 10px; font-weight: bold; color: #007bff;"></div>
        
        <div class="error-diagnosis-section card-bloco" id="errorDiagnosis">
            <h2>Diagnóstico de Erros</h2>
            <p>Parece que você precisa revisar os seguintes assuntos:</p>
            <ul id="topicsToReview"></ul>
        </div>
        
        <div class="generated-questions-section card-bloco" id="generatedQuestionsSection" style="display:none;">
            <h2>Novas Perguntas Geradas</h2>
            <div id="newQuestionsContent"></div>
        </div>
    </div>

<script>
    const quizContainer = document.getElementById("quiz");
    const resultsContainer = document.getElementById("results");
    const errorDiagnosisSection = document.getElementById("errorDiagnosis");
    const topicsToReviewList = document.getElementById("topicsToReview");
    const generateNewQuestionsBtn = document.getElementById("generateNewQuestionsBtn");
    const generatedQuestionsSection = document.getElementById("generatedQuestionsSection");
    const newQuestionsContent = document.getElementById("newQuestionsContent");
    const statusMessage = document.getElementById("statusMessage");

    let wrongQuestionIndices = [];
    let errorCountByTopic = {{}};  // CORRIGIDO: chaves duplas para objeto JS vazio
    let totalAnsweredQuestionsByTopic = {{}}; // CORRIGIDO
    let currentWrongQuestionIndex = -1;
    let hasErrors = false;

    // Inicializa display
    errorDiagnosisSection.style.display = 'none';
    topicsToReviewList.innerHTML = '';
    statusMessage.textContent = '';

    // AQUI entra a variável Python, então usamos chaves simples:
    const questions = [ {questions_text} ];

    function buildQuiz() {{
        const output = [];
        questions.forEach((currentQuestion, questionNumber) => {{
            const options = [];
            for (let i = 0; i < currentQuestion.options.length; i++) {{
                // Note o uso de ${{...}} para template literals do JS dentro da f-string
                options.push(
                    `<label class="option" data-question="${{questionNumber}}" data-value="${{currentQuestion.options[i]}}">
                        <img src="tesouras.png" class="scissor-icon" onclick="event.stopPropagation(); this.parentNode.classList.toggle('struck-through');">
                        ${{currentQuestion.options[i]}}
                    </label>`
                );
            }}
            output.push(
                `<div class="card" id="question-${{questionNumber}}" data-topic="${{currentQuestion.topic}}">
                    <div class="question">${{currentQuestion.question}}</div>
                    <div class="options">${{options.join("")}}</div>
                    <div class="comment" id="comment-${{questionNumber}}"></div>
                </div>`
            );
        }});
        quizContainer.innerHTML = output.join("");
    }}

    function showResults() {{
        wrongQuestionIndices = [];
        errorCountByTopic = {{}};
        totalAnsweredQuestionsByTopic = {{}};
        currentWrongQuestionIndex = -1;
        hasErrors = false;
        errorDiagnosisSection.style.display = 'none';
        topicsToReviewList.innerHTML = '';
        statusMessage.textContent = '';

        const allQuestionCards = document.querySelectorAll('.quiz-container .card, #newQuestionsContent .card');
        let correctAnswersCount = 0;
        let totalQuestionsAnswered = 0;

        allQuestionCards.forEach((card, index) => {{
            const questionEl = card.querySelector('.question') || card.querySelector('p');
            if (!questionEl) return;
            
            const questionText = questionEl.textContent.trim();
            const optionsContainer = card.querySelector('.options') || card;
            const allOptions = optionsContainer.querySelectorAll('.option, label.option, label');
            const userAnswerElement = optionsContainer.querySelector('.option.selected, label.selected');
            const commentDiv = card.querySelector('.comment');
            const questionTopic = card.dataset.topic || "Tópico não informado";

            // Limpa classes
            allOptions.forEach(option => {{ option.classList.remove('correct', 'incorrect', 'selected'); }});
            if (commentDiv) commentDiv.classList.remove('show');

            let correctAnswerValue = null;
            let questionComment = null;

            // Lógica para Estáticas vs Dinâmicas
            const isStatic = card.id && card.id.startsWith('question-');
            if (isStatic) {{
                const questionData = questions.find(q => q.question.trim() === questionText);
                if (questionData) {{
                    correctAnswerValue = questionData.correctAnswer.trim();
                    questionComment = questionData.comment;
                }}
            }} else {{
                const correctOpt = optionsContainer.querySelector('.option[data-answer="true"], label[data-answer="true"]');
                if (correctOpt) correctAnswerValue = correctOpt.dataset.value?.trim() || correctOpt.textContent.trim();
                
                const commentElement = card.querySelector('.comment');
                if (commentElement && commentElement.textContent.trim()) questionComment = commentElement.textContent.trim();
            }}

            // Verifica resposta
            let userAnswer = null;
            if (userAnswerElement) {{
                userAnswerElement.classList.add('selected');
                userAnswer = userAnswerElement.dataset.value?.trim() || userAnswerElement.textContent.trim();
                totalQuestionsAnswered++;
                totalAnsweredQuestionsByTopic[questionTopic] = (totalAnsweredQuestionsByTopic[questionTopic] || 0) + 1;

                if (userAnswer === correctAnswerValue) {{
                    correctAnswersCount++;
                }} else {{
                    hasErrors = true;
                    errorCountByTopic[questionTopic] = (errorCountByTopic[questionTopic] || 0) + 1;
                }}
            }}

            // Pinta as opções
            allOptions.forEach(option => {{
                const optionValue = option.dataset.value?.trim() || option.textContent.trim();
                if (optionValue === correctAnswerValue) option.classList.add('correct');
                if (userAnswer && optionValue === userAnswer && userAnswer !== correctAnswerValue) option.classList.add('incorrect');
            }});

            if (commentDiv && questionComment) {{
                commentDiv.textContent = questionComment;
                commentDiv.classList.add('show');
            }}
        }});

        resultsContainer.textContent = `Você acertou ${{correctAnswersCount}} de ${{totalQuestionsAnswered}} questões respondidas.`;

        // Diagnóstico
        if (hasErrors) {{
            for (const topic in errorCountByTopic) {{
                const errors = errorCountByTopic[topic];
                const total = totalAnsweredQuestionsByTopic[topic] || 0;
                if (total > 0) {{
                    const percent = ((errors / total) * 100).toFixed(1);
                    const li = document.createElement('li');
                    li.textContent = `${{topic}}: ${{percent}}% de erros (${{errors}} de ${{total}} questões)`;
                    topicsToReviewList.appendChild(li);
                }}
            }}
            errorDiagnosisSection.style.display = 'block';
            generatedQuestionsSection.style.display = 'block';
            generateNewQuestionsBtn.style.display = 'block';
            errorDiagnosisSection.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
        }} else {{
            const li = document.createElement('li');
            li.textContent = "🥳 Parabéns! Você não teve erros nas questões respondidas.";
            topicsToReviewList.appendChild(li);
        }}
    }}

    // Listeners
    document.addEventListener("click", function (event) {{
        const clickedElement = event.target;
        const optionElement = clickedElement.closest('.option');
        if (optionElement) {{
            if (clickedElement.classList.contains("scissor-icon")) {{
                event.stopPropagation();
                optionElement.classList.toggle("struck-through");
            }} else {{
                const parentCard = optionElement.closest('.card');
                const currentQuestionOptions = parentCard.querySelectorAll('.option');
                currentQuestionOptions.forEach(opt => opt.classList.remove("selected"));
                optionElement.classList.add("selected");
            }}
        }}
    }});

    generateNewQuestionsBtn.addEventListener("click", async function() {{
        statusMessage.textContent = '⏳ Gerando novas perguntas...';
        generateNewQuestionsBtn.disabled = true;
        
        const topics = Object.keys(errorCountByTopic).filter(topic => {{
            const errorsInTopic = errorCountByTopic[topic] || 0;
            const totalAnsweredInTopic = totalAnsweredQuestionsByTopic[topic] || 0;
            return errorsInTopic > 0 && totalAnsweredInTopic > 0;
        }});
        
        const topicsToSend = topics.length > 0 ? topics : ["fisiologia celular", "biologia"];

        try {{
            const response = await fetch('https://www.quizia.xyz/quiz', {{
                method: 'POST',
                headers: {{ 'Content-Type': 'application/json' }},
                body: JSON.stringify({{ topicos: topicsToSend }}),
            }});

            if (!response.ok) throw new Error(`HTTP error! status: ${{response.status}}`);
            
            const data = await response.json();
            newQuestionsContent.innerHTML = '';

            if (data && data.html) {{
                newQuestionsContent.innerHTML = data.html.replace(/```html|```/g, '');
                
                newQuestionsContent.querySelectorAll('.card').forEach((card) => {{
                    // Lógica de limpeza e adição de tesouras (mantida igual)
                    const questionElement = card.querySelector('p');
                    if (questionElement && !questionElement.classList.contains('question')) questionElement.classList.add('question');
                    
                    card.querySelectorAll('label').forEach((label) => {{
                        const radioInput = label.querySelector('input[type="radio"]');
                        if (radioInput) {{
                            if (radioInput.hasAttribute('data-answer')) label.setAttribute('data-answer', radioInput.getAttribute('data-answer'));
                            radioInput.remove();
                        }}
                        if (!label.classList.contains('option')) label.classList.add('option');
                        if (!label.dataset.value) label.dataset.value = label.textContent.trim();
                        if (!label.querySelector('.scissor-icon')) {{
                            const scissorIcon = document.createElement('img');
                            scissorIcon.src = 'tesouras.png';
                            scissorIcon.className = 'scissor-icon';
                            scissorIcon.onclick = function(e) {{ e.stopPropagation(); label.classList.toggle('struck-through'); }};
                            label.insertBefore(scissorIcon, label.firstChild);
                        }}
                    }});
                }});
            }} else {{
                newQuestionsContent.innerHTML = "<p>Não foi possível gerar novas perguntas.</p>";
            }}
            
            generatedQuestionsSection.style.display = 'block';
            generatedQuestionsSection.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
            statusMessage.textContent = '✅ Perguntas geradas com sucesso!';
            setTimeout(() => {{ statusMessage.textContent = '' }}, 3000);
            
        }} catch (error) {{
            console.error('Erro:', error);
            statusMessage.textContent = '❌ Erro: ' + error.message;
            setTimeout(() => {{ statusMessage.textContent = '' }}, 5000);
        }} finally {{
            generateNewQuestionsBtn.disabled = false;
        }}
    }});

    buildQuiz();
    document.getElementById("verifyAnswersBtn").addEventListener("click", showResults);
</script>
</body>
</html>
"""
