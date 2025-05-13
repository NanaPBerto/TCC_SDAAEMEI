var express = require('express');
var router = express.Router();
const path = require('path');

/* Rota para Escolher */
router.get('/escolher',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'escolher.html'));
});

/* Rota para Cadastro Educador */
router.get('/escolher/educador',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'educador.html'));
});

/* Rota para Index */
router.get('/',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  });
  

module.exports = router;