document.addEventListener('DOMContentLoaded', function() {
  var fileInput = document.getElementById('anexosInput');
  var label = document.getElementById('anexosLabel');
  var small = document.getElementById('anexosSmall');
  var fileNameSpan = document.getElementById('anexosFileName');
  if(fileInput) {
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
});
