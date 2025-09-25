// usuarioRoutes.js
const express = require('express');
const router = express.Router();
const Musico = require('../models/musico');
const Educador = require('../models/educador')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/usuario/add',
  upload.fields([
    { name: 'imagem', maxCount: 1 },
    { name: 'minicurriculo', maxCount: 1 }
  ]),
  require('../controllers/usuarioController').add
);

// Rotas de autenticação
router.get('/login', (req, res) => {
  res.locals.showBackButton = true;
  res.render('login');
});

router.post('/login', async (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.render('login', { alert: 'Login e senha são obrigatórios' });
    }

    try {
        let usuarioObj = await Musico.findOne({ where: { login } });
        let tipoUsuario = 'musico';
        
        if (!usuarioObj) {
            usuarioObj = await Educador.findOne({ where: { login } });
            tipoUsuario = 'educador';
        }

        if (!usuarioObj) {
            return res.render('login', { alert: 'Usuário não encontrado' });
        }

        if (senha !== usuarioObj.senha) {
            return res.render('login', { alert: 'Senha incorreta' });
        }

        const usuarioSemSenha = usuarioObj.get({ plain: true });
        delete usuarioSemSenha.senha;

        usuarioSemSenha.id = usuarioObj.id;
        usuarioSemSenha.tipo = tipoUsuario;

        req.session.usuario = usuarioSemSenha;
        req.session.save(() => {
            const paginaHome = tipoUsuario === 'musico' ? 'painelM' : 'index';
            res.redirect('/' + paginaHome);
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.render('login', { alert: 'Erro interno no servidor' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).send('Erro ao fazer logout');
        }
        res.redirect('/escolher');
    });
});

// Rota para logout
router.get('/logout', (req, res) => {
  // Guarda o sessionID para log
  const sessionId = req.sessionID;
  
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao destruir a sessão:', err);
      return res.redirect('/index');
    }

    // Limpa o cookie no cliente
    res.clearCookie('connect.sid');
    
    console.log(`Sessão ${sessionId} destruída e cookie removido.`);
    res.redirect('/escolher');
  });
});

// Rotas de cadastro
router.get('/cadastroM', (req, res) => {
  res.locals.showBackButton = true;
  res.render('cadastroM');
});

router.get('/cadastroE', (req, res) => {
  res.locals.showBackButton = true;
  res.render('cadastroE');
});

// Perfil do usuário logado
router.get('/perfil', (req, res) => {
  if (!req.session.usuario) {
    return res.redirect('/login');
  }
  res.render('perfil', { usuario: req.session.usuario });
});

// Atualizar perfil (exemplo simples)
router.post('/perfil', upload.fields([
  { name: 'imagem', maxCount: 1 },
  { name: 'minicurriculo', maxCount: 1 }
]), require('../controllers/usuarioController').editarPerfil);

module.exports = router;
