const express = require('express');
const router = express.Router();
const Musico = require('../models/musico');
const Educador = require('../models/educador');
const { usuarioUpload } = require('../middleware/uploadFile'); 
const usuarioController = require('../controllers/usuarioController');
const { checkMusicoValidado, checkAuth } = require('../middleware/authMiddleware'); 
// Middleware para tratamento de erros do Multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            if (req.originalUrl.includes('cadastro')) {
                return res.render(req.session.usuario ? 'perfil' : 'cadastroM', { 
                    error: 'Arquivo muito grande! Tamanho máximo permitido: 15MB por arquivo.',
                    usuario: req.session.usuario || {},
                    formData: req.body 
                }); 
            }
        }
    }
    next(err);
};

// Middleware para remover máscaras apenas para músicos
const removerMascarasParaMusicos = (req, res, next) => {
    // Aplica a remoção de máscaras apenas se for cadastro de músico
    // Verifica se req.body existe e se tem tipo, com fallback seguro
    if (req.body && req.body.tipo === 'musico') {
        if (req.body.telefone) {
            req.body.telefone = req.body.telefone.replace(/\D/g, '');
        }
        
        if (req.body.cpf) {
            req.body.cpf = req.body.cpf.replace(/\D/g, '');
        }
    }
    next();
};

// Usar o middleware unificado com tratamento de erro
router.post(
  '/usuario/add',
  removerMascarasParaMusicos, // Aplica apenas para músicos
  (req, res, next) => {
      usuarioUpload.fields([
          { name: 'imagem', maxCount: 1 },
          { name: 'minicurriculo', maxCount: 1 }
      ])(req, res, (err) => {
          if (err) {
              console.error('Erro no upload:', err);
              const tipo = req.body.tipo || 'musico';
              const template = tipo === 'musico' ? 'cadastroM' : 'cadastroE';
              
              if (err.code === 'LIMIT_FILE_SIZE') {
                  return res.render(template, { 
                      error: 'Arquivo muito grande! Tamanho máximo permitido: 15MB por arquivo.',
                      formData: req.body 
                  });
              }
              return res.render(template, { 
                  error: 'Erro no upload: ' + err.message,
                  formData: req.body 
              });
          }
          next();
      });
  },
  require('../controllers/usuarioController').add
);

// Rotas de autenticação
// Rota de login (GET) - ATUALIZADA
router.get('/login', (req, res) => {
  const alertMessage = req.session.alertMessage;
  const alert = req.session.alert;
  
  // Limpa as mensagens da sessão após pegar
  delete req.session.alertMessage;
  delete req.session.alert;
  
  res.render('login', { 
    alertMessage: alertMessage,
    alert: alert
  });
});
// Rota de login (POST) - ATUALIZADA
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

        // ⭐⭐ VALIDAÇÃO PARA MÚSICOS NÃO VALIDADOS ⭐⭐
        if (tipoUsuario === 'musico' && usuarioObj.validado === false) {
            return res.render('login', { 
                alert: 'Sua conta está aguardando validação. Entre em contato com o administrador.' 
            });
        }

        const usuarioSemSenha = usuarioObj.get({ plain: true });
        delete usuarioSemSenha.senha;

        // Definir tipo corretamente
        if (usuarioObj.tipo === 'adm') {
            tipoUsuario = 'adm';
        }
        
        usuarioSemSenha.id = usuarioObj.id;
        usuarioSemSenha.tipo = tipoUsuario;

        console.log('🔐 Usuário logado:', usuarioSemSenha);

        req.session.usuario = usuarioSemSenha;
        req.session.save(() => {
            let redirectUrl = '/index';
            if (tipoUsuario === 'musico') redirectUrl = '/painelM';
            if (tipoUsuario === 'adm') redirectUrl = '/painelM';
            
            console.log('🔄 Redirecionando para:', redirectUrl);
            res.redirect(redirectUrl);
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


// Perfil - qualquer usuário logado pode acessar, mas músico precisa estar validado
router.get('/perfil', checkAuth, (req, res) => {
    // Se for músico, aplica a validação
    if (req.session.usuario.tipo === 'musico') {
        return checkMusicoValidado(req, res, () => {
            res.render('perfil', { 
                usuario: req.session.usuario, 
                isOwnProfile: true,
                session: req.session
            });
        });
    }
    
    res.render('perfil', { 
        usuario: req.session.usuario, 
        isOwnProfile: true,
        session: req.session
    });
});

//acessar outros perfis
router.get('/perfil/musico/:id', usuarioController.verPerfilMusico);
router.get('/perfil/educador/:id', usuarioController.verPerfilEducador);
router.get('/perfis', usuarioController.listarPerfis);
// Atualizar perfil - versão com remoção condicional de máscaras
router.post('/perfil', 
  (req, res, next) => {
    // Aplica remoção de máscaras apenas se for músico
    if (req.session.usuario.tipo === 'musico') {
        if (req.body.telefone) {
            req.body.telefone = req.body.telefone.replace(/\D/g, '');
        }
        
        if (req.body.cpf) {
            req.body.cpf = req.body.cpf.replace(/\D/g, '');
        }
    }
    next();
  },
  usuarioUpload.fields([
      { name: 'imagem', maxCount: 1 },
      { name: 'minicurriculo', maxCount: 1 }
  ]),
  handleMulterError,
  require('../controllers/usuarioController').editarPerfil
);

router.get('/sugeridasA', (req, res) => {
  res.locals.showBackButton = true;
  res.render('sugeridasA');
});

router.get('/historicoA', (req, res) => {
  res.locals.showBackButton = true;
  res.render('historicoA');
});


module.exports = router;