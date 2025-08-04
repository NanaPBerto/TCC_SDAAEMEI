const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');
const multer = require('multer');

// Configuração do multer para armazenar arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Página inicial (redireciona para painel principal de atividades)
router.get('/', (req, res) => {
    res.redirect('/home'); // ou res.render('home');
});

router.get('/home', atividadeController.home);

// Rota correta para o formulário de nova atividade
router.get('/novaAtividade', atividadeController.novaAtividade);
router.post(
  '/novaAtividade',
  upload.fields([
    { name: 'imagem', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'musica', maxCount: 1 },
    { name: 'partitura', maxCount: 1 }
  ]),
  atividadeController.add
);

router.get('/minhasSubmissoes', atividadeController.minhasSubmissoes);
router.post('/add', upload.array('anexos'), atividadeController.add);
router.get('/deletar/:id', atividadeController.deletar);
router.get('/escolher', atividadeController.escolher);
router.get('/editar/:id', atividadeController.editar);
router.post('/editar/:id', upload.any(), atividadeController.atualizar);
router.get('/homeE', (req, res) => {
    res.render('homeE', { showMenu: true, visualizador: true, contribuidor: false, showSidebarE: true });
});

module.exports = router;
