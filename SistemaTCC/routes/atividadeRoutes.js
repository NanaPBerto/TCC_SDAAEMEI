const express = require('express');
const router = express.Router();
const atividadeController = require('../controllers/atividadeController');
const { atividadeUpload } = require('../middleware/uploadFile'); // Usar a configuração específica

function requireMusico(req, res, next) {
  if (!req.session.usuario || req.session.usuario.tipo !== 'musico') {
    return res.status(403).send('sua sessão expirou ou você não tem permissão para acessar esta página.');
    
  }
  next(); 
}

// Middleware para tratamento de erros do Multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).render('error', { 
                message: 'Arquivo muito grande. Tamanho máximo permitido: 20MB.' 
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).render('error', { 
                message: 'Muitos arquivos enviados.' 
            });
        }
    }
    next(err);
};

// Rotas para atividades
router.get('/submissoes', requireMusico, atividadeController.submissoes);
router.get('/novaAtividade', requireMusico, atividadeController.novaAtividade);

router.post(
  '/novaAtividade',
  requireMusico,
  atividadeUpload.fields([
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

router.post('/editar/:id', 
  atividadeUpload.any(),
  handleMulterError,
  atividadeController.atualizar
);

// Página de escolha
router.get('/escolher', atividadeController.escolher);

// Página de detalhes da atividade
router.get('/atividade/:id', atividadeController.detalheAtividade);

// Painel do músico
router.get('/painelM', requireMusico, (req, res) => {
  res.render('painelM');
});

module.exports = router;