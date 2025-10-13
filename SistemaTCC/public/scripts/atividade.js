// atividade.js - VERSÃO COMPATÍVEL

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

console.log('🎵 Script atividade.js carregado');

// Função para registrar atividade no histórico
function registrarAtividadeNoHistorico(atividadeId, atividadeData) {
    console.log('📝 Registrando atividade no histórico:', atividadeId, atividadeData);
    
    // Verificar se a função global está disponível
    if (typeof window.registrarVisualizacao === 'function') {
        window.registrarVisualizacao(atividadeId, atividadeData);
        console.log('✅ Registrado via função global');
    } else {
        console.error('❌ Função registrarVisualizacao não disponível');
        // Tentar fallback após um delay
        setTimeout(() => {
            if (typeof window.registrarVisualizacao === 'function') {
                window.registrarVisualizacao(atividadeId, atividadeData);
                console.log('✅ Registrado via função global (delay)');
            } else {
                console.error('❌ Função ainda não disponível após delay');
                registrarVisualizacaoFallback(atividadeId, atividadeData);
            }
        }, 1000);
    }
}

// Fallback direto
function registrarVisualizacaoFallback(atividadeId, atividadeData) {
    try {
        const usuarioId = localStorage.getItem('usuarioAtualId');
        if (!usuarioId) {
            console.warn('⚠️ Usuário não identificado no fallback');
            return;
        }

        const chaveHistorico = `historicoAtividades_${usuarioId}`;
        const historicoRaw = localStorage.getItem(chaveHistorico);
        const historico = historicoRaw ? JSON.parse(historicoRaw) : [];
        
        // Remover duplicatas
        const historicoFiltrado = historico.filter(item => item.id != atividadeId);
        
        // Adicionar nova entrada
        historicoFiltrado.unshift({
            id: atividadeId,
            ...atividadeData,
            dataAcesso: new Date().toISOString(),
            usuarioId: usuarioId
        });
        
        // Manter apenas últimos 20
        const historicoLimitado = historicoFiltrado.slice(0, 20);
        localStorage.setItem(chaveHistorico, JSON.stringify(historicoLimitado));
        
        console.log('✅ Registrado via fallback - Itens no histórico:', historicoLimitado.length);
        
    } catch (error) {
        console.error('❌ Erro no fallback:', error);
    }
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏁 DOM carregado - atividade.js inicializado');
    
    // Coletar dados da atividade da página atual
    const urlPath = window.location.pathname;
    const match = urlPath.match(/\/atividade\/(\d+)/);
    
    if (match) {
        const atividadeId = match[1];
        console.log('🎯 Página de atividade detectada:', atividadeId);
        
        // Coletar dados da atividade
        const atividadeData = {
            titulo: document.querySelector('h1')?.textContent || `Atividade ${atividadeId}`,
            objetivo: document.querySelector('.objetivo')?.textContent || 'Atividade musical educativa',
            imagem: document.querySelector('.atividade-imagem img')?.src || 
                    document.querySelector('.card img')?.src ||
                    null,
            categoria: document.querySelector('.categorias')?.textContent || 'Geral'
        };
        
        console.log('📊 Dados coletados:', atividadeData);
        
        // Aguardar um pouco para garantir que todos os scripts carregaram
        setTimeout(() => {
            registrarAtividadeNoHistorico(atividadeId, atividadeData);
        }, 500);
    }
});

// Exportar para uso global
window.registrarAtividadeNoHistorico = registrarAtividadeNoHistorico;
window.registrarVisualizacaoFallback = registrarVisualizacaoFallback;