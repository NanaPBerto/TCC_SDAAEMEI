const db = require('../db');

const ativ = db.sequelize.define('atividades', {
        nome: {
            type: db.Sequelize.STRING(30),
            allowNull: false
        },
        descricao: {
            type: db.Sequelize.STRING(100),
            allowNull: false
        },
        objetivo: {
            type: db.Sequelize.STRING(70),
            allowNull: false
        }, 
        indicacao: {
            type: db.Sequelize.STRING(20),
            allowNull: false
        },
        vagas: {
            type: db.Sequelize.STRING(5),
            allowNull: false
        },
        duracao: {
            type: db.Sequelize.STRING(20),
            allowNull: false
        },
        recursos: {
            type: db.Sequelize.STRING(80),
            allowNull: false
        },
        condicoes: {
            type: db.Sequelize.STRING(80),
            allowNull: false
        },
        imagem: {
            type: db.Sequelize.STRING,
            allowNull: true
        }, 
        video: {
            type: db.Sequelize.STRING,
            allowNull: true
        },
        musica: {
            type: db.Sequelize.STRING,
            allowNull: true
        },
        partitura: {
            type: db.Sequelize.STRING,
            allowNull: true
        },
        obs: {
            type: db.Sequelize.STRING(100),
            allowNull: true
        },
        desenvolvedor: {
            type: db.Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'musicos', // nome da tabela de músicos
                key: 'id'
            }
        },
        classificacao: {
            type: db.Sequelize.INTEGER,
            defaultValue: 1,
            allowNull: false,
            references: {
                model: 'classificacao',
                key: 'id'
            }
        },
        tipoId: {
            type: db.Sequelize.INTEGER,
            defaultValue: 1,
            allowNull: false,
            references: {
                model: 'tipoatividade',
                key: 'id'
            }
        },
    }, { tableName: 'atividades' });

module.exports = ativ; // Exporte apenas o modelo definido
