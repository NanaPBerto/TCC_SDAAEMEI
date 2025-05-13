
 // Função para mostrar/esconder a lupa na barra de pesquisa
 function someLupa() {
  document.getElementById('Lupa').style.display = 'none';
}

function mostraLupa() {
  if(document.getElementById('pesquisa').value === '') {
    document.getElementById('Lupa').style.display = 'block';
  }
}

// Adicionando evento de clique nas atividades
document.querySelectorAll('.card-atividade').forEach(card => {
  card.addEventListener('click', function() {
    // Aqui você pode adicionar a navegação para a página da atividade
    console.log('Atividade selecionada:', this.querySelector('.card-title').textContent);
  });
});



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
