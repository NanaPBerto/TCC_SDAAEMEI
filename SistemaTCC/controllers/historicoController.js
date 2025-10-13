const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');

exports.getHistorico = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        if (!usuario) {
            return res.redirect('/login');
        }

        // Buscar atividades existentes no banco
        const todasAtividades = await ativ.findAll({
            attributes: ['id', 'nome', 'objetivo', 'imagem'],
            include: [{
                model: Tipoatividade,
                as: 'tipos',
                through: { attributes: [] }
            }]
        });

        const idsExistentes = todasAtividades.map(a => a.id);
        
        console.log(`📊 Carregando página de histórico para usuário: ${usuario.id} - ${usuario.nome}`);
        
        // Renderizar página com ID do usuário
        res.render('historicoA', { 
            historico: [],
            idsExistentes: idsExistentes,
            usuarioId: usuario.id,
            session: req.session // ⭐⭐ IMPORTANTE: passar session para views
        });
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        res.render('historicoA', { 
            historico: [],
            usuarioId: req.session.usuario ? req.session.usuario.id : null,
            session: req.session
        });
    }
};

// Rota para API - Retorna atividades existentes FILTRADAS POR USUÁRIO
exports.getAtividadesExistentes = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        if (!usuario) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        // Busca TODAS as atividades do banco (não filtra por usuário ainda)
        const atividades = await ativ.findAll({
            attributes: ['id', 'nome', 'objetivo', 'imagem'],
            include: [{
                model: Tipoatividade,
                as: 'tipos',
                through: { attributes: [] }
            }]
        });

        const atividadesExistentes = atividades.map(a => ({
            id: a.id,
            titulo: a.nome,
            objetivo: a.objetivo,
            imagem: a.imagem,
            tipos: a.tipos
        }));
        
        console.log(`📋 API: ${atividadesExistentes.length} atividades existentes no banco para usuário ${usuario.id}`);
        res.json({
            atividades: atividadesExistentes,
            usuarioId: usuario.id // ⭐⭐ INCLUIR ID DO USUÁRIO NA RESPOSTA
        });
        
    } catch (error) {
        console.error('Erro ao buscar atividades existentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// Rota para debug - retorna histórico atual do usuário
exports.debugHistorico = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        if (!usuario) {
            return res.json({ error: 'Usuário não logado' });
        }

        const chaveHistorico = `historicoAtividades_${usuario.id}`;
        const historicoRaw = req.cookies ? req.cookies[chaveHistorico] : null;
        
        res.json({
            usuarioId: usuario.id,
            chaveHistorico: chaveHistorico,
            historico: historicoRaw ? JSON.parse(historicoRaw) : [],
            todasChaves: Object.keys(req.cookies || {}).filter(k => k.includes('historico'))
        });
    } catch (error) {
        console.error('Erro no debug:', error);
        res.status(500).json({ error: error.message });
    }
};

// Rota para debug detalhado do histórico
exports.debugHistoricoDetalhado = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        if (!usuario) {
            return res.json({ error: 'Usuário não logado' });
        }

        const chaveHistorico = `historicoAtividades_${usuario.id}`;
        
        // Simular acesso ao localStorage do cliente
        // Nota: Isso não funciona no servidor, apenas para demonstração
        const historicoExemplo = [
            {
                id: 1,
                titulo: "Atividade de Exemplo",
                objetivo: "Esta é uma atividade de exemplo",
                dataAcesso: new Date().toISOString(),
                usuarioId: usuario.id
            }
        ];

        // Buscar atividades do banco para comparação
        const atividadesBanco = await ativ.findAll({
            attributes: ['id', 'nome', 'objetivo', 'imagem'],
            limit: 10
        });

        res.json({
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                tipo: usuario.tipo
            },
            chaveHistorico: chaveHistorico,
            historicoLocalStorage: `[O histórico é armazenado no localStorage do navegador com chave: ${chaveHistorico}]`,
            atividadesNoBanco: atividadesBanco.map(a => ({
                id: a.id,
                nome: a.nome,
                objetivo: a.objetivo
            })),
            instrucoes: [
                '1. Acesse uma atividade específica (/atividade/1)',
                '2. O sistema deve registrar automaticamente no localStorage',
                '3. Verifique com verificarEstadoHistorico() no console',
                '4. Acesse /historico para ver o histórico filtrado'
            ]
        });
        
    } catch (error) {
        console.error('Erro no debug detalhado:', error);
        res.status(500).json({ error: error.message });
    }
};