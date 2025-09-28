const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');


exports.porCategoria = async (req, res) => {
  try {
    const tipoId = req.params.id;
    const tipo = await Tipoatividade.findByPk(tipoId);
    const atividades = await ativ.findAll({ where: { tipoId: tipoId } });
    const plainAtividades = atividades.map(a => a.get({ plain: true }));
    res.render('tipoatividade', { tipo, atividades: plainAtividades });
  } catch (error) {
    res.status(500).send('Erro ao buscar atividades do tipo selecionado.');
  }
};
 
