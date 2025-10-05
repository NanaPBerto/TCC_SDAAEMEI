// sugeridas.js - VERSÃO CORRIGIDA COM MESMA LÓGICA DO HISTÓRICO

// Função para validar dados da atividade (IGUAL AO HISTÓRICO)
function validarAtividadeSugerida(atividade) {
    return atividade && 
           atividade.id && 
           (typeof atividade.id === 'string' || typeof atividade.id === 'number') &&
           atividade.titulo && 
           typeof atividade.titulo === 'string' &&
           !atividade.titulo.includes('{[atividade.nome]}') &&
           !atividade.titulo.includes('{{');
}

// Função para selecionar atividades aleatoriamente (MELHORADA)
function selecionarSugestoes(atividades, quantidade = 6) {
    if (!atividades || atividades.length === 0) {
        console.log('Nenhuma atividade disponível para seleção');
        return [];
    }
    
    // Filtrar atividades válidas (USANDO VALIDAÇÃO DO HISTÓRICO)
    const atividadesValidas = atividades.filter(validarAtividadeSugerida);
    
    console.log(`Atividades válidas para sugestões: ${atividadesValidas.length}`);
    
    if (atividadesValidas.length === 0) return [];
    
    if (atividadesValidas.length <= quantidade) {
        return atividadesValidas;
    }
    
    // Seleção aleatória (MESMA LÓGICA)
    const resultado = [];
    const indicesUsados = new Set();
    
    while (resultado.length < quantidade && indicesUsados.size < atividadesValidas.length) {
        const indiceAleatorio = Math.floor(Math.random() * atividadesValidas.length);
        
        if (!indicesUsados.has(indiceAleatorio)) {
            indicesUsados.add(indiceAleatorio);
            resultado.push(atividadesValidas[indiceAleatorio]);
        }
    }
    
    return resultado;
}

