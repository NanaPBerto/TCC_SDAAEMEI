// historico.js - VERSÃO CORRIGIDA

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

// Função para validar dados da atividade
function validarAtividade(atividade) {
    return atividade && 
           atividade.id && 
           (typeof atividade.id === 'string' || typeof atividade.id === 'number') &&
           atividade.titulo && 
           typeof atividade.titulo === 'string' &&
           !atividade.titulo.includes('{[atividade.nome]}') &&
           !atividade.titulo.includes('{{') &&
           atividade.dataAcesso;
}

// Função para obter histórico do localStorage
function obterHistorico() {
    try {
        const historicoRaw = localStorage.getItem('historicoAtividades');
        if (!historicoRaw) return [];
        
        const historico = JSON.parse(historicoRaw);
        
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
        localStorage.removeItem('historicoAtividades');
        return [];
    }
}

// Função para carregar histórico (CORRIGIDA)
function carregarHistorico() {
    try {
        const historico = limparHistoricoCorrompido();
        const container = document.getElementById('historico-container');
        const vazio = document.getElementById('historico-vazio');

        // Verifica se os elementos existem
        if (!container || !vazio) {
            console.error('Elementos do histórico não encontrados no DOM');
            return;
        }

        if (!historico || historico.length === 0) {
            container.style.display = 'none';
            vazio.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        vazio.style.display = 'none';

        // Fallback: renderização manual
        container.innerHTML = historico.map(atividade => {
            const dataFormatada = formatarData(atividade.dataAcesso);
            const recente = ehMuitoRecente(atividade.dataAcesso);
            
            return `
                <div class="atividade-mini-card ${recente ? 'recente' : ''}" data-categoria="${atividade.categoria || 'Geral'}">
                    <div class="atividade-mini-titulo">${atividade.titulo || atividade.nome}</div>
                    <div class="atividade-mini-imgbox mb-2">
                        ${atividade.imagem ? 
                            `<img src="${atividade.imagem}" alt="Imagem da Atividade">` : 
                            `<i class="fas fa-music fa-2x"></i>`
                        }
                    </div>
                    <div class="atividade-mini-objetivo">${atividade.objetivo || ''}</div>
                    <div class="atividade-mini-actions">
                        <a href="/atividade/${atividade.id}" title="Ver detalhes">
                            <button type="button" class="atividade-mini-btn visualizar" data-id="${atividade.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                        </a>
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

        // Inicializar eventos dos botões
        inicializarEventosHistorico();
        
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

function inicializarEventosHistorico() {
    // Botões de visualizar atividade
    document.querySelectorAll('.visualizar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const atividadeId = this.dataset.id;
            console.log('Visualizando atividade:', atividadeId);
            window.location.href = `/atividade/${atividadeId}`;
        });
    });
}

// Função para registrar visualização
function registrarVisualizacao(atividadeId, atividadeData) {
    try {
        const historico = obterHistorico();
        
        console.log('Registrando visualização:', atividadeId, atividadeData);
        
        // Remover se já existir (para não duplicar)
        const historicoFiltrado = historico.filter(item => item.id != atividadeId);
        
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

// FUNÇÕES DE LIMPEZA E SINCRONIZAÇÃO (CORRIGIDAS)

/**
 * Remove atividades do histórico que não existem mais no banco de dados
 */
function removerAtividadesInexistentes(atividadesExistentes = []) {
    try {
        const historico = obterHistorico();
        
        // Se não fornecer atividades existentes, faz limpeza básica
        if (!atividadesExistentes || atividadesExistentes.length === 0) {
            console.log('⚠️ Nenhuma atividade existente fornecida, fazendo limpeza básica');
            return limparHistoricoCorrompido();
        }
        
        const idsExistentes = atividadesExistentes.map(a => a.id.toString());
        
        console.log('IDs existentes no banco:', idsExistentes);
        console.log('Histórico antes da limpeza:', historico.length, 'itens');
        
        const historicoFiltrado = historico.filter(atividade => {
            const atividadeId = atividade.id.toString();
            const existe = idsExistentes.includes(atividadeId);
            
            if (!existe) {
                console.log(`🗑️ Removendo atividade inexistente: ${atividadeId} - ${atividade.titulo}`);
            }
            
            return existe;
        });
        
        if (historicoFiltrado.length !== historico.length) {
            const removidos = historico.length - historicoFiltrado.length;
            console.log(`✅ Removidas ${removidos} atividades inexistentes do histórico`);
            localStorage.setItem('historicoAtividades', JSON.stringify(historicoFiltrado));
        }
        
        return historicoFiltrado;
    } catch (error) {
        console.error('Erro ao remover atividades inexistentes:', error);
        return obterHistorico();
    }
}

/**
 * Sincroniza o histórico local com o servidor (CORRIGIDA)
 */
async function sincronizarHistoricoComServidor() {
    try {
        console.log('🔄 Sincronizando histórico com servidor...');
        
        let atividadesExistentes = [];
        
        // 1. Buscar atividades existentes no servidor
        try {
            const response = await fetch('/api/historico/existentes');
            if (response.ok) {
                atividadesExistentes = await response.json();
                console.log(`📋 Encontradas ${atividadesExistentes.length} atividades no banco`);
            } else {
                throw new Error(`Servidor retornou status ${response.status}`);
            }
        } catch (fetchError) {
            console.error('❌ Erro ao buscar atividades:', fetchError);
            mostrarStatusSincronizacao('Erro ao conectar com o servidor', 'erro');
            return;
        }

        // 2. Obter histórico atual
        const historicoAtual = obterHistorico();
        console.log(`📚 Histórico atual: ${historicoAtual.length} atividades`);

        // 3. Criar mapa de IDs existentes para busca rápida
        const idsExistentes = new Set(atividadesExistentes.map(a => a.id.toString()));
        
        // 4. Filtrar histórico - manter apenas atividades que existem no banco
        const historicoFiltrado = historicoAtual.filter(atividade => {
            const existe = idsExistentes.has(atividade.id.toString());
            if (!existe) {
                console.log(`🗑️ Removendo atividade inexistente: ${atividade.id} - "${atividade.titulo}"`);
            }
            return existe;
        });

        // 5. Atualizar dados das atividades que ainda existem
        const historicoAtualizado = historicoFiltrado.map(atividade => {
            const atividadeAtual = atividadesExistentes.find(a => a.id.toString() === atividade.id.toString());
            if (atividadeAtual) {
                return {
                    ...atividade, // Mantém dataAcesso, etc.
                    titulo: atividadeAtual.titulo,
                    objetivo: atividadeAtual.objetivo,
                    imagem: atividadeAtual.imagem,
                    tipos: atividadeAtual.tipos
                };
            }
            return atividade;
        });

        // 6. Salvar histórico limpo
        localStorage.setItem('historicoAtividades', JSON.stringify(historicoAtualizado));
        
        const removidos = historicoAtual.length - historicoAtualizado.length;
        console.log(`✅ Sincronização concluída: ${removidos} atividades removidas`);

        // 7. Mostrar resultado para usuário
        if (removidos > 0) {
            mostrarStatusSincronizacao(`${removidos} atividades inexistentes foram removidas do histórico`, 'sucesso');
        } else {
            mostrarStatusSincronizacao('Histórico já está sincronizado', 'info');
        }

        // 8. Recarregar a interface
        carregarHistorico();
        
        return historicoAtualizado;
        
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
        mostrarStatusSincronizacao('Erro ao sincronizar histórico', 'erro');
        return obterHistorico();
    }
}

/**
 * Função específica para limpar atividades inexistentes
 */
function limparAtividadesInexistentes() {
    console.log('🔍 Procurando atividades inexistentes no histórico...');
    sincronizarHistoricoComServidor();
}

/**
 * Limpa completamente o histórico
 */
function limparHistoricoCompleto() {
    try {
        const historicoAntes = obterHistorico().length;
        localStorage.removeItem('historicoAtividades');
        console.log(`🧹 Histórico limpo completamente. ${historicoAntes} itens removidos.`);
        
        // Atualiza a interface
        carregarHistorico();
        
        return true;
    } catch (error) {
        console.error('Erro ao limpar histórico completo:', error);
        return false;
    }
}

/**
 * Remove uma atividade específica do histórico
 */
function removerAtividadeEspecifica(atividadeId) {
    try {
        const historico = obterHistorico();
        const historicoFiltrado = historico.filter(item => item.id != atividadeId);
        
        if (historicoFiltrado.length !== historico.length) {
            localStorage.setItem('historicoAtividades', JSON.stringify(historicoFiltrado));
            console.log(`✅ Atividade ${atividadeId} removida do histórico`);
            
            carregarHistorico();
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Erro ao remover atividade específica:', error);
        return false;
    }
}

// Função para debug do histórico
function debugHistorico() {
    console.log('=== DEBUG HISTÓRICO ===');
    const historico = obterHistorico();
    console.log('Itens no histórico:', historico.length);
    console.log('Detalhes:', historico);
}

// Exportar funções para uso global
window.registrarVisualizacao = registrarVisualizacao;
window.carregarHistorico = carregarHistorico;
window.debugHistorico = debugHistorico;
window.obterHistorico = obterHistorico;
window.limparHistoricoCompleto = limparHistoricoCompleto;
window.removerAtividadeEspecifica = removerAtividadeEspecifica;
window.sincronizarHistoricoComServidor = sincronizarHistoricoComServidor;
window.removerAtividadesInexistentes = removerAtividadesInexistentes;

// Carregar histórico quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Carregando histórico...');
    
    // Verifica se estamos na página de histórico
    const isHistoricoPage = document.getElementById('historico-container');
    
    if (isHistoricoPage) {
        // Na página de histórico, faz sincronização
        sincronizarHistoricoComServidor().then(() => {
            carregarHistorico();
        }).catch(error => {
            console.error('Erro na sincronização:', error);
            carregarHistorico(); // Carrega mesmo com erro
        });
    } else {
        // Em outras páginas, apenas carrega se necessário
        carregarHistorico();
    }
});