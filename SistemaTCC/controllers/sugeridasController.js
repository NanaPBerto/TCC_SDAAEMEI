const Atividade = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');

exports.getSugeridas = async (req, res) => {
    try {
        console.log('=== 🚀 ROTA /sugeridas ACESSADA ===');
        console.log('📝 Método:', req.method);
        console.log('👤 Usuário:', req.session.usuario);
        
        // Buscar todas as atividades
        const atividades = await Atividade.findAll({
            attributes: ['id', 'nome', 'objetivo', 'imagem', 'duracao', 'indicacao', 'tipoId', 'createdAt'],
            include: [
                {
                    model: Tipoatividade,
                    as: 'tipo',
                    attributes: ['nome']
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        console.log(`✅ Encontradas ${atividades.length} atividades no banco`);

        // Processar os dados
        const atividadesProcessadas = atividades.map(a => {
            const atividade = a.get({ plain: true });
            return {
                id: atividade.id,
                titulo: atividade.nome, 
                objetivo: atividade.objetivo,
                imagem: atividade.imagem,
                duracao: atividade.duracao,
                indicacao: atividade.indicacao,
                tipo: atividade.tipo ? atividade.tipo.nome : 'Geral',
                dataCriacao: atividade.createdAt
            };
        });

        console.log('🎯 Dados processados:', atividadesProcessadas.length, 'atividades');
        
        if (atividadesProcessadas.length > 0) {
            console.log('📋 Primeira atividade:', atividadesProcessadas[0]);
        }

        res.render('sugeridasA', { 
            atividades: atividadesProcessadas
        });
        
    } catch (error) {
        console.error('❌ Erro CRÍTICO em getSugeridas:', error);
        res.render('sugeridasA', { 
            atividades: [],
            error: error.message 
        });
    }
};