// Função para renderizar atividades sugeridas (MESMA ESTRUTURA DO HISTÓRICO)
function renderizarSugestoes(atividades) {
    const container = document.getElementById('sugeridas-container');
    const vazio = document.getElementById('sugeridas-vazio');
    
    console.log(`Renderizando ${atividades.length} atividades sugeridas`);
    
    if (!atividades || atividades.length === 0) {
        if (container) container.style.display = 'none';
        if (vazio) vazio.style.display = 'block';
        return;
    }
    
    if (container) container.style.display = 'grid';
    if (vazio) vazio.style.display = 'none';
    
    // Gerar HTML dos cards APENAS para dados válidos
    const html = atividades.map(atividade => {
        if (!validarAtividadeSugerida(atividade)) {
            console.warn('Atividade sugerida inválida ignorada:', atividade);
            return '';
        }
        
        return `
            <div class="atividade-mini-card" data-categoria="${atividade.tipo || 'Geral'}">
                <div class="atividade-mini-titulo">${atividade.titulo}</div>
                
                <div class="atividade-mini-imgbox">
                    ${atividade.imagem && atividade.imagem !== 'null' && !atividade.imagem.includes('{{') ? 
                        `<img src="${atividade.imagem}" alt="${atividade.titulo}" class="img-fluid"
                             onload="this.parentElement.classList.add('loaded')"
                             onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-music\\'></i>'">` : 
                        `<i class="fas fa-music"></i>`
                    }
                </div>

                <div class="atividade-mini-objetivo">
                    ${atividade.objetivo || 'Sem objetivo definido'}
                </div>
                
                <div class="atividade-mini-actions">
                    <button class="atividade-mini-btn visualizar" 
                            data-id="${atividade.id}"
                            title="Visualizar Atividade">
                        <i class="bi bi-eye"></i> Ver Detalhes
                    </button>
                </div>
                
                <div class="atividade-mini-meta">
                    <small class="text-muted">
                        <i class="bi bi-clock me-1"></i>
                        ${atividade.duracao || '30 min'}
                    </small>
                    <small class="text-muted">
                        <i class="bi bi-tag me-1"></i>
                        ${atividade.tipo || 'Geral'}
                    </small>
                </div>
            </div>
        `;
    }).join('');
    
    if (container) {
        container.innerHTML = html;
    }
    
    // Inicializar eventos
    inicializarEventosSugeridas();
}

// Função para carregar e exibir sugestões (MESMA LÓGICA DO HISTÓRICO)
function carregarSugestoes() {
    try {
        console.log('=== INICIANDO CARREGAMENTO DE SUGESTÕES ===');
        
        // Obter dados das atividades do template (MESMA LÓGICA)
        const atividadesDataElement = document.getElementById('atividades-data');
        let atividades = [];
        
        if (atividadesDataElement && atividadesDataElement.textContent) {
            atividades = JSON.parse(atividadesDataElement.textContent);
            console.log(`📊 Dados carregados do template: ${atividades.length} atividades`);
            
            // Debug: mostrar primeiros itens
            if (atividades.length > 0) {
                console.log('📋 Primeiras atividades:', atividades.slice(0, 3));
            }
        } else {
            console.log('❌ Nenhum dado encontrado no elemento atividades-data');
            console.log('Elemento encontrado:', !!atividadesDataElement);
            if (atividadesDataElement) {
                console.log('Conteúdo:', atividadesDataElement.textContent);
            }
        }
        
        // Selecionar sugestões aleatórias
        const sugestoes = selecionarSugestoes(atividades, 6);
        console.log(`🎯 Sugestões selecionadas: ${sugestoes.length}`);
        
        // Renderizar
        renderizarSugestoes(sugestoes);
        
    } catch (error) {
        console.error('❌ Erro ao carregar sugestões:', error);
        const vazio = document.getElementById('sugeridas-vazio');
        if (vazio) {
            vazio.style.display = 'block';
            vazio.innerHTML = `
                <i class="bi bi-exclamation-triangle display-1 text-warning mb-3"></i>
                <h5 class="text-warning">Erro ao carregar sugestões</h5>
                <p class="text-muted">${error.message}</p>
                <button class="btn btn-primary mt-3" onclick="carregarSugestoes()">
                    <i class="bi bi-arrow-clockwise me-2"></i>Tentar Novamente
                </button>
            `;
        }
    }
}

// Função para inicializar eventos (MESMA LÓGICA DO HISTÓRICO)
function inicializarEventosSugeridas() {
    // Visualizar atividade
    document.querySelectorAll('.visualizar').forEach(btn => {
        btn.addEventListener('click', function() {
            const atividadeId = this.dataset.id;
            console.log('🔍 Visualizando atividade sugerida:', atividadeId);
            
            // Registrar no histórico antes de redirecionar
            const card = this.closest('.atividade-mini-card');
            const titulo = card.querySelector('.atividade-mini-titulo').textContent;
            const objetivo = card.querySelector('.atividade-mini-objetivo').textContent;
            const imagem = card.querySelector('img') ? card.querySelector('img').src : null;
            
            if (window.registrarVisualizacao) {
                window.registrarVisualizacao(atividadeId, {
                    titulo: titulo,
                    objetivo: objetivo,
                    imagem: imagem,
                    tipo: card.dataset.categoria
                });
            }
            
            window.location.href = `/atividade/${atividadeId}`;
        });
    });
}

// Função para recarregar sugestões (MESMA LÓGICA)
function recarregarSugestoes() {
    console.log('🔄 Recarregando sugestões...');
    carregarSugestoes();
    
    // Feedback visual
    const feedback = document.createElement('div');
    feedback.className = 'alert alert-info alert-dismissible fade show position-fixed';
    feedback.style.top = '20px';
    feedback.style.right = '20px';
    feedback.style.zIndex = '1050';
    feedback.innerHTML = `
        <strong>Sugestões atualizadas!</strong> Novas atividades selecionadas.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 3000);
}

// Função para debug das sugestões (IGUAL AO HISTÓRICO)
function debugSugestoes() {
    console.log('=== DEBUG SUGESTÕES ===');
    const atividadesDataElement = document.getElementById('atividades-data');
    let atividades = [];
    
    if (atividadesDataElement && atividadesDataElement.textContent) {
        atividades = JSON.parse(atividadesDataElement.textContent);
    }
    
    console.log('Itens disponíveis:', atividades);
    console.log('Itens válidos:', atividades.filter(validarAtividadeSugerida));
    
    atividades.forEach((item, index) => {
        console.log(`Item ${index}:`, {
            id: item.id,
            tipoId: typeof item.id,
            titulo: item.titulo,
            valido: validarAtividadeSugerida(item)
        });
    });
}

// Exportar funções para uso global
window.carregarSugestoes = carregarSugestoes;
window.recarregarSugestoes = recarregarSugestoes;
window.debugSugestoes = debugSugestoes;

// Inicializar quando a página carregar (MESMA LÓGICA)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM carregado, inicializando sugestões...');
    
    // Aguardar um pouco para garantir que tudo está carregado
    setTimeout(() => {
        carregarSugestoes();
        debugSugestoes(); // Debug automático
    }, 100);
});