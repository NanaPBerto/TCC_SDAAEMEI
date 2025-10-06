document.addEventListener('DOMContentLoaded', function() {
    
    // ===== SISTEMA DE AUTOCOMPLETE PARA ATIVIDADES =====
    function inicializarAutocompleteAtividades() {
        const barraPesquisa = document.getElementById('pesquisa');
        const divInicial = document.getElementById('divInicial');

        if (!barraPesquisa) return;

        // Criar container para sugestões
        const sugestoesContainer = document.createElement('div');
        sugestoesContainer.className = 'sugestoes-container';
        sugestoesContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;

        divInicial.style.position = 'relative';
        divInicial.appendChild(sugestoesContainer);

        let timeoutId;

        barraPesquisa.addEventListener('input', function(e) {
            clearTimeout(timeoutId);
            const termo = e.target.value.trim();

            // Esconder sugestões se campo vazio
            if (termo.length === 0) {
                sugestoesContainer.style.display = 'none';
                return;
            }

            timeoutId = setTimeout(() => {
                buscarSugestoesAtividades(termo, sugestoesContainer);
            }, 300);
        });

        // Esconder sugestões ao clicar fora
        document.addEventListener('click', function(e) {
            if (!divInicial.contains(e.target)) {
                sugestoesContainer.style.display = 'none';
            }
        });
    }

    // ===== BUSCAR SUGESTÕES DE ATIVIDADES =====
    function buscarSugestoesAtividades(termo, container) {
        // Fazer requisição para buscar atividades similares
        fetch(`/api/atividades/sugestoes?q=${encodeURIComponent(termo)}`)
            .then(response => {
                if (!response.ok) throw new Error('Erro na busca');
                return response.json();
            })
            .then(atividades => {
                mostrarSugestoes(atividades, termo, container);
            })
            .catch(error => {
                console.error('Erro ao buscar sugestões:', error);
                container.style.display = 'none';
            });
    }

    // ===== MOSTRAR SUGESTÕES NA TELA =====
    function mostrarSugestoes(atividades, termo, container) {
        // Limpar container
        container.innerHTML = '';

        if (atividades.length === 0) {
            const item = document.createElement('div');
            item.className = 'sugestao-item';
            item.textContent = 'Nenhuma atividade encontrada';
            item.style.cssText = `
                padding: 10px 15px;
                color: #666;
                font-style: italic;
                cursor: default;
            `;
            container.appendChild(item);
        } else {
            atividades.forEach(atividade => {
                const item = document.createElement('a');
                item.className = 'sugestao-item';
                item.href = `/atividade/${atividade.id}`;
                item.style.cssText = `
                    display: block;
                    padding: 10px 15px;
                    text-decoration: none;
                    color: #333;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                    transition: background-color 0.2s;
                `;

                // Destacar o termo pesquisado no nome
                const nomeComHighlight = destacarTermo(atividade.nome, termo);
                const objetivoLimitado = atividade.objetivo.length > 50 ? 
                    atividade.objetivo.substring(0, 50) + '...' : atividade.objetivo;

                item.innerHTML = `
                    <div style="font-weight: 600; margin-bottom: 2px;">${nomeComHighlight}</div>
                    <div style="font-size: 0.85em; color: #666;">${objetivoLimitado}</div>
                `;

                // Efeitos hover
                item.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = '#f8f9fa';
                });
                item.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'transparent';
                });

                container.appendChild(item);
            });
        }

        container.style.display = 'block';
    }

    // ===== DESTACAR TERMO PESQUISADO =====
    function destacarTermo(texto, termo) {
        if (!termo) return texto;
        
        const regex = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return texto.replace(regex, '<mark style="background-color: #fff3cd; padding: 1px 2px; border-radius: 2px;">$1</mark>');
    }

    // ===== FILTROS PARA PERFIS (CORRIGIDO) =====
    function inicializarFiltrosPerfis() {
        const filtroBtns = document.querySelectorAll('.filter-btn');
        const searchBox = document.querySelector('.search-box input');

        if (filtroBtns.length === 0) return;

        // Obter parâmetros atuais da URL
        const urlParams = new URLSearchParams(window.location.search);
        const filtroAtual = urlParams.get('filtro') || 'todos';
        const pesquisaAtual = urlParams.get('pesquisa') || '';

        // Marcar botão ativo baseado na URL
        filtroBtns.forEach(btn => {
            const textoBtn = btn.textContent.trim().toLowerCase();
            if ((filtroAtual === 'todos' && textoBtn === 'todos') ||
                (filtroAtual === 'musico' && textoBtn === 'professores de música') ||
                (filtroAtual === 'educador' && textoBtn === 'educadores')) {
                btn.classList.add('active');
            }
        });

        // Preencher campo de pesquisa se existir
        if (searchBox && pesquisaAtual) {
            searchBox.value = pesquisaAtual;
        }

        // Eventos dos botões de filtro
        filtroBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const texto = this.textContent.trim().toLowerCase();
                let novoTipo = 'todos';

                if (texto === 'professores de música') novoTipo = 'musico';
                else if (texto === 'educadores') novoTipo = 'educador';

                // Navegar para a mesma página com novo filtro
                navegarComFiltro(novoTipo, searchBox ? searchBox.value : '');
            });
        });

        // Evento de pesquisa
        if (searchBox) {
            let timeoutId;

            searchBox.addEventListener('input', function(e) {
                clearTimeout(timeoutId);
                const termo = e.target.value.trim();

                timeoutId = setTimeout(() => {
                    const filtroAtivo = document.querySelector('.filter-btn.active');
                    const textoFiltro = filtroAtivo ? filtroAtivo.textContent.trim().toLowerCase() : '';
                    let tipo = 'todos';
                    
                    if (textoFiltro === 'professores de música') tipo = 'musico';
                    else if (textoFiltro === 'educadores') tipo = 'educador';

                    navegarComFiltro(tipo, termo);
                }, 500);
            });

            // Pesquisa ao pressionar Enter
            searchBox.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const filtroAtivo = document.querySelector('.filter-btn.active');
                    const textoFiltro = filtroAtivo ? filtroAtivo.textContent.trim().toLowerCase() : 'todos';
                    let tipo = 'todos';
                    
                    if (textoFiltro === 'professores de música') tipo = 'musico';
                    else if (textoFiltro === 'educadores') tipo = 'educador';

                    navegarComFiltro(tipo, this.value.trim());
                }
            });
        }
    }

    // ===== NAVEGAR COM FILTRO =====
    function navegarComFiltro(tipo, pesquisa) {
        const params = new URLSearchParams();
        
        if (tipo !== 'todos') {
            params.set('filtro', tipo);
        }
        
        if (pesquisa) {
            params.set('pesquisa', pesquisa);
        }

        const novaUrl = params.toString() ? `/perfis?${params.toString()}` : '/perfis';
        window.location.href = novaUrl;
    }

    // ===== INICIALIZAR TUDO =====
    inicializarAutocompleteAtividades();
    inicializarFiltrosPerfis();
});