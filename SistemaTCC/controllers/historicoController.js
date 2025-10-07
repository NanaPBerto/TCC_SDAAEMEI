const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');

exports.getHistorico = async (req, res) => {
    try {
        const usuario = req.session.usuario;
        if (!usuario) {
            return res.redirect('/login');
        }

        // Buscar TODAS as atividades existentes no banco
        const todasAtividades = await ativ.findAll({
            attributes: ['id', 'nome', 'objetivo', 'imagem'],
            include: [{
                model: Tipoatividade,
                as: 'tipos',
                through: { attributes: [] }
            }]
        });

        const idsExistentes = todasAtividades.map(a => a.id);
        
        // Aqui você pode passar os IDs existentes para o frontend
        res.render('historicoA', { 
            historico: [], // O histórico real vem do localStorage
            idsExistentes: idsExistentes // Para debug
        });
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        res.render('historicoA', { historico: [] });
    }
};

// Rota para API - Retorna TODAS as atividades existentes
exports.getAtividadesExistentes = async (req, res) => {
    try {
        // Busca TODAS as atividades do banco (não filtra por usuário)
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
        
        console.log(`📋 API: ${atividadesExistentes.length} atividades existentes no banco`);
        res.json(atividadesExistentes);
        
    } catch (error) {
        console.error('Erro ao buscar atividades existentes:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};