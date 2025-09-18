function createMusicNotes() {
            const notesContainer = document.getElementById('music-notes');
            const notes = ['♪', '♫', '♩', '♬', '♭', '♮'];
            for (let i = 0; i < 12; i++) {
                const note = document.createElement('div');
                note.className = 'music-note';
                note.textContent = notes[Math.floor(Math.random() * notes.length)];
                note.style.left = Math.random() * 100 + 'vw';

                 note.style.animationDuration = (5 + Math.random() * 10) + 's';
              
                note.style.animationDelay = Math.random() * 5 + 's';
                note.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
                notesContainer.appendChild(note);
            }
        }
        
        // Alternar tema
        function toggleTheme() {
            document.body.classList.toggle('dark-mode');
            const icon = document.querySelector('.theme-toggle i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');


            document.body.style.background = 'linear-gradient(135deg, #1A0B2E 0%, #0D1B2A 100%)';

            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                document.body.style.background = 'linear-gradient(135deg, #e1bee7 0%, #bbdefb 100%)';
            }
        }
        
        // Funções de acesso
        function accessAsViewer() {
            window.location.href = "/homeE";
        }
        
        function accessAsContributor() {
            window.location.href = "/cadastroM";
        }
        
        function socialLogin(provider) {
            alert(`Login com ${provider} será implementado`);
        }
        
        // Inicialização
        document.addEventListener('DOMContentLoaded', function() {
            createMusicNotes();
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);

            // Ajustar altura do container para garantir visibilidade completa
            function adjustContainer() {
                const container = document.querySelector('.login-container');
                const windowHeight = window.innerHeight;
                const containerHeight = container.offsetHeight;
                if (containerHeight > windowHeight - 40) {
                    container.style.margin = '20px auto';
                    document.body.style.alignItems = 'flex-start';
                } else {
                    document.body.style.alignItems = 'center';
                }
            }


            window.addEventListener('resize', adjustContainer);

        // Inicialização
        document.addEventListener('DOMContentLoaded', function() {
            createMusicNotes();
            document.getElementById('themeToggle').addEventListener('click', toggleTheme);

            // Ajustar altura do container para garantir visibilidade completa
            function adjustContainer() {
                const container = document.querySelector('.login-container');
                const windowHeight = window.innerHeight;
                const containerHeight = container.offsetHeight;
                if (containerHeight > windowHeight - 40) {
                    container.style.margin = '20px auto';
                    document.body.style.alignItems = 'flex-start';
                } else {
                    document.body.style.alignItems = 'center';
                }
            }

         window.addEventListener('resize', adjustContainer);

            adjustContainer();
        });