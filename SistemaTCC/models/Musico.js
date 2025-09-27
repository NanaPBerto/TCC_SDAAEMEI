const db = require('../db');

const Musico = db.sequelize.define('musicos', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tipo: { 
        type: db.Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'musico'
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
        type: db.Sequelize.STRING(100), // aumente para hash futuro
        allowNull: false
    },
    cpf: {
        type: db.Sequelize.STRING(14),
        allowNull: false
    },
    email: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },
    fone: {
        type: db.Sequelize.STRING(20),
        allowNull: true
    },
    imagem: {
        type: db.Sequelize.BLOB('long'), // Foto de perfil
        allowNull: true
    },
    minicurriculo: {
        type: db.Sequelize.BLOB('long'), // Arquivo de minicurrículo
        allowNull: true
    },
    cidade: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },
    obs: {
        type: db.Sequelize.STRING(100),
        allowNull: true
    },
    uf: {
        type: db.Sequelize.STRING(2),
        allowNull: false
    }
}, {
    tableName: 'musicos'
});

module.exports = Musico;