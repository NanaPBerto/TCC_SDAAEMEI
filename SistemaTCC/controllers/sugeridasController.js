const Atividade = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');

exports.getSugeridas = async (req, res) => {
    try {
        console.log('=== INICIANDO BUSCA DE ATIVIDADES SUGERIDAS ===');
        
        // Buscar todas as atividades (similar ao histórico)
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

        console.log(`✅ Encontradas ${atividades.length} atividades no total`);

        // Processar os dados para o template (igual ao histórico)
        const atividadesProcessadas = atividades.map(a => {
            const atividade = a.get({ plain: true });
            return {
                id: atividade.id,
                titulo: atividade.nome, // MUDANÇA CRÍTICA: usar 'titulo' igual ao histórico
                objetivo: atividade.objetivo,
                imagem: atividade.imagem,
                duracao: atividade.duracao,
                indicacao: atividade.indicacao,
                tipo: atividade.tipo ? atividade.tipo.nome : 'Geral',
                dataCriacao: atividade.createdAt
            };
        });

        console.log('🎯 Dados processados para sugestões:', atividadesProcessadas.length);

        res.render('sugeridasA', { 
            atividades: atividadesProcessadas // MANTER O NOME 'atividades' para o template
        });
    } catch (error) {
        console.error('❌ Erro ao buscar atividades sugeridas:', error);
        res.render('sugeridasA', { atividades: [] });
    }
};