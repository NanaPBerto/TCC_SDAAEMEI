const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');
const multer = require('multer');

// Configuração do multer para armazenar arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function requireMusico(req, res, next) {
  if (!req.session.usuario || req.session.usuario.tipo !== 'musico') {
    return res.status(403).send('Acesso restrito. Faça login como músico.');
  }
  next();
}

// Rotas para atividades
router.get('/submissoes', requireMusico, atividadeController.submissoes);
router.get('/novaAtividade', requireMusico, atividadeController.novaAtividade);
router.post(
  '/novaAtividade',
  requireMusico,
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

// Página de detalhes da atividade
router.get('/atividade/:id', atividadeController.detalheAtividade);

// Painel do músico
router.get('/painelM', requireMusico, (req, res) => {
  res.render('painelM');
});

module.exports = router;