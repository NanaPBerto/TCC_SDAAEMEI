const db = require('./db');

const Musico = db.sequelize.define('musicos', {
    cod: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: db.Sequelize.STRING(30),
        allowNull: false
    },
    login: {
        type: db.Sequelize.STRING(20),
        allowNull: false
    },
    senha: {
        type: db.Sequelize.STRING(10),
        allowNull: false
    },
    cpf: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    email: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },
    fone: {
        type: db.Sequelize.INTEGER,
        allowNull: false
    },
    imagem: {
        type: db.Sequelize.BLOB,
        allowNull: true
    },
    cidade: {
        type: db.Sequelize.STRING(50),
        allowNull: true
    },
    minicurriculo: {
        type: db.Sequelize.BLOB,
        allowNull: true
    },
    obs: {
        type: db.Sequelize.STRING(100),
        allowNull: true
    },
    uf: {
        type: db.Sequelize.STRING(2),
        allowNull: false
    },
});

//Musico.sync({ force: true }) //force: true para recriar a tabela, false para não recriar
module.exports = Musico; //exportando o modelo Musico para ser usado em outros arquivos