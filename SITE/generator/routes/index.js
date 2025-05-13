var express = require('express');
var router = express.Router();
const path = require('path');

/* Rota para Index */
router.get('/',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/* Rota para Login */
router.get('/login',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

/* Rota para Configurações */
router.get('/configuracoes',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'config.html'));
});

/* Rota para Escolher */
router.get('/escolher',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'escolher.html'));
});

module.exports = router;
