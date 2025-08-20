const express = require('express');
const app = express();
const session = require('express-session'); 
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const homeRoutes = require('./routes/homeRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');
const tipoatividadeRoutes = require('./routes/tipoatividadeRoutes');
const educador = require('./models/educador');
const musico = require('./models/musico');
const ativ = require('./models/ativ');
const tipoatividade = require('./models/tipoatividade');
const uf = require('./models/uf');
const classificacao = require('./models/classificacao');

// Configuração do template engine handlebars

const handlebars = require('express-handlebars');

const hbs = handlebars.create({
  helpers: {
    eq: (v1, v2) => v1 === v2,
    getIcon: function(nome) {
      const icons = {
        'Linguagem': 'fas fa-book-open',
        'Números': 'fas fa-calculator',
        'Formas e Espaço': 'fas fa-shapes',
        'Fauna': 'fas fa-dove',
        'Flora': 'fas fa-leaf',
        'Tempo e Clima': 'fas fa-cloud-sun',
        'Desenvolvimento Motor': 'fas fa-running',
        'Cidadania e Meio-Ambiente': 'fas fa-recycle',
        'Cultura e Folclore': 'fas fa-globe-americas'
      };
      return icons[nome] || 'fas fa-music';
    }
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


app.use((req, res, next) => {
    res.locals.usuario = req.session ? (req.session.usuario || null) : null;
    
    // Define variáveis de layout baseadas no usuário logado
    if (res.locals.usuario) {
        const tipoUsuario = res.locals.usuario.tipo;
        res.locals.showMenu = true;
        res.locals.showSidebar = tipoUsuario === 'musico';
        res.locals.showSidebarE = tipoUsuario === 'educador';
        res.locals.contribuidor = tipoUsuario === 'musico';
        res.locals.visualizador = tipoUsuario === 'educador';
    } else {
        res.locals.showMenu = true;
        res.locals.showSidebar = true;
        res.locals.showSidebarE = false;
        res.locals.contribuidor = false;
        res.locals.visualizador = false;
    }
    
    res.locals.showBackButton = typeof res.locals.showBackButton !== 'undefined' ? res.locals.showBackButton : false;
    
    next();
});

// MIDDLEWARES (ordem importante)
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));
app.use(session({
    secret: '77NaNa@.77',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));


// ROTAS - ORDEM CRÍTICA
app.use('/', homeRoutes);
app.use('/', usuarioRoutes);
app.use('/', atividadeRoutes);
app.use('/', tipoatividadeRoutes);


// Sincronize os models com o banco de dados
Promise.all([
    classificacao.sync(),
    tipoatividade.sync(),
    educador.sync(),
    musico.sync(),
    ativ.sync(), // Defina como true se quiser recriar a tabela a cada reinício
    uf.sync(),
    

]).then(() => {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error('Erro ao sincronizar os models:', err.message);
    if (err.message.includes('ECONNREFUSED')) {
        console.error('Não foi possível conectar ao banco de dados MySQL.');
        console.error('Verifique se o serviço do MySQL está rodando e se as configurações de conexão estão corretas.');
    }
});
const setupAssociations = require('./models/associations');
const { FORCE } = require('sequelize/lib/index-hints');
setupAssociations();

module.exports = app; 