const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');

const atividadeRoutes = require('./routes/atividadeRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const Educador = require('./models/Educador');
const Musico = require('./models/Musico');
const Ativ = require('./models/Ativ');
const TipoAtividade = require('./models/TipoAtividade');
const Uf = require('./models/uf');
const Classificacao = require('./models/class');

// Configuração do template engine handlebars

const handlebars = require('express-handlebars');

const hbs = handlebars.create({
  helpers: {
    // Helper para comparação de igualdade
    eq: (v1, v2) => v1 === v2,
  }
});

app.engine('handlebars', hbs.engine);
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

// Sincronize os models com o banco de dados
Promise.all([
    Educador.sync(),
    Musico.sync(),
    TipoAtividade.sync(),
    Ativ.sync({force: true}), 
    Uf.sync(),
    Classificacao.sync()

]).then(() => {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error('Erro ao sincronizar os models:', err);
});