const express = require('express');
const router = express.Router();
const Tipoatividade = require('../models/tipoatividade');
const Atividade = require('../models/ativ');

router.get('/tipoatividade/:id', async (req, res) => {
  try {
    const tipo = await Tipoatividade.findByPk(req.params.id);
    const atividades = await Atividade.findAll({
      where: { tipoatividadeId: req.params.id }
    });

    res.render('tipoatividade', {
      tipoatividade: tipo.get({ plain: true }),
      atividades: atividades.map(atv => atv.get({ plain: true }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao carregar tipo de atividade");
  }
});

module.exports = router;