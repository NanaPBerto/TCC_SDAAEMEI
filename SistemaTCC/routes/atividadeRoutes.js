const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');
const multer = require('multer');

// Configuração do multer para armazenar arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rotas para atividades
router.get('/Msub', atividadeController.Msub);
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

// Rotas de CRUD para atividades
router.get('/deletar/:id', atividadeController.deletar);
router.get('/editar/:id', atividadeController.editar);
router.post('/editar/:id', upload.any(), atividadeController.atualizar);

// Página de escolha
router.get('/escolher', atividadeController.escolher);

// Painel do músico
router.get('/painelM', (req, res) => {
  res.render('painelM');
});


module.exports = router;