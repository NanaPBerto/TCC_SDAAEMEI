const express = require('express');
const router = express.Router();
const tipoatividadeController = require('../controllers/tipoatividadeController');

router.get('/tipoatividade/:id', tipoatividadeController.porCategoria);

module.exports = router;