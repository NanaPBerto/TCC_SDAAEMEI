// historico.js - VERSÃO COM FILTRAGEM POR USUÁRIO

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

// Função para obter ID do usuário atual (VERSÃO MELHORADA)
function obterUsuarioId() {
    try {
        // 1. Tentar do elemento hidden na página de histórico
        const usuarioIdElement = document.getElementById('usuario-id');
        if (usuarioIdElement && usuarioIdElement.value) {
            return usuarioIdElement.value;
        }
        
        // 2. Tentar de data attributes em outras páginas
        const dataUsuarioId = document.querySelector('[data-usuario-id]')?.dataset.usuarioId;
        if (dataUsuarioId) {
            return dataUsuarioId;
        }
        
        // 3. Tentar do localStorage (fallback)
        const storedUserId = localStorage.getItem('usuarioAtualId');
        if (storedUserId) {
            return storedUserId;
        }
        
        // 4. Tentar da sessionStorage
        const sessionUserId = sessionStorage.getItem('usuarioAtualId');
        if (sessionUserId) {
            return sessionUserId;
        }
        
        console.warn('⚠️ Não foi possível obter ID do usuário de nenhuma fonte');
        return null;
    } catch (error) {
        console.error('Erro ao obter ID do usuário:', error);
        return null;
    }
}

