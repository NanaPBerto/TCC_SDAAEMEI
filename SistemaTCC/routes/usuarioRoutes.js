const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const multer = require('multer');

// Corrija a importação dos models:
const Musico = require('../models/musico');
const Educador = require('../models/educador');

// Configuração do multer para armazenar arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Página inicial (redireciona para painel principal de atividades)
router.get('/', (req, res) => {
    res.redirect('/escolher');
});

router.get('/cadastroM', (req, res) => {
    res.render('cadastroM', { showMenu: true, visualizador: false, contribuidor: true, showSidebarE: false, showBackButton: true });
});
router.get('/cadastroE', (req, res) => {
    res.render('cadastroE', { showMenu: true, visualizador: true, contribuidor: false, showSidebarE: false, showBackButton: true });
});

router.get('/login', (req, res) => {
    res.render('login', { showMenu: true, showSidebar: false, showBackButton: true });
});

router.post('/login', async (req, res) => {
    const { login, senha } = req.body; // Troque 'usuario' por 'login'

    if (!login || !senha) {
        return res.status(400).json({ error: 'Login e senha são obrigatórios' });
    }

    try {
        // Primeiro tenta encontrar como músico
        let usuarioObj = await Musico.findOne({ where: { login } });
        
        // Se não encontrou, tenta como educador
        if (!usuarioObj) {
            usuarioObj = await Educador.findOne({ where: { login } });
        }

        // Verifica se o usuário existe
        if (!usuarioObj) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        // Comparação de senha (substitua por bcrypt em produção)
        if (senha !== usuarioObj.senha) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        // Remove a senha do objeto do usuário antes de retornar
        const usuarioSemSenha = usuarioObj.get({ plain: true });
        delete usuarioSemSenha.senha;

        // Determina para qual página redirecionar
        const tipoUsuario = usuarioObj.tipo || (usuarioObj instanceof Musico ? 'musico' : 'educador');
        const paginaHome = tipoUsuario === 'musico' ? 'painelM' : 'homeE';

        // Login bem-sucedido
        res.render(paginaHome, { 
            usuario: usuarioSemSenha, 
            showMenu: true, 
            showSidebar: true,
            visualizador: tipoUsuario === 'educador', 
            contribuidor: tipoUsuario === 'musico', 
            showSidebarE: tipoUsuario === 'educador',
            showBackButton: true
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

router.post('/add', upload.array('anexos'), usuarioController.add);
router.get('/deletar/:id', usuarioController.deletar);

module.exports = router;
