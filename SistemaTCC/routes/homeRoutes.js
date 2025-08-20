const express = require('express');
const router = express.Router();
const Tipoatividade = require('../models/tipoatividade');

// Rota principal
router.get('/', async (req, res) => {
  try {
    if (req.session.usuario) {
      const pagina = req.session.usuario.tipo === 'musico' ? '/painelM' : '/homeE';
      return res.redirect(pagina);
    }
    res.redirect('/homeE');
  } catch (error) {
    console.error(error);
    res.redirect('/homeE');
  }
});

// Rota para homeE (educador)
router.get('/homeE', async (req, res) => {
  try {
    const tipoatividades = await Tipoatividade.findAll();
    
    res.render('homeE', {
      tipoatividades: tipoatividades.map(tipo => ({
        id: tipo.id,
        nome: tipo.nome,
        icone: tipo.icone || 'fas fa-music'
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erro ao carregar página inicial");
  }
});

module.exports = router;