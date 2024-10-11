document.addEventListener("DOMContentLoaded", function() {
    // Fazendo a requisição para ler o arquivo JSON
    fetch('../json/fases.json')
        .then(response => response.json())
        .then(data => {
            const fases = data.matematica;
            const container = document.getElementById("fases-container");

            fases.forEach((fase, index) => {
                const li = document.createElement("li");
                const button = document.createElement("button");

                // Verifica se é uma questão (circular) ou um resumo (quadrado)
                if (fase.tipo === "questao") {
                    button.classList.add("circular");
                    button.innerText = "Fase " + (index + 1);
                } else if (fase.tipo === "resumo") {
                    button.classList.add("square");
                    button.innerText = "Resumo " + (index + 1);
                }

                button.addEventListener("click", () => abrirModal(fase));

                li.appendChild(button);
                container.appendChild(li);
            });

            function abrirModal(fase) {
                let conteudo = `<h2>${fase.titulo}</h2>`;

                if (fase.tipo === "questao") {
                    fase.questoes.forEach((questao, i) => {
                        conteudo += `<p>${questao.pergunta}</p>`;
                        conteudo += `<select id="resposta-${i}">`;
                        questao.respostas.forEach(resposta => {
                            conteudo += `<option value="${resposta}">${resposta}</option>`;
                        });
                        conteudo += `</select>`;
                    });
                } else if (fase.tipo === "resumo") {
                    conteudo += `<p>${fase.conteudo}</p>`;
                }

                // Usando SweetAlert2 para mostrar o modal
                Swal.fire({
                    title: fase.titulo,
                    html: conteudo,
                    showCancelButton: true,
                    confirmButtonText: 'Enviar Respostas',
                    cancelButtonText: 'Cancelar',
                    preConfirm: () => {
                        return fase.questoes.map((_, i) => {
                            return document.getElementById(`resposta-${i}`).value;
                        });
                    }
                }).then((result) => {
                    if (result.isConfirmed) {
                        validarRespostas(fase, result.value);
                    }
                });
            }

            function validarRespostas(fase, respostasSelecionadas) {
                let todasCorretas = true;

                fase.questoes.forEach((questao, i) => {
                    if (respostasSelecionadas[i] !== questao.respostaCorreta) { // Verifica a resposta
                        todasCorretas = false;
                    }
                });

                if (todasCorretas) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Parabéns!',
                        text: 'Você respondeu todas as questões corretamente!'
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops!',
                        text: 'Algumas respostas estão incorretas. Tente novamente.'
                    });
                }
            }

        })
        .catch(error => {
            console.error("Erro ao carregar o arquivo JSON:", error);
            // Aqui você pode adicionar um elemento para mostrar ao usuário que ocorreu um erro
        });
});
