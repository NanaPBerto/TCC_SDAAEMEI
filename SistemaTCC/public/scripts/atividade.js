// atividade.js - VERSÃO COMPATÍVEL

// Registrar visualização automaticamente quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se é uma página de atividade válida
    const path = window.location.pathname;
    if (!path.includes('/atividade/') || path === '/atividade') return;
    
    const atividadeId = path.split('/').pop();
    if (!atividadeId || atividadeId === 'atividade') return;
    
    // Extrair dados da atividade do template de forma segura
    const atividadeData = {
        titulo: getSafeText('.atividade-detalhada-titulo') || 'Atividade Sem Nome',
        imagem: getSafeImageSrc('.atividade-detalhada-imgbox img'),
        objetivo: getSafeText('.atividade-detalhada-info-col strong:first-child + div') || 'Sem objetivo definido',
        categoria: getSafeText('.atividade-detalhada-badge:first-child')?.replace('●', '').trim() || 'Geral',
        progresso: 0,
        concluida: false
    };
    
    // Validar dados antes de registrar
    if (isValidActivityData(atividadeData)) {
        console.log('Registrando atividade no histórico:', atividadeId, atividadeData);
        
        // Garantir que o ID seja string para compatibilidade
        registrarVisualizacao(String(atividadeId), atividadeData);
    } else {
        console.warn('Dados da atividade inválidos, não registrando no histórico');
    }
});

// Funções auxiliares para extração segura de dados
function getSafeText(selector) {
    try {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : null;
    } catch (error) {
        console.error('Erro ao obter texto:', error);
        return null;
    }
}

function getSafeImageSrc(selector) {
    try {
        const img = document.querySelector(selector);
        return img && img.src ? img.src : '';
    } catch (error) {
        console.error('Erro ao obter imagem:', error);
        return '';
    }
}

function isValidActivityData(data) {
    return data &&
           data.titulo &&
           typeof data.titulo === 'string' &&
           !data.titulo.includes('{{') &&
           !data.titulo.includes('{[atividade.nome]}') &&
           data.titulo !== 'Atividade Sem Nome';
}

function registrarVisualizacao(atividadeId, atividadeData) {
    const historico = JSON.parse(localStorage.getItem('historicoAtividades') || '[]');
    
    // Remover se já existir
    const historicoFiltrado = historico.filter(item => item.id !== atividadeId);
    
    // Adicionar no início
    historicoFiltrado.unshift({
        id: atividadeId,
        ...atividadeData,
        dataAcesso: new Date().toISOString()
    });
    
    // Manter apenas últimas 20
    const historicoLimitado = historicoFiltrado.slice(0, 20);
    localStorage.setItem('historicoAtividades', JSON.stringify(historicoLimitado));
}