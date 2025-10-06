// controllers/adminController.js
const Musico = require('../models/musico');
const Educador = require('../models/educador');

exports.validarUsuarios = async (req, res) => {
    try {
        if (!req.session.usuario || req.session.usuario.tipo !== 'adm') {
            return res.redirect('/login');
        }

        // Buscar todos os músicos não validados
        const musicosPendentes = await Musico.findAll({
            where: { validado: false }
        });

        // Buscar todos os músicos validados
        const musicosValidados = await Musico.findAll({
            where: { validado: true }
        });

        res.render('admin/validarUsuarios', {
            musicosPendentes,
            musicosValidados,
            usuario: req.session.usuario
        });
    } catch (erro) {
        console.error('Erro ao carregar página de validação:', erro);
        res.status(500).send('Erro interno do servidor');
    }
};

exports.validarUsuario = async (req, res) => {
    try {
        if (!req.session.usuario || req.session.usuario.tipo !== 'adm') {
            return res.status(403).json({ success: false, message: 'Acesso negado' });
        }

        const { id } = req.params;
        
        await Musico.update({ validado: true }, { where: { id } });
        
        res.json({ success: true, message: 'Usuário validado com sucesso' });
    } catch (erro) {
        console.error('Erro ao validar usuário:', erro);
        res.status(500).json({ success: false, message: 'Erro ao validar usuário' });
    }
};

exports.desvalidarUsuario = async (req, res) => {
    try {
        if (!req.session.usuario || req.session.usuario.tipo !== 'adm') {
            return res.status(403).json({ success: false, message: 'Acesso negado' });
        }

        const { id } = req.params;
        
        await Musico.update({ validado: false }, { where: { id } });
        
        res.json({ success: true, message: 'Usuário desvalidado com sucesso' });
    } catch (erro) {
        console.error('Erro ao desvalidar usuário:', erro);
        res.status(500).json({ success: false, message: 'Erro ao desvalidar usuário' });
    }
};

exports.listarTodosUsuarios = async (req, res) => {
    try {
        if (!req.session.usuario || req.session.usuario.tipo !== 'adm') {
            return res.redirect('/login');
        }

        const musicos = await Musico.findAll();
        const educadores = await Educador.findAll();

        const usuarios = [
            ...musicos.map(m => {
                const usuario = m.get({ plain: true });
                usuario.tipo = 'musico';
                return usuario;
            }),
            ...educadores.map(e => {
                const usuario = e.get({ plain: true });
                usuario.tipo = 'educador';
                return usuario;
            })
        ];

        res.render('admin/listarUsuarios', {
            usuarios,
            usuario: req.session.usuario
        });
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);
        res.status(500).send('Erro interno do servidor');
    }
};