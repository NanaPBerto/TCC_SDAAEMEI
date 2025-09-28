document.addEventListener('DOMContentLoaded', function() {
  function setupDropArea(dropAreaId, inputId, fileNameId) {
    var dropArea = document.getElementById(dropAreaId);
    var fileInput = document.getElementById(inputId);
    var fileNameSpan = document.getElementById(fileNameId);

    if (!dropArea || !fileInput) return;

    // Clique na área abre o seletor de arquivos
    dropArea.addEventListener('click', function(e) {
      if (e.target !== fileInput) {
        fileInput.click();
      }
    });

    fileInput.addEventListener('change', function() {
      if (fileInput.files && fileInput.files.length > 0) {
        fileNameSpan.textContent = Array.from(fileInput.files).map(f => f.name).join(', ');
      } else {
        fileNameSpan.textContent = '';
      }
    });

    // Drag over 
    dropArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      dropArea.classList.add('bg-light');
    });

    dropArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      dropArea.classList.remove('bg-light');
    });

    // Drop
    dropArea.addEventListener('drop', function(e) {
      e.preventDefault();
      dropArea.classList.remove('bg-light');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        var event = new Event('change');
        fileInput.dispatchEvent(event);
      }
    });
  }

  setupDropArea('imagemDropArea', 'imagemInput', 'imagemFileName');
  setupDropArea('partituraDropArea', 'partituraInput', 'partituraFileName');
  setupDropArea('musicaDropArea', 'musicaInput', 'musicaFileName');
});

// Debug do formulário
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            console.log('Arquivo selecionado:', this.files[0]);
            if (this.files[0]) {
                console.log('Tamanho:', this.files[0].size, 'bytes');
                console.log('Tipo:', this.files[0].type);
            }
        });
    });
});