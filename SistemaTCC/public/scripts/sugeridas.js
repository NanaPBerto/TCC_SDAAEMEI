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
    
    console.log('🎨 Renderizando sugestões...');
    console.log('Container:', container);
    console.log('Vazio:', vazio);
    
    if (!atividades || atividades.length === 0) {
        console.log('📭 Nenhuma atividade para renderizar');
        if (container) container.style.display = 'none';
        if (vazio) vazio.style.display = 'block';
        return;
    }
    
    console.log(`🎨 Renderizando ${atividades.length} atividades`);
    
    if (container) container.style.display = 'grid';
    if (vazio) vazio.style.display = 'none';
    
    const html = atividades.map(atividade => `
        <div class="atividade-mini-card" style="border: 1px solid #ddd; padding: 1rem; border-radius: 8px;">
            <div class="atividade-mini-titulo" style="font-weight: bold; margin-bottom: 0.5rem;">
                ${atividade.titulo || 'Sem título'}
            </div>
            
            <div class="atividade-mini-imgbox" style="height: 120px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; margin-bottom: 0.5rem; border-radius: 4px;">
                ${atividade.imagem && atividade.imagem !== 'null' ? 
                    `<img src="${atividade.imagem}" alt="${atividade.titulo}" style="max-width: 100%; max-height: 100%;">` : 
                    `<i class="fas fa-music" style="font-size: 2rem; color: #666;"></i>`
                }
            </div>

            <div class="atividade-mini-objetivo" style="margin-bottom: 0.5rem; font-size: 0.9rem;">
                ${atividade.objetivo || 'Sem objetivo definido'}
            </div>
            
            <div class="atividade-mini-actions">
                <button class="btn btn-primary btn-sm" onclick="window.location.href='/atividade/${atividade.id}'">
                    <i class="bi bi-eye"></i> Ver Detalhes
                </button>
            </div>
        </div>
    `).join('');
    
    if (container) {
        container.innerHTML = html;
        console.log('✅ HTML inserido no container');
    } else {
        console.log('❌ Container não encontrado!');
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