const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');
const AtividadeTipo = require('../models/atividade_tipo');

exports.porCategoria = async (req, res) => {
  try {
    const tipoId = req.params.id;
    const tipo = await Tipoatividade.findByPk(tipoId);

    // Buscar IDs das atividades que possuem esse tipo
    const atividadesIds = await AtividadeTipo.findAll({
      where: { tipoId: tipoId },
      attributes: ['atividadeId']
    });

    const ids = atividadesIds.map(item => item.atividadeId);

    // Buscar atividades completas com todos os tipos
    const atividades = await ativ.findAll({
      include: [{
        model: Tipoatividade,
        as: 'tipos',
        through: { attributes: [] }
      }],
      where: {
        id: ids
      }
    });

    const plainAtividades = atividades.map(a => {
      const obj = a.get({ plain: true });
      obj.tipos = obj.tipos || [];
      return obj;
    });

    res.render('tipoatividade', { tipo, atividades: plainAtividades });
  } catch (error) {
    console.error('❌ Erro em porCategoria:', error);
    res.status(500).send('Erro ao buscar atividades do tipo selecionado.');
  }
};