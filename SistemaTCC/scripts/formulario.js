document.addEventListener('DOMContentLoaded', function() {
  var fileInput = document.getElementById('anexosInput');
  var label = document.getElementById('anexosLabel');
  var small = document.getElementById('anexosSmall');
  var fileNameSpan = document.getElementById('anexosFileName');
  var dropArea = document.getElementById('anexosDropArea');

  if (fileInput) {
    fileInput.addEventListener('change', function() {
      if (fileInput.files && fileInput.files.length > 0) {
        var names = Array.from(fileInput.files).map(f => f.name).join(', ');
        label.style.display = 'none';
        fileNameSpan.textContent = names;
        small.style.display = 'none';
      } else {
        label.style.display = '';
        fileNameSpan.textContent = '';
        small.style.display = '';
      }
    });
  }

  if (dropArea && fileInput) {
    // Clique na área abre o seletor de arquivos
    dropArea.addEventListener('click', function(e) {
      if (e.target !== fileInput && e.target !== label) {
        fileInput.click();
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
});
