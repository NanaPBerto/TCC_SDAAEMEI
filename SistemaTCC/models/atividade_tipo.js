const db = require('../db');

const AtividadeTipo = db.sequelize.define('atividade_tipo', {
    id: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    atividadeId: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'atividades',
            key: 'id'
        }
    },
    tipoId: {
        type: db.Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'tipoatividade',
            key: 'id'
        }
    }
}, {
    tableName: 'atividade_tipo',
    indexes: [
        {
            unique: true,
            fields: ['atividadeId', 'tipoId']
        }
    ]
});

module.exports = AtividadeTipo;