// historico.js - VERSÃO COMPLETA E CORRIGIDA

// Função para formatar data
function formatarData(data) {
    if (!data) return '';
    
    const dataObj = new Date(data);
    const agora = new Date();
    const diferenca = agora - dataObj;
    const minutos = Math.floor(diferenca / (1000 * 60));
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    if (minutos < 1) return 'Agora mesmo';
    if (minutos < 60) return `${minutos} min atrás`;
    if (horas < 24) return `${horas} h atrás`;
    if (dias === 1) return 'Ontem';
    if (dias < 7) return `${dias} dias atrás`;
    
    return dataObj.toLocaleDateString('pt-BR');
}

// Função para verificar se é muito recente
function ehMuitoRecente(dataTexto) {
    const hoje = new Date();
    const dataAcesso = new Date(dataTexto);
    const diferenca = hoje - dataAcesso;
    const horas = diferenca / (1000 * 60 * 60);
    return horas < 24;
}

// Função para validar dados da atividade (CORRIGIDA)
function validarAtividade(atividade) {
    return atividade && 
           atividade.id && 
           (typeof atividade.id === 'string' || typeof atividade.id === 'number') && // ACEITA STRING E NUMBER
           atividade.titulo && 
           typeof atividade.titulo === 'string' &&
           !atividade.titulo.includes('{[atividade.nome]}') && // Filtra dados corrompidos
           !atividade.titulo.includes('{{') && // Filtra templates Handlebars
           atividade.dataAcesso;
}

// Função para limpar histórico corrompido
function limparHistoricoCorrompido() {
    try {
        const historico = obterHistorico();
        const historicoLimpo = historico.filter(validarAtividade);
        
        if (historicoLimpo.length !== historico.length) {
            console.log(`🧹 Limpando ${historico.length - historicoLimpo.length} itens corrompidos`);
            localStorage.setItem('historicoAtividades', JSON.stringify(historicoLimpo));
        }
        
        return historicoLimpo;
    } catch (error) {
        console.error('Erro ao limpar histórico:', error);
        localStorage.removeItem('historicoAtividades'); // Reset completo se corrompido
        return [];
    }
}

// Função para obter histórico do localStorage
function obterHistorico() {
    try {
        const historicoRaw = localStorage.getItem('historicoAtividades');
        if (!historicoRaw) return [];
        
        const historico = JSON.parse(historicoRaw);
        
        // Verifica se é um array válido
        if (!Array.isArray(historico)) {
            console.error('Histórico não é um array, resetando...');
            localStorage.removeItem('historicoAtividades');
            return [];
        }
        
        return historico;
    } catch (error) {
        console.error('Erro ao obter histórico:', error);
        localStorage.removeItem('historicoAtividades');
        return [];
    }
}

// Função para carregar histórico
function carregarHistorico() {
    // Primeiro limpa dados corrompidos
    const historico = limparHistoricoCorrompido();
    const container = document.getElementById('historico-container');
    const vazio = document.getElementById('historico-vazio');

    // Registrar o partial se existir no HTML
    if (window.Handlebars && document.getElementById('atividadeReduzida-partial')) {
        var partialSource = document.getElementById('atividadeReduzida-partial').innerHTML;
        window.Handlebars.registerPartial('atividadeReduzida', partialSource);
    }

    if (!historico || historico.length === 0) {
        if (container) container.style.display = 'none';
        if (vazio) vazio.style.display = 'block';
        return;
    }

    if (container) container.style.display = 'grid';
    if (vazio) vazio.style.display = 'none';

    // Renderizar usando o partial do Handlebars
    if (window.Handlebars && window.Handlebars.partials && window.Handlebars.partials.atividadeReduzida) {
        const template = window.Handlebars.compile(window.Handlebars.partials.atividadeReduzida);
        container.innerHTML = historico.map(atividade => {
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
        container.innerHTML = historico.map(atividade => `
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

    // Inicializar eventos dos botões
    inicializarEventosHistorico();
}

function inicializarEventosHistorico() {
    // Botões de visualizar atividade
    document.querySelectorAll('.visualizar').forEach(btn => {
        btn.addEventListener('click', function() {
            const atividadeId = this.dataset.id;
            console.log('Visualizando atividade:', atividadeId);
            window.location.href = `/atividade/${atividadeId}`;
        });
    });
}

// Função para registrar visualização (usada na página de atividade)
function registrarVisualizacao(atividadeId, atividadeData) {
    try {
        const historico = obterHistorico();
        
        console.log('Registrando visualização:', atividadeId, atividadeData);
        
        // Remover se já existir (para não duplicar)
        const historicoFiltrado = historico.filter(item => item.id != atividadeId); // != em vez de !== para comparar string/number
        
        // Adicionar no início do array
        historicoFiltrado.unshift({
            id: atividadeId,
            ...atividadeData,
            dataAcesso: new Date().toISOString()
        });
        
        // Manter apenas as últimas 20 atividades
        const historicoLimitado = historicoFiltrado.slice(0, 20);
        
        localStorage.setItem('historicoAtividades', JSON.stringify(historicoLimitado));
        console.log('Histórico atualizado:', historicoLimitado.length, 'itens');
    } catch (error) {
        console.error('Erro ao registrar visualização:', error);
    }
}

// Função para debug do histórico
function debugHistorico() {
    console.log('=== DEBUG HISTÓRICO ===');
    const historico = obterHistorico();
    console.log('Itens no histórico:', historico);
    
    // Mostrar detalhes de cada item
    historico.forEach((item, index) => {
        console.log(`Item ${index}:`, {
            id: item.id,
            tipoId: typeof item.id,
            titulo: item.titulo,
            valido: validarAtividade(item)
        });
    });
}

// Exportar funções para uso global
window.registrarVisualizacao = registrarVisualizacao;
window.carregarHistorico = carregarHistorico;
window.debugHistorico = debugHistorico;
window.obterHistorico = obterHistorico;

// Carregar histórico quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Carregando histórico...');
    carregarHistorico();
    
    // Debug automático
    setTimeout(debugHistorico, 1000);
});