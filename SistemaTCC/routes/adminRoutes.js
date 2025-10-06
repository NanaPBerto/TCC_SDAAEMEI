// routes/adminRoutes.js - CORRIGIDO
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { checkAdmin } = require('../middleware/authMiddleware');

router.get('/listar-usuarios', checkAdmin, adminController.listarUsuarios);
router.post('/validar-usuario/:id', checkAdmin, adminController.validarUsuario);
router.post('/desvalidar-usuario/:id', checkAdmin, adminController.desvalidarUsuario);

module.exports = router;