const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const multer = require('multer');
const { Musico, Educador } = require('../models/Musico', '../models/Educador');

// Configuração do multer para armazenar arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Página inicial (redireciona para painel principal de atividades)
router.get('/', (req, res) => {
    res.redirect('/escolher');
});

router.get('/cadastroM', (req, res) => {
    res.render('cadastroM', { showMenu: true, visualizador: false, contribuidor: true, showSidebarE: false });
});
router.get('/cadastroE', (req, res) => {
    res.render('cadastroE', { showMenu: true, visualizador: true, contribuidor: false, showSidebarE: false });
});

router.get('/login', (req, res) => {
    res.render('login', { showMenu: true, showSidebar: true });
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    try {
        // Primeiro tenta encontrar como músico
        let usuario = await Musico.findOne({ where: { email } });
        
        // Se não encontrou, tenta como educador
        if (!usuario) {
            usuario = await Educador.findOne({ where: { email } });
        }

        // Verifica se o usuário existe
        if (!usuario) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        // Comparação de senha (substitua por bcrypt em produção)
        if (senha !== usuario.senha) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        // Remove a senha do objeto do usuário antes de retornar
        const usuarioSemSenha = usuario.get({ plain: true });
        delete usuarioSemSenha.senha;

        // Determina para qual página redirecionar
        const tipoUsuario = usuario.tipo || (usuario instanceof Musico ? 'musico' : 'educador');
        const paginaHome = tipoUsuario === 'musico' ? 'homeM' : 'homeE';

        // Login bem-sucedido
        res.render(paginaHome, { 
            usuario: usuarioSemSenha, 
            showMenu: true, 
            visualizador: tipoUsuario === 'educador', 
            contribuidor: tipoUsuario === 'musico', 
            showSidebarE: tipoUsuario === 'educador'
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

router.post('/add', upload.array('anexos'), usuarioController.add);
router.get('/deletar/:id', usuarioController.deletar);

module.exports = router;