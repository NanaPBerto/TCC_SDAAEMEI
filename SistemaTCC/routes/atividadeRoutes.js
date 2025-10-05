const express = require('express');
const router = express.Router();
const app = express();
const atividadeController = require('../controllers/atividadeController');
const sugeridasController = require('../controllers/sugeridasController');
const { atividadeUpload } = require('../middleware/uploadFile'); // Usar a configuração específica

function requireMusico(req, res, next) {
  if (!req.session.usuario) {
    req.session.alertMessage = 'Sua sessão expirou. Faça login novamente.';
    return res.redirect('/login');
  }
  
  if (req.session.usuario.tipo !== 'musico') {
    req.session.alertMessage = 'Você não tem permissão para acessar esta página.';
    return res.redirect('/login');
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
router.get('/api/atividades/sugestoes', atividadeController.sugestoesAtividades);
router.get('/submissoes', requireMusico, atividadeController.submissoes);
router.get('/novaAtividade', requireMusico, atividadeController.novaAtividade);
router.get('/sugeridas', sugeridasController.getSugeridas);



// Adicione esta rota para teste rápido
router.get('/teste-sugeridas', async (req, res) => {
    try {
        const Atividade = require('../models/ativ');
        const atividades = await Atividade.findAll({
            attributes: ['id', 'nome', 'objetivo', 'imagem'],
            limit: 10
        });
        
        res.json({
            message: 'Teste de atividades',
            count: atividades.length,
            atividades: atividades.map(a => a.get({ plain: true }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



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
router.get('/editar/:id', requireMusico, atividadeController.carregarEdicao); // GET - carregar formulário

router.post('/editar/:id', 
  requireMusico,
  atividadeUpload.any(),
  handleMulterError,
  atividadeController.processarEdicao // POST - processar atualização
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