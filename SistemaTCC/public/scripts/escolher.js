        // Funções de acesso
        function accessAsViewer() {
            window.location.href = "/index";
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

            adjustContainer();
        });
