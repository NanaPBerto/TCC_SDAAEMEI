var express = require('express');
var router = express.Router();
const path = require('path');

/* Rota para Index */
router.get('/',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/* Rota para Escolher */
router.get('/escolher',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'escolher.html'));
});

/* Rota para Cadastro Educador */
router.get('/escolher/educador',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'loginEducador.html'));
});

/* Rota para Cadastro Músico */
router.get('/escolher/musico',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'loginMusico.html'));
});

module.exports = router;