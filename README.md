Este é um documento essencial. Um README.md bem escrito serve como o "manual de instruções" do seu código.
Abaixo, preparei um README técnico e detalhado, estruturado especificamente para que uma IA (ou outro desenvolvedor) consiga ler e entender imediatamente toda a lógica do seu sistema, desde o banco de dados até a integração com a IA.
Você pode criar um arquivo chamado README.md na pasta do seu projeto e colar o conteúdo abaixo:
🩺 Planner R1 | Medicina UNIP - Documentação Técnica
Este documento serve como a fonte da verdade para o funcionamento do sistema Planner R1, uma Single Page Application (SPA) focada em gestão de estudos médicos, revisão espaçada e prática clínica simulada via IA.
🏗️ Arquitetura do Sistema
O sistema opera em uma arquitetura Serverless composta por três pilares principais:
 * Frontend (Monolito): planner.html
   * Contém toda a lógica de UI, CSS (<style>) e JavaScript (<script type="module">).
   * Gerencia o estado local e a comunicação direta com o Firebase.
   * Consome a API do Cloudflare Worker para tarefas de IA.
 * Backend (IA Middleware): worker.js (Cloudflare Workers)
   * Atua como proxy seguro para a API do Google Gemini 1.5/2.0 Flash.
   * Contém os prompts de engenharia (Personas Médicas) e lógica de tratamento de dados brutos.
 * Banco de Dados & Storage: Google Firebase (v10)
   * Firestore: Banco NoSQL para persistência de dados.
   * Storage: Armazenamento de PDFs e imagens de uploads.
   * Auth: Autenticação de usuários.
🗄️ Estrutura de Dados (Firestore)
O banco de dados é estruturado por usuário (uid). A raiz é a coleção planners.
Caminho Raiz: planners/{uid}/...
| Coleção | Descrição | Campos Chave |
|---|---|---|
| tasks | O "Coração" do sistema. Contém cards do Cronograma e Pendências. | titulo, tag, targetDate (timestamp), concluido (bool), tipo ('pdf'/'texto'/'quiz'), contentHTML. |
| arquivos | A "Biblioteca". Guarda a fonte original dos estudos (sem repetições). | nome, url (se PDF), tag, data (upload), contentHTML (se texto). Usado para gerar revisões futuras. |
| agenda | Itens da Agenda Diária (com horário marcado). | titulo, data (YYYY-MM-DD), inicio (HH:mm), fim (HH:mm), concluido. |
| quizzes | Simulados gerados e salvos. | titulo, html (conteúdo renderizado), origemId, criadoEm. |
| caderno_erros | Registro de falhas e aprendizados (Flashcards de erro). | materia, contexto (pergunta), aprendizado (resposta correta/lição). |
| study_units | Mapeamento de capítulos de livros PDF. | arquivo, paginas, conceitos (array), textoCompleto (extraído). |
| stats_anatomia | Estatísticas de acertos/erros no módulo de anatomia. | regiao, acertou (bool), data. |
⚡ Backend: Cloudflare Worker (worker.js)
O Worker expõe um único endpoint POST que recebe um JSON com uma chave action. Ele roteia a solicitação para o prompt adequado do Gemini.
Actions Disponíveis:
 * gerar_revisao:
   * Entrada: Texto original + Label (D+1, D+7, etc).
   * Saída: Resumo Markdown formatado progressivamente (D+1 é fixação, D+21 é clínico).
 * mapear_capitulo:
   * Entrada: Texto bruto extraído do PDF.
   * Saída: JSON com lista de conceitos-chave médicos.
 * gerar_aula_conceito:
   * Entrada: Um conceito específico + Texto base.
   * Saída: Aula didática em Markdown explicando aquele conceito.
 * gerar_quiz_arquivo:
   * Entrada: Texto do estudo.
   * Saída: HTML puro com 40 questões de múltipla escolha (estilo residência).
 * gerar_prova_anatomia:
   * Entrada: Lista de objetos {id, description} (Descrições técnicas de imagens).
   * Saída: JSON Array com 20 questões clínicas baseadas nas descrições (sem revelar a resposta no enunciado).
 * gerar_agenda_ia:
   * Entrada: textoUsuario (preferências), agendaExistente (conflitos), pendencias (lista com datas).
   * Saída: JSON Array com sugestão de horários. Nota: Possui lógica rígida para respeitar datas passadas vs futuras.
 * corrigir_resumo:
   * Entrada: Texto Referência vs Texto Aluno (Técnica Feynman).
   * Saída: Feedback comparativo e nota.
