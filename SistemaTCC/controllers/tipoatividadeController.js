const express = require('express');
const router = express.Router();
const Tipoatividade = require('../models/tipoatividade');
const Atividade = require('../models/ativ');

router.get('/tipoatividade/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const tipoatividade = await Tipoatividade.findByPk(id);
    
    if (!tipoatividade) {
      return res.status(404).render('erro', {
        mensagem: "Tipo de atividade não encontrado"
      });
    }

    const atividades = await Atividade.findAll({
      where: { tipoatividadeId: id }
    });

    res.render('tipoatividade', {
      tipoatividade: tipoatividade.get({ plain: true }),
      atividades: atividades.map(atv => atv.get({ plain: true }))
    });
    
  } catch (error) {
    console.error('Erro completo:', error);
    res.status(500).render('erro', {
      mensagem: "Erro ao carregar tipo de atividade",
      erro: error.message
    });
  }
});

module.exports = router;