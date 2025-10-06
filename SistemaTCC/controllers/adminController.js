const Musico = require('../models/musico');
const Educador = require('../models/educador');
const EmailService = require('../services/emailService'); // ⭐⭐ IMPORTE O SERVIÇO DE EMAIL

exports.validarUsuario = async (req, res) => {
    try {
        if (!req.session.usuario || req.session.usuario.tipo !== 'adm') {
            return res.status(403).json({ success: false, message: 'Acesso negado' });
        }

        const { id } = req.params;
        
        // Buscar o usuário antes de atualizar para enviar o email
        const usuario = await Musico.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        
        // Atualizar para validado
        await Musico.update({ validado: true }, { where: { id } });
        
        // ⭐⭐ ENVIAR EMAIL DE NOTIFICAÇÃO ⭐⭐
        try {
            await EmailService.enviarNotificacaoValidacao(usuario.get({ plain: true }));
        } catch (emailError) {
            console.error('❌ Erro ao enviar email, mas usuário foi validado:', emailError);
            // Não impedir a validação se o email falhar
        }
        
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
        
        // Buscar o usuário antes de atualizar para enviar o email
        const usuario = await Musico.findByPk(id);
        if (!usuario) {
            return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
        }
        
        // Atualizar para não validado
        await Musico.update({ validado: false }, { where: { id } });
        
        // ⭐⭐ ENVIAR EMAIL DE NOTIFICAÇÃO ⭐⭐
        try {
            await EmailService.enviarNotificacaoDesvalidacao(usuario.get({ plain: true }));
        } catch (emailError) {
            console.error('❌ Erro ao enviar email, mas usuário foi desvalidado:', emailError);
            // Não impedir a desvalidação se o email falhar
        }
        
        res.json({ success: true, message: 'Usuário desvalidado com sucesso' });
    } catch (erro) {
        console.error('Erro ao desvalidar usuário:', erro);
        res.status(500).json({ success: false, message: 'Erro ao desvalidar usuário' });
    }
};

exports.listarUsuarios = async (req, res) => {
    try {
        const filtro = req.query.filtro || 'todos';
        let musicos = [];
        let educadores = [];

        if (filtro === 'validados') {
            musicos = await Musico.findAll({ where: { validado: true } });
        } else if (filtro === 'nao-validados') {
            musicos = await Musico.findAll({ where: { validado: false } });
        } else {
            musicos = await Musico.findAll();
        }
        educadores = await Educador.findAll();

        let usuarios = [
            ...musicos.map(m => {
                const usuario = m.get({ plain: true });
                usuario.tipo = 'musico';
                return usuario;
            }),
            ...educadores.map(e => {
                const usuario = e.get({ plain: true });
                usuario.tipo = 'educador';
                usuario.validado = null; // Educador não tem validação
                return usuario;
            })
        ];

        res.render('admin/listarUsuarios', {
            usuarios,
            filtroAtual: filtro
        });
    } catch (erro) {
        console.error('Erro ao listar usuários:', erro);
        res.status(500).send('Erro ao listar usuários');
    }
};