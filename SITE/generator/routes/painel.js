var express = require('express');
var router = express.Router();
const path = require('path');

/* Rota para Index */
router.get('/',(req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

/* Rota para Painel do Desenvolvedor */
router.get('/paineldodesenvolvedor',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'painel.html'));
  });

/*fazer o produzir ativ,minhas submissoes,repertorioeestatisticas*/ 


module.exports = router;