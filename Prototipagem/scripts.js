 //Funções para sumir e reaparecer a lupa na barra de pesquisa
function someLupa() {
    document.getElementById("Lupa").style.display = "none";
  }
  
  function mostraLupa() {
    document.getElementById("Lupa").style.display = "inline";
    document.getElementById("pesquisa").value = ""; //MUDAR ISSO DEPOIS 
  }



  document.querySelectorAll('.calendar td').forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.textContent) {
            cell.classList.toggle('selected');
        }
    });
});



function openModal() {
    document.getElementById('modalR').style.display = 'block';
}

function closeModal() {
    document.getElementById('modalR').style.display = 'none';
}

/**
 * Função para criar um bloco de atividade
 * @param {string} titulo - Título da atividade
 * @param {string} descricao - Descrição da atividade
 * @param {string} indicacao - Indicação/Idade recomendada
 * @param {string} alunos - Número ou faixa de alunos
 * @param {string} icone - Caminho para a imagem do ícone
 * @returns {string} HTML da atividade
 */
function criarAtividade(titulo, descricao, indicacao, alunos, icone = 'imagens/icone1.png') {
    return `
      <div class="col-11" id="ativ"> <!-- Alterado para col-11 (90% da largura) -->
        <div class="d-flex align-items-center p-3 rounded atividade">
          <div class="flex-grow-1">
            <h3 class="text-white">${titulo}</h3>
            <p class="mb-1">Descrição: ${descricao}</p>
            <p class="mb-1">Indicação: ${indicacao}</p>
            <p class="mb-1">Alunos: ${alunos}</p>
          </div>
          <img src="${icone}" alt="Ícone ${titulo}" class="ms-3" style="height: 70px; width: 70px;">
        </div>
      </div>
    `;
  }  
  // Exemplo de uso:
  document.getElementById('container-atividades').innerHTML += criarAtividade(
    'Ciranda Cirandinha', 
    'Atividade musical com dança circular', 
    '3-6 anos', 
    '10-20 alunos'
  );
  
  document.getElementById('container-atividades').innerHTML += criarAtividade(
    'Cai Cai Balão', 
    'Jogo musical com coordenação motora', 
    '4-8 anos', 
    '5-15 alunos',
    'imagens/icone1.png'
  );

  document.getElementById('container-atividades').innerHTML += criarAtividade(
    'Cai Cai Balão', 
    'Jogo musical com coordenação motora', 
    '4-8 anos', 
    '5-15 alunos',
    'imagens/icone1.png'
  );

  document.getElementById('container-atividades').innerHTML += criarAtividade(
    'Cai Cai Balão', 
    'Jogo musical com coordenação motora', 
    '4-8 anos', 
    '5-15 alunos',
    'imagens/icone1.png'
  );

  document.getElementById('container-atividades').innerHTML += criarAtividade(
    'Cai Cai Balão', 
    'Jogo musical com coordenação motora', 
    '4-8 anos', 
    '5-15 alunos',
    'imagens/icone1.png'
  );

  

$(document).ready(function(){
    $('#telefone').mask('(00) 0000-0000');
    });