// Função para gerar chave única por usuário
function obterChaveHistorico() {
    const usuarioId = obterUsuarioId();
    return usuarioId ? `historicoAtividades_${usuarioId}` : 'historicoAtividades_global';
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

// Função para obter histórico do localStorage (FILTRADO POR USUÁRIO)
function obterHistorico() {
    try {
        const chaveHistorico = obterChaveHistorico();
        const historicoRaw = localStorage.getItem(chaveHistorico);
        
        if (!historicoRaw) return [];
        
        const historico = JSON.parse(historicoRaw);
        
        if (!Array.isArray(historico)) {
            console.error('Histórico não é um array, resetando...');
            localStorage.removeItem(chaveHistorico);
            return [];
        }
        
        return historico;
    } catch (error) {
        console.error('Erro ao obter histórico:', error);
        const chaveHistorico = obterChaveHistorico();
        localStorage.removeItem(chaveHistorico);
        return [];
    }
}

// Função para salvar histórico no localStorage (FILTRADO POR USUÁRIO)
function salvarHistorico(historico) {
    try {
        const chaveHistorico = obterChaveHistorico();
        localStorage.setItem(chaveHistorico, JSON.stringify(historico));
    } catch (error) {
        console.error('Erro ao salvar histórico:', error);
    }
}

// Função para limpar histórico corrompido
function limparHistoricoCorrompido() {
    try {
        const historico = obterHistorico();
        const historicoLimpo = historico.filter(validarAtividade);
        
        if (historicoLimpo.length !== historico.length) {
            console.log(`🧹 Limpando ${historico.length - historicoLimpo.length} itens corrompidos`);
            salvarHistorico(historicoLimpo);
        }
        
        return historicoLimpo;
    } catch (error) {
        console.error('Erro ao limpar histórico:', error);
        const chaveHistorico = obterChaveHistorico();
        localStorage.removeItem(chaveHistorico);
        return [];
    }
}

// Função para carregar histórico (CORRIGIDA COM FILTRO POR USUÁRIO)
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

        // Renderização manual
        container.innerHTML = historico.map(atividade => {
            const dataFormatada = formatarData(atividade.dataAcesso);
            const recente = new Date() - new Date(atividade.dataAcesso) < 24 * 60 * 60 * 1000;
            const nome = atividade.tipos ? atividade.tipos.map(tipo => tipo.nome).join(', ') : 'Geral';
            
            return `
            <div class="atividade-mini-card" data-categoria="${atividade.categoria || 'Geral'}">
                <div class="atividade-mini-titulo">${atividade.titulo || atividade.nome}</div>
                <div class="atividade-mini-imgbox mb-2">
                    ${atividade.imagem ? `<img src="${atividade.imagem}" alt="Imagem da Atividade">` : `<i class="fas fa-music fa-2x" style="color: var(--primary-light);"></i>`}
                </div>
                <div class="atividade-mini-objetivo">${atividade.objetivo || ''}</div>
                    <div class="atividade-mini-badges mb-2">
                        <span class="atividade-mini-badge">
                            <i class="fas fa-tag"></i>
                            ${atividade.tipos.map(tipo => tipo.nome).join(', ')}
                        </span>
                    </div>                  
                <div class="atividade-mini-actions">
                    <a href="/atividade/${atividade.id}" title="Ver detalhes">
                        <button type="button" class="atividade-mini-btn">
                            <i class="fas fa-eye"></i>
                        </button>
                    </a>
                </div>
                    <div class="atividade-mini-meta d-flex justify-content-between w-100 mt-2">
                        <small class="text-muted">
                            <i class="bi bi-calendar me-1"></i>
                            ${dataFormatada}
                        </small>
                    </div>
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

// Função para registrar visualização (VERSÃO CORRIGIDA)
function registrarVisualizacao(atividadeId, atividadeData) {
    try {
        console.log('🎯 Tentando registrar visualização:', atividadeId, atividadeData);
        
        const usuarioId = obterUsuarioId();
        if (!usuarioId) {
            console.warn('⚠️ Não foi possível obter ID do usuário para registrar histórico');
            // Tentar obter da sessão de outras formas
            const sessionUserId = document.querySelector('[data-usuario-id]')?.dataset.usuarioId;
            if (sessionUserId) {
                console.log('✅ ID do usuário obtido do data attribute:', sessionUserId);
                localStorage.setItem('usuarioAtualId', sessionUserId);
            } else {
                console.error('❌ ID do usuário não disponível');
                return;
            }
        }

        const historico = obterHistorico();
        
        console.log(`📝 Registrando visualização para usuário ${usuarioId}:`, {
            atividadeId,
            titulo: atividadeData.titulo,
            historicoAtual: historico.length
        });
        
        // Remover se já existir (para não duplicar)
        const historicoFiltrado = historico.filter(item => item.id != atividadeId);
        
        // Adicionar no início do array
        const novaEntrada = {
            id: atividadeId,
            ...atividadeData,
            dataAcesso: new Date().toISOString(),
            usuarioId: usuarioId
        };
        
        historicoFiltrado.unshift(novaEntrada);
        
        // Manter apenas as últimas 20 atividades
        const historicoLimitado = historicoFiltrado.slice(0, 20);
        
        salvarHistorico(historicoLimitado);
        console.log(`✅ Histórico atualizado para usuário ${usuarioId}:`, historicoLimitado.length, 'itens');
        
        // Debug: verificar se salvou corretamente
        const historicoVerificado = obterHistorico();
        console.log('🔍 Histórico após salvar:', historicoVerificado.length, 'itens');
        
    } catch (error) {
        console.error('❌ Erro ao registrar visualização:', error);
    }
}

// FUNÇÕES DE LIMPEZA E SINCRONIZAÇÃO (ATUALIZADAS)

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
            salvarHistorico(historicoFiltrado);
        }
        
        return historicoFiltrado;
    } catch (error) {
        console.error('Erro ao remover atividades inexistentes:', error);
        return obterHistorico();
    }
}

/**
 * Sincroniza o histórico local com o servidor (ATUALIZADA)
 */
async function sincronizarHistoricoComServidor() {
    try {
        const usuarioId = obterUsuarioId();
        if (!usuarioId) {
            console.error('❌ Não foi possível obter ID do usuário para sincronização');
            mostrarStatusSincronizacao('Usuário não identificado', 'erro');
            return;
        }

        console.log(`🔄 Sincronizando histórico do usuário ${usuarioId} com servidor...`);
        
        let atividadesExistentes = [];
        
        // 1. Buscar atividades existentes no servidor
        try {
            const response = await fetch('/api/historico/existentes');
            if (response.ok) {
                const data = await response.json();
                atividadesExistentes = data.atividades || [];
                console.log(`📋 Encontradas ${atividadesExistentes.length} atividades no banco`);
            } else {
                throw new Error(`Servidor retornou status ${response.status}`);
            }
        } catch (fetchError) {
            console.error('❌ Erro ao buscar atividades:', fetchError);
            mostrarStatusSincronizacao('Erro ao conectar com o servidor', 'erro');
            return;
        }

        // 2. Obter histórico atual do usuário
        const historicoAtual = obterHistorico();
        console.log(`📚 Histórico atual do usuário ${usuarioId}: ${historicoAtual.length} atividades`);

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
                    ...atividade, // Mantém dataAcesso, usuarioId, etc.
                    titulo: atividadeAtual.titulo,
                    objetivo: atividadeAtual.objetivo,
                    imagem: atividadeAtual.imagem,
                    tipos: atividadeAtual.tipos
                };
            }
            return atividade;
        });

        // 6. Salvar histórico limpo
        salvarHistorico(historicoAtualizado);
        
        const removidos = historicoAtual.length - historicoAtualizado.length;
        console.log(`✅ Sincronização concluída para usuário ${usuarioId}: ${removidos} atividades removidas`);

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
 * Limpa completamente o histórico DO USUÁRIO ATUAL
 */
function limparHistoricoCompleto() {
    try {
        const historicoAntes = obterHistorico().length;
        const chaveHistorico = obterChaveHistorico();
        localStorage.removeItem(chaveHistorico);
        console.log(`🧹 Histórico do usuário limpo completamente. ${historicoAntes} itens removidos.`);
        
        // Atualiza a interface
        carregarHistorico();
        
        return true;
    } catch (error) {
        console.error('Erro ao limpar histórico completo:', error);
        return false;
    }
}

// Função para mostrar status da sincronização
function mostrarStatusSincronizacao(mensagem, tipo = 'info') {
    console.log(`Sincronização: ${mensagem}`);
    
    // Remove toasts antigos
    document.querySelectorAll('.historico-toast').forEach(toast => toast.remove());
    
    // Cria novo toast
    const toast = document.createElement('div');
    toast.className = `historico-toast alert alert-${tipo === 'erro' ? 'danger' : tipo === 'sucesso' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 80px; right: 20px; z-index: 1050; min-width: 300px;';
    toast.innerHTML = `
        <strong>${tipo === 'erro' ? '❌ Erro' : tipo === 'sucesso' ? '✅ Sucesso' : 'ℹ️ Info'}</strong> 
        ${mensagem}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Remove automaticamente após 4 segundos
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
}

// Função para debug do histórico atual
function debugHistoricoAtual() {
    console.log('=== DEBUG HISTÓRICO ATUAL ===');
    const usuarioId = obterUsuarioId();
    const chaveHistorico = obterChaveHistorico();
    const historico = obterHistorico();
    
    console.log('Usuário ID:', usuarioId);
    console.log('Chave do histórico:', chaveHistorico);
    console.log('Itens no histórico:', historico.length);
    console.log('Detalhes:', historico);
    
    // Verificar localStorage
    console.log('Chaves no localStorage:');
    Object.keys(localStorage).forEach(key => {
        if (key.includes('historico')) {
            console.log(`- ${key}: ${localStorage.getItem(key).length} chars`);
        }
    });
}

// Exportar funções para uso global
window.registrarVisualizacao = registrarVisualizacao;
window.carregarHistorico = carregarHistorico;
window.limparHistoricoCompleto = limparHistoricoCompleto;
window.sincronizarHistoricoComServidor = sincronizarHistoricoComServidor;
window.debugHistoricoAtual = debugHistoricoAtual;

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