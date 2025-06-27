function createMusicNotes() {
            const notes = ['♪', '♫'];
            const container = document.getElementById('music-notes');
            
            for (let i = 0; i < 8; i++) {
                const note = document.createElement('div');
                note.className = 'music-note';
                note.textContent = notes[Math.floor(Math.random() * notes.length)];
                note.style.left = Math.random() * 100 + 'vw';
                note.style.top = Math.random() * 100 + 'vh';
                note.style.animationDuration = (5 + Math.random() * 8) + 's';
                note.style.animationDelay = Math.random() * 3 + 's';
                container.appendChild(note);
            }
        }
        
        // Dark/Light Mode Toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            const body = document.getElementById('escolha');
            body.classList.toggle('dark-mode');
            const icon = document.querySelector('#themeToggle i');
            icon.classList.toggle('fa-sun');
            icon.classList.toggle('fa-moon');
            
            // Atualiza o ícone para refletir o modo oposto
            if (body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        });
        
        function socialLogin(provider) {
            alert(`Login com ${provider} selecionado`);
        }
        
      
        function accessAsViewer() {
            window.location.href = "/homeE";
        }
        
        function accessAsEditor() {
            window.location.href = "/homeE";
        }

        document.addEventListener('DOMContentLoaded', createMusicNotes);