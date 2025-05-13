var express = require('express');
var router = express.Router();
const path = require('path');

/* Rota para Escolher */
router.get('/escolher',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'escolher.html'));
});

/* Rota para Cadastro Músico */
router.get('/escolher/musico',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'musico.html'));
});

/* Rota para Painel do Desenvolvedor */
router.get('/paineldodesenvolvedor',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'painel.html'));
  });

module.exports = router;