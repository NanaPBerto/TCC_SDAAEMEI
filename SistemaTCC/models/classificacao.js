const db = require('../db');

const classificacao = db.sequelize.define('classificacao', {
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
}, {
    tableName: 'classificacoes' // <-- Corrige o nome da tabela
});

module.exports = classificacao;