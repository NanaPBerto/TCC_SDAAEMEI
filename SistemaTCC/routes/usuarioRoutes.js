const express = require('express');
const router = express.Router();
const multer = require('multer');

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

module.exports = router;