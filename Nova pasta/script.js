const caminho = document.getElementById('caminho');
const modal = new bootstrap.Modal(document.getElementById('modal'));
const modalTexto = document.getElementById('modal-texto');

let nivelAtual = 1;

// Criar linha de conexão
const linha = document.createElement('div');
linha.className = 'linha';
caminho.appendChild(linha);

// Criar esferas
for (let i = 10; i >= 1; i--) {
    const esfera = document.createElement('div');
    esfera.className = 'esfera';
    esfera.textContent = i;
    esfera.dataset.numero = i;
    esfera.addEventListener('click', abrirModal);
    if (i > 1) {
        esfera.classList.add('bloqueada');
    }
    caminho.appendChild(esfera);
}

function abrirModal(event) {
    const numeroEsfera = parseInt(event.target.dataset.numero);
    if (numeroEsfera > nivelAtual) {
        alert('Esta esfera ainda está bloqueada. Complete os níveis anteriores primeiro.');
        return;
    }
    modalTexto.innerHTML = `
        <p>Começar o quiz do nível ${numeroEsfera}?</p>
        <button class="btn btn-primary" id="confirmar">Confirmar</button>
        <button class="btn btn-secondary" data-bs-dismiss="modal">Sair</button>
    `;
    modal.show();

    // Use setTimeout para garantir que o botão exista no DOM antes de adicionar o evento
    setTimeout(() => {
        document.getElementById('confirmar').addEventListener('click', () => {
            carregarQuiz(numeroEsfera);
        });
    }, 0);
}

// Scroll to the bottom of the page
window.onload = function() {
    window.scrollTo(0, document.body.scrollHeight);
}

async function carregarQuiz(nivel) {
    try {
        const response = await fetch('quiz/questoes.json');
        const data = await response.json();
        const questoes = data.questoes;
        const questaoAleatoria = questoes[Math.floor(Math.random() * questoes.length)];
        
        modalTexto.innerHTML = `
            <h3>Nível ${nivel}: ${questaoAleatoria.pergunta}</h3>
            <form id="quizForm">
                ${questaoAleatoria.opcoes.map((opcao, index) => `
                    <div>
                        <input type="radio" id="opcao${index}" name="resposta" value="${opcao}">
                        <label for="opcao${index}">${opcao}</label>
                    </div>
                `).join('')}
                <button type="submit" id="confirmarResposta">Confirmar Resposta</button>
            </form>
        `;

        document.getElementById('quizForm').addEventListener('submit', (e) => {
            e.preventDefault();
            verificarResposta(questaoAleatoria.resposta, nivel);
        });
    } catch (error) {
        console.error('Erro ao carregar o quiz:', error);
        modalTexto.innerHTML = '<p>Erro ao carregar o quiz. Por favor, tente novamente.</p>';
    }
}

function verificarResposta(respostaCorreta, nivel) {
    const respostaSelecionada = document.querySelector('input[name="resposta"]:checked');
    if (!respostaSelecionada) {
        alert('Por favor, selecione uma resposta.');
        return;
    }

    const opcoes = document.querySelectorAll('input[name="resposta"]');
    opcoes.forEach(opcao => {
        opcao.disabled = true;
        const label = opcao.nextElementSibling;
        if (opcao.value === respostaCorreta) {
            label.style.color = 'green';
        } else if (opcao === respostaSelecionada) {
            label.style.color = 'red';
        }
    });

    const resultado = respostaSelecionada.value === respostaCorreta ? 'Resposta correta!' : 'Resposta incorreta.';
    modalTexto.innerHTML += `<p>${resultado}</p>`;

    document.getElementById('confirmarResposta').disabled = true;

    if (respostaSelecionada.value === respostaCorreta) {
        desbloquearProximoNivel(nivel);
        modalTexto.innerHTML += `<p>Parabéns! Você desbloqueou o nível ${nivel + 1}.</p>`;
    }

    setTimeout(() => {
        modal.style.display = 'none';
    }, 3000);
}

function desbloquearProximoNivel(nivel) {
    if (nivel < 10) {
        const proximaEsfera = document.querySelector(`.esfera[data-numero="${nivel + 1}"]`);
        proximaEsfera.classList.remove('bloqueada');
        nivelAtual = nivel + 1;
    }
}

// Adicione esta função para fechar o modal
function fecharModal() {
    modal.hide();
}
