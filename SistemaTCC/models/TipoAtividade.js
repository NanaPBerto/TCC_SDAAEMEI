const { create } = require('express-handlebars');
const db = require('../db');

const TipoAtividade = db.sequelize.define('tipo_atividades', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },
    createdAt: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: db.Sequelize.NOW
    },
    updatedAt: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        defaultValue: db.Sequelize.NOW
    }
});

module.exports = TipoAtividade;
