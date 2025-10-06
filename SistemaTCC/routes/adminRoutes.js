// routes/adminRoutes.js - CORRIGIDO
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Middleware para verificar se é administrador
const checkAdmin = (req, res, next) => {
    if (req.session.usuario && req.session.usuario.tipo === 'adm') {
        next();
    } else {
        res.redirect('/login');
    }
};

router.get('/validar-usuarios', checkAdmin, adminController.validarUsuarios);
router.get('/listar-usuarios', checkAdmin, adminController.listarTodosUsuarios);
router.post('/validar-usuario/:id', checkAdmin, adminController.validarUsuario);
router.post('/desvalidar-usuario/:id', checkAdmin, adminController.desvalidarUsuario);

module.exports = router;