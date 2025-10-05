const express = require('express');
const router = express.Router();
const Tipoatividade = require('../models/tipoatividade');
const atividadeController = require('../controllers/atividadeController'); // ← ADD

// Rota principal - REDIRECIONAMENTO
router.get('/', async (req, res) => {
  try {
    if (req.session.usuario) {
      const pagina = req.session.usuario.tipo === 'musico' ? '/painelM' : '/index';
      return res.redirect(pagina);
    }
    res.redirect('/index');
  } catch (error) {
    console.error(error);
    res.redirect('/index');
  }
}); 

// Rota para index (educador)
router.get('/index', atividadeController.home, async (req, res) => {
  try {
    const tipoatividades = await Tipoatividade.findAll();
    
    res.render('index', {
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