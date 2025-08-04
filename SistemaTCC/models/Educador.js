const db = require('../db');

const Educador = db.sequelize.define('educadores', {
    cod: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    tipo: {
        type: db.Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'educador'
    },
    nome: {
        type: db.Sequelize.STRING(50),
        allowNull: false,
    },
    login: {
        type: db.Sequelize.STRING(20),
        allowNull: false
    },
    senha: {
        type: db.Sequelize.STRING(10),
        allowNull: false
    },
    cidade: {
        type: db.Sequelize.STRING(50),
        allowNull: true
    },
    uf: {
        type: db.Sequelize.STRING(2),
        allowNull: true
    }
});

module.exports = Educador;