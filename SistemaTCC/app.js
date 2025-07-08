const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const atividadeRoutes = require('./routes/atividadeRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

// Configuração do template engine handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Body parser para formulários
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Arquivos estáticos
app.use(express.static(__dirname));

// Middleware para variáveis globais das views
app.use((req, res, next) => {
    res.locals.showMenu = typeof res.locals.showMenu !== 'undefined' ? res.locals.showMenu : false;
    res.locals.showSidebar = typeof res.locals.showSidebar !== 'undefined' ? res.locals.showSidebar : false;
    res.locals.showBackButton = typeof res.locals.showBackButton !== 'undefined' ? res.locals.showBackButton : false;
    next();
});

// Rota para a raiz
app.get('/', (req, res) => {
    res.redirect('/home'); // ou renderize uma view, ex: res.render('home');
});

// Use apenas o arquivo de rotas
app.use('/', usuarioRoutes);
app.use('/', atividadeRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;