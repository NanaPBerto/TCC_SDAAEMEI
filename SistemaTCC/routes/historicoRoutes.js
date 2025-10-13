const express = require('express');
const router = express.Router();
const historicoController = require('../controllers/historicoController');

// Rota para a página de histórico
router.get('/historico', historicoController.getHistorico);

// Rota para a API de atividades existentes
router.get('/api/historico/existentes', historicoController.getAtividadesExistentes);
router.get('/api/historico/debug', historicoController.debugHistorico);
router.get('/api/historico/debug-detalhado', historicoController.debugHistoricoDetalhado);
module.exports = router;