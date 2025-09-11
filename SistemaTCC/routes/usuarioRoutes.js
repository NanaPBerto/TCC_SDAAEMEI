// usuarioRoutes.js
const express = require('express');
const router = express.Router();
const Musico = require('../models/musico');
const Educador = require('../models/educador')

// Rotas de autenticação
router.get('/login', (req, res) => {
  res.locals.showBackButton = true;
  res.render('login');
});

router.post('/login', async (req, res) => {
    const { login, senha } = req.body;

    if (!login || !senha) {
        return res.status(400).json({ alert: 'Login e senha são obrigatórios' });
    }

    try {
        let usuarioObj = await Musico.findOne({ where: { login } });
        let tipoUsuario = 'musico';
        
        if (!usuarioObj) {
            usuarioObj = await Educador.findOne({ where: { login } });
            tipoUsuario = 'educador';
        }

        if (!usuarioObj) {
            return res.status(401).json({ error: 'Usuário não encontrado' });
        }

        if (senha !== usuarioObj.senha) {
            return res.status(401).json({   alert: 'Senha incorreta' });
        }

        const usuarioSemSenha = usuarioObj.get({ plain: true });
        delete usuarioSemSenha.senha;
        usuarioSemSenha.tipo = tipoUsuario;

        // ARMAZENA NA SESSÃO
        req.session.usuario = usuarioSemSenha;
        req.session.save(() => {
            const paginaHome = tipoUsuario === 'musico' ? 'painelM' : 'homeE';
            res.redirect('/' + paginaHome);
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
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
      return res.redirect('/homeE');
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

module.exports = router;
