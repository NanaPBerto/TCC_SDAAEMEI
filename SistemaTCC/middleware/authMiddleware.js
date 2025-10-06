// middleware/authMiddleware.js
const Musico = require('../models/musico');

// Middleware para verificar se músico está validado
const checkMusicoValidado = (req, res, next) => {
    if (req.session.usuario && req.session.usuario.tipo === 'musico') {
        // Se for músico, verifica se está validado
        if (!req.session.usuario.validado) {
            req.session.destroy(() => {
                res.redirect('/login?alert=Conta não validada. Aguarde a aprovação do administrador.');
            });
            return;
        }
    }
    next();
};

// Middleware para verificar se está logado
const checkAuth = (req, res, next) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    next();
};

// Middleware para verificar se é administrador
const checkAdmin = (req, res, next) => {
    if (req.session.usuario && req.session.usuario.tipo === 'adm') {
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = {
    checkMusicoValidado,
    checkAuth,
    checkAdmin
};