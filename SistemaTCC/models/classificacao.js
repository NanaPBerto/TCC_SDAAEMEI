const db = require('../db');

const classificacao = db.sequelize.define('classificacao', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: db.Sequelize.STRING(20),
        allowNull: false
    }
}, {
    tableName: 'classificacao'
});

module.exports = classificacao; 