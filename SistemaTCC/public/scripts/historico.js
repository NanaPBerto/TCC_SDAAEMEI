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
    
    console.log('Histórico válido:', historico.length, 'itens');
    
    if (!historico || historico.length === 0) {
        if (container) container.style.display = 'none';
        if (vazio) vazio.style.display = 'block';
        return;
    }
    
    if (container) container.style.display = 'grid';
    if (vazio) vazio.style.display = 'none';
    
    // Ordenar por data mais recente primeiro
    historico.sort((a, b) => new Date(b.dataAcesso) - new Date(a.dataAcesso));
    
    // Gerar HTML dos cards APENAS para dados válidos
    const html = historico.map(atividade => {
        if (!validarAtividade(atividade)) {
            console.warn('Atividade inválida ignorada:', atividade);
            return '';
        }
        
        const recente = ehMuitoRecente(atividade.dataAcesso);
        const dataFormatada = formatarData(atividade.dataAcesso);
        
        return `
            <div class="atividade-mini-card ${recente ? 'recente' : ''}" data-categoria="${atividade.categoria || 'Geral'}">
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
                            title="Visualizar Atividade Novamente">
                        <i class="bi bi-eye"></i>
                    </button>
                </div>
                
                <div class="atividade-mini-meta d-flex justify-content-between w-100 mt-2">
                    <small class="text-muted">
                        <i class="bi bi-calendar me-1"></i>
                        ${dataFormatada}
                    </small>
                    <small class="text-muted">
                        <i class="bi bi-check-circle me-1 ${atividade.concluida ? 'text-success' : ''}"></i>
                        ${atividade.concluida ? 'Concluída' : 'Visualizada'}
                    </small>
                </div>
            </div>
        `;
    }).join('');
    
    if (container) {
        container.innerHTML = html;
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