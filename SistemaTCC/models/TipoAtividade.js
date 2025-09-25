const db = require('../db');

const Tipoatividade = db.sequelize.define('tipoatividade', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: db.Sequelize.STRING(50),
        allowNull: false
    },
    icone: {
        type: db.Sequelize.STRING(50), // Adicione este campo
        allowNull: true
    },
}, {
    tableName: 'tipoatividade'
});

module.exports = Tipoatividade; // Exporte apenas o modelo definido