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

// Debug do formulário
document.getElementById('formAtividade').addEventListener('submit', function(e) {
    console.log('Formulário sendo enviado...');
    console.log('Action:', this.action); // Deve mostrar /editar/ID na edição
    
    // Mostrar dados do formulário
    const formData = new FormData(this);
    console.log('Dados do formulário:');
    for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`${key}: ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
            console.log(`${key}: ${value}`);
        }
    }
    
    // Mostrar loading
    const btn = document.getElementById('btnSubmit');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Salvando...';
    btn.disabled = true;
});

// Mostrar nome dos arquivos selecionados
document.querySelectorAll('input[type="file"]').forEach(input => {
    input.addEventListener('change', function() {
        if (this.files[0]) {
            console.log('Arquivo selecionado:', this.files[0].name);
            const fileNameElement = this.parentElement.querySelector('span');
            if (fileNameElement) {
                fileNameElement.textContent = this.files[0].name;
                fileNameElement.className = 'd-block mt-2 text-success';
            }
        }
    });
});

function previewAvatar(event, previewId) {
  const input = event.target;
  const preview = document.getElementById(previewId);
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
    };
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.innerHTML = `<i class="fas fa-camera"></i>`;
  }
}