🖥️ Frontend: Funcionalidades Críticas (planner.html)
1. Sistema de Cronograma (Board)
 * Visualização: 7 colunas (Dias da semana).
 * Drag & Drop: Simulado visualmente (renderização baseada em data).
 * Sincronização: Ao marcar um Checkbox, atualiza o Firestore e reflete imediatamente na Agenda Diária via renderAgendaBoard().
2. Agenda Diária & IA
 * Pendências (Caixa Amarela): Lista automática de tarefas do Cronograma que caem no dia atual (ou estão atrasadas) e ainda não têm horário definido na coleção agenda.
 * Correção de Fuso Horário: Utiliza tzOffset para garantir que datas enviadas à IA respeitem o horário local do Brasil (evitando o bug do "dia seguinte").
 * Z-Index: O modal #modalAgenda possui Z-Index elevado (2400) para sobrepor os cards relativos.
3. Módulo de Anatomia
 * Fonte de Imagens: Utiliza um repositório externo (brunooofernandesss.github.io) mapeado no arquivo banco_anatomia.js.
 * Lógica: O Frontend escolhe a imagem e envia a descrição técnica (metadata) para o Worker. O Worker cria o caso clínico. O Frontend exibe a imagem e o caso juntos.
4. Revisão Espaçada & Férias
 * Fonte da Verdade: Usa a coleção arquivos para evitar duplicidade de tarefas.
 * Longo Prazo: Gera cards para +6 meses, +1 ano, etc.
 * Algoritmo de Férias: Distribuição "Round Robin". Pega X estudos e distribui equitativamente entre os dias selecionados (feriasInicio a feriasFim). Cria cards com tag [FÉRIAS].
5. Visualizador Híbrido & Editor
 * PDF.js: Customizado para permitir seleção de texto e extração de páginas para a IA.
 * Quill.js: Editor de texto rico. Possui "Matchers" customizados para limpar formatação ao colar tabelas ou textos com | (pipes).
🤖 Guia para Manutenção (Para a IA do Futuro)
Se você é uma IA lendo isso para modificar o código, siga estas Regras de Ouro:
 * Não quebre o Monolito: O usuário prefere manter tudo no planner.html por facilidade. Não sugira separar em arquivos .js ou .css a menos que explicitamente solicitado.
 * Datas são Traiçoeiras: Sempre use new Date(Date.now() - tzOffset) ou lógica similar ao manipular datas para envio ao Worker. O servidor é UTC, o usuário é Brasil (UTC-3).
 * Prompt Engineering: Ao alterar o worker.js, mantenha as "Personas" (ex: "Você é um Preceptor Sênior"). Isso define a qualidade da resposta médica.
 * Colisões de Z-Index: O sistema tem muitos modais sobrepostos (Editor > View > Agenda > Erros). Sempre verifique a lista de z-index no CSS ao criar novos popups.
 * Fluxo de Dados:
   * Criação: Arquivos (Master) -> Tasks (Instâncias/Revisões).
   * Execução: Tasks (Pendente) -> Agenda (Agendado) -> Concluído.
Autor: Bruno Fernandes (Estudante de Medicina)
Versão Atual: v.Final.Revisão.Férias
Tecnologia: HTML5 / Firebase / Cloudflare Workers / Gemini AI
