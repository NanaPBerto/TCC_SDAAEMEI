const db = require('../db');

const Musico = db.sequelize.define('musicos', {
    cod: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tipo: {
            type: db.Sequelize.STRING(20),
            allowNull: true,
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
        type: db.Sequelize.STRING(10),
        allowNull: false
    },
   cpf: {
        type: db.Sequelize.STRING(14),
        allowNull: false,
        defaultValue: '00000000000'
},
    email: {
        type: db.Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'aaaa@aaaa'
    },
    fone: {
        type: db.Sequelize.STRING(20),
        allowNull: true,
        defaultValue: '00000000000'
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
        allowNull: true
    },
});

module.exports = Musico; //exportando o modelo Musico para ser usado em outros arquivos