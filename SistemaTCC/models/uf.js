const { create } = require('express-handlebars');
const db = require('../db');

const Uf = db.sequelize.define('uf', {
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
        type: db.Sequelize.DATE,
        allowNull: false,
        defaultValue: db.Sequelize.NOW
    },
    updatedAt: {
        type: db.Sequelize.DATE,
        allowNull: false,
        defaultValue: db.Sequelize.NOW
    }
});

module.exports = Uf;