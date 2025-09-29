 // Preview da imagem antes de salvar
  document.getElementById('imagemInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        // Esconde o ícone padrão
        const defaultIcon = document.getElementById('defaultIcon');
        if (defaultIcon) defaultIcon.style.display = 'none';
        
        // Mostra ou atualiza a imagem de preview
        let previewImg = document.getElementById('previewImagem');
        if (!previewImg) {
          previewImg = document.createElement('img');
          previewImg.id = 'previewImagem';
          previewImg.className = 'rounded-circle mb-3';
          previewImg.style.width = '120px';
          previewImg.style.height = '120px';
          previewImg.style.objectFit = 'cover';
          document.querySelector('.col-md-4.text-center').insertBefore(previewImg, document.getElementById('imagemInput').parentNode);
        }
        previewImg.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Previne o envio duplo do formulário
  document.getElementById('perfilForm').addEventListener('submit', function(e) {
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Salvando...';
  });