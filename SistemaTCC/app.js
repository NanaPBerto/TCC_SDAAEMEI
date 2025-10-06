require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session'); 
const flash = require('connect-flash');
const path = require('path');
const bodyParser = require('body-parser');
const indexRoutes = require('./routes/indexRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const atividadeRoutes = require('./routes/atividadeRoutes');
const tipoatividadeRoutes = require('./routes/tipoatividadeRoutes');
const educador = require('./models/educador');
const musico = require('./models/musico');
const ativ = require('./models/ativ');
const tipoatividade = require('./models/tipoatividade');
const uf = require('./models/uf');
const classificacao = require('./models/classificacao');
const adminRoutes = require('./routes/adminRoutes');

// Configuração das sessions
app.use(session({
  secret: '77NaNa@.77',
  resave: true,
  saveUninitialized: true,
  name: 'connect.sid',
  cookie: { maxAge: 600000 } // Sessão expira em 10 minutos
}));

// MIDDLEWARES (ordem importante)

app.use(flash());
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
        res.locals.isAdmin = tipoUsuario === 'adm'; 
    } else {
        res.locals.showMenu = true;
        res.locals.showSidebar = true;
        res.locals.showSidebarE = false;
        res.locals.contribuidor = false;
        res.locals.visualizador = false;
        res.locals.isAdmin = false; 
    }
    
    next();
});

// ⭐⭐ MIDDLEWARE DO BOTÃO VOLTAR ⭐⭐
app.use((req, res, next) => {
    // Rotas principais onde NÃO mostrar botão voltar
    const rotasPrincipais = ['/', '/index', '/login', '/escolher', '/cadastroM', '/cadastroE','/painelM'];
    
    // Não mostrar botão nas rotas principais
    const mostrarVoltar = !rotasPrincipais.includes(req.path);
    
    res.locals.showBackButton = mostrarVoltar;
    next();
});

app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session data:', req.session);
  next();
});

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
    },
        json: function(context) {
      return JSON.stringify(context);
    },
    formatDate: function(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('pt-BR');
    }
  },
  partialsDir: [
    path.join(__dirname, 'views', 'partials')
  ]
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Body parser para formulários
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Arquivos estáticos
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());

// Aumentar limite de payload do Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuração específica para Multer
app.use((req, res, next) => {
    // Aumentar timeout para uploads grandes
    req.setTimeout(300000); // 5 minutos
    res.setTimeout(300000);
    next();
});

// ROTAS - ORDEM CRÍTICA
app.use('/', atividadeRoutes);
app.use('/', indexRoutes);
app.use('/', usuarioRoutes);
app.use('/', tipoatividadeRoutes);
app.use('/admin', adminRoutes);

Promise.all([
    classificacao.sync(),
    tipoatividade.sync(),
    educador.sync(),
    musico.sync(),
    ativ.sync(), 
    uf.sync(),
]).then(async () => {
    // Registros padrão para tipoatividade
    await tipoatividade.bulkCreate([
        { id: 1, nome: 'Linguagem' },
        { id: 2, nome: 'Numeros' },
        { id: 3, nome: 'Formas' },
        { id: 4, nome: 'Fauna' },
        { id: 5, nome: 'Flora' },
        { id: 6, nome: 'Clima' },
        { id: 7, nome: 'Motricidade' },
        { id: 8, nome: 'Cidadania' },
        { id: 9, nome: 'Cultura' },
        { id: 10, nome: 'Altura' },
        { id: 11, nome: 'Intensidade' },
        { id: 12, nome: 'Duracao' },
        { id: 13, nome: 'Timbre' },
        { id: 14, nome: 'Ritmo' },
        { id: 15, nome: 'Melodia' },
        { id: 16, nome: 'Harmonia' }
    ], { ignoreDuplicates: true });

    // Registros padrão para classificacao
    await classificacao.bulkCreate([
        { id: 1, nome: 'bercarioI' },
        { id: 2, nome: 'bercarioII' },
        { id: 3, nome: 'bercarioIII' },
        { id: 4, nome: 'maternalI' },
        { id: 5, nome: 'maternalII' },
        { id: 6, nome: 'preI' },
        { id: 7, nome: 'preII' }
    ], { ignoreDuplicates: true });

    // Usuário ADM
await musico.findOrCreate({
    where: { login: 'Administrador' },
    defaults: {
        nome: 'ADM',
        tipo: 'adm', // ← Isso é crucial
        login: 'Administrador',
        senha: '12345678',
        cpf: '00000000000',
        email: 'admin@musicoteca.com',
        fone: '00000000000',
        cidade: 'AdminCity',
        uf: 'AD',
        validado: true // ← O admin já é validado por padrão
    }
}).then(([user, created]) => {
    if (created) {
        console.log('✅ Usuário ADMIN criado com sucesso!');
        console.log('📋 Dados do ADMIN:', JSON.stringify(user.get({ plain: true }), null, 2));
    } else {
        console.log('ℹ️ Usuário ADMIN já existe');
        console.log('📋 Dados do ADMIN:', JSON.stringify(user.get({ plain: true }), null, 2));
    }
});

    // Usuário teste musico
    await musico.findOrCreate({
        where: { login: 'teste' },
        defaults: {
            nome: 'Usuário Teste',
            tipo: 'musico',
            login: 'teste',
            senha: '12345678', // coloque uma senha segura ou hash
            cpf: '00000000000',
            email: 'teste@teste.com',
            fone: '00000000000',
            cidade: 'TesteCity',
            uf: 'TS',
            validado: true
        }
    });

    // Usuário teste educador
    await educador.findOrCreate({
        where: { login: 'teste2' },
        defaults: {
            tipo: 'educador',
            nome: 'Usuário Teste2',
            login: 'teste2',
            senha: '12345678', // coloque uma senha segura ou hash
            cidade: 'TesteCity',
            uf: 'TS'
        }
    });

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}`);
    });
}).catch(err => {
    console.error('Erro ao sincronizar os models:', err);
    if (err && err.message && err.message.includes('ECONNREFUSED')) {
        console.error('Não foi possível conectar ao banco de dados MySQL.');
        console.error('Verifique se o serviço do MySQL está rodando e se as configurações de conexão estão corretas.');
    }
});

// Adicione try/catch ao setupAssociations
try {
    const setupAssociations = require('./models/associations');
    setupAssociations();
} catch (err) {
    console.error('Erro ao configurar associações:', err);
}

module.exports = app;