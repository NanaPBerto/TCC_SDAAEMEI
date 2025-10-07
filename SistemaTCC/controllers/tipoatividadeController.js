const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');
const AtividadeTipo = require('../models/atividade_tipo');


exports.porCategoria = async (req, res) => {
  try {
    const tipoId = req.params.id;
    const tipo = await Tipoatividade.findByPk(tipoId);

    // Buscar todas as atividades que possuem esse tipo (muitos-para-muitos)
    const atividades = await ativ.findAll({
      include: [{
        model: Tipoatividade,
        as: 'tipos',
        through: { attributes: [] },
        where: { id: tipoId }
      }]
    });

    // Extrair tipos de cada atividade para exibir na view
    const plainAtividades = atividades.map(a => {
      const obj = a.get({ plain: true });
      obj.tipos = obj.tipos || [];
      return obj;
    });

    res.render('tipoatividade', { tipo, atividades: plainAtividades });
  } catch (error) {
    res.status(500).send('Erro ao buscar atividades do tipo selecionado.');
  }
};

