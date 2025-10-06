// sugeridas.js - VERSÃO SIMPLIFICADA PARA DEBUG

console.log('🎯 sugeridas.js CARREGADO!');

function carregarSugestoes() {
    try {
        console.log('=== INICIANDO CARREGAMENTO DE SUGESTÕES ===');
        
        // Verificar se o elemento existe
        const atividadesDataElement = document.getElementById('atividades-data');
        console.log('📋 Elemento atividades-data:', atividadesDataElement);
        
        let atividades = [];
        
        if (atividadesDataElement && atividadesDataElement.textContent) {
            console.log('✅ Conteúdo encontrado no elemento');
            atividades = JSON.parse(atividadesDataElement.textContent);
            console.log(`📊 Dados carregados: ${atividades.length} atividades`);
            
            // Mostrar todas as atividades para debug
            atividades.forEach((atividade, index) => {
                console.log(`📁 Atividade ${index + 1}:`, atividade);
            });
        } else {
            console.log('❌ NENHUM DADO no elemento atividades-data');
            console.log('Conteúdo:', atividadesDataElement ? atividadesDataElement.textContent : 'Elemento não existe');
        }
        
        // Selecionar algumas atividades (máximo 6)
        const sugestoes = atividades.slice(0, 6);
        console.log(`🎯 ${sugestoes.length} sugestões selecionadas`);
        
        // Renderizar
        renderizarSugestoes(sugestoes);
        
    } catch (error) {
        console.error('❌ Erro ao carregar sugestões:', error);
        mostrarErro(error);
    }
}

function renderizarSugestoes(atividades) {
    const container = document.getElementById('sugeridas-container');
    const vazio = document.getElementById('sugeridas-vazio');

    // Registrar o partial se existir no HTML
    if (window.Handlebars && document.getElementById('atividadeReduzida-partial')) {
        var partialSource = document.getElementById('atividadeReduzida-partial').innerHTML;
        window.Handlebars.registerPartial('atividadeReduzida', partialSource);
    }

    if (!atividades || atividades.length === 0) {
        if (container) container.style.display = 'none';
        if (vazio) vazio.style.display = 'block';
        return;
    }

    if (container) container.style.display = 'grid';
    if (vazio) vazio.style.display = 'none';

    // Renderizar usando o partial do Handlebars
    if (window.Handlebars && window.Handlebars.partials && window.Handlebars.partials.atividadeReduzida) {
        const template = window.Handlebars.compile(window.Handlebars.partials.atividadeReduzida);
        container.innerHTML = atividades.map(atividade => {
            const contexto = {
                atividade: {
                    ...atividade,
                    titulo: atividade.titulo || atividade.nome,
                    categoria: atividade.categoria || 'Geral',
                    objetivo: atividade.objetivo || '',
                    imagem: atividade.imagem || ''
                }
            };
            return template(contexto);
        }).join('');
    } else {
        // Fallback: renderização manual igual ao partial
        container.innerHTML = atividades.map(atividade => `
            <div class="atividade-mini-card" data-categoria="${atividade.categoria || 'Geral'}">
                <div class="atividade-mini-titulo">${atividade.titulo || atividade.nome}</div>
                <div class="atividade-mini-imgbox mb-2" style="height: 120px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; border-radius: 4px;">
                    ${atividade.imagem ? `<img src="${atividade.imagem}" alt="Imagem da Atividade" style="max-width: 100%; max-height: 100%;">` : `<i class="fas fa-music fa-2x" style="color: var(--primary-light);"></i>`}
                </div>
                <div class="atividade-mini-objetivo">${atividade.objetivo || ''}</div>
                <div class="atividade-mini-actions">
                    <a href="/atividade/${atividade.id}" title="Ver detalhes">
                        <button type="button" class="atividade-mini-btn">
                            <i class="fas fa-eye"></i>
                        </button>
                    </a>
                </div>
            </div>
        `).join('');
    }
}

function mostrarErro(error) {
    const vazio = document.getElementById('sugeridas-vazio');
    if (vazio) {
        vazio.style.display = 'block';
        vazio.innerHTML = `
            <div class="alert alert-danger">
                <h5>Erro ao carregar sugestões</h5>
                <p>${error.message}</p>
                <button class="btn btn-warning mt-2" onclick="carregarSugestoes()">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

function recarregarSugestoes() {
    console.log('🔄 Recarregando sugestões...');
    carregarSugestoes();
    
    // Feedback simples
    alert('Sugestões recarregadas!');
}

// Exportar funções para uso global
window.carregarSugestoes = carregarSugestoes;
window.recarregarSugestoes = recarregarSugestoes;

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM carregado - Inicializando sugestões...');
    setTimeout(() => {
        carregarSugestoes();
    }, 500);
});