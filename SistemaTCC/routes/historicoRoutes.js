const express = require('express');
const router = express.Router();
const historicoController = require('../controllers/historicoController');

// Rota para a página de histórico
router.get('/historico', historicoController.getHistorico);

// Rota para a API de atividades existentes
router.get('/api/historico/existentes', historicoController.getAtividadesExistentes);

module.exports = router;