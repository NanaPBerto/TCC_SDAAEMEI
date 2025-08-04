const db = require('../db');
const TipoAtividade = require('./TipoAtividade'); // Importa o modelo de tipos
const Classificacao = require('./class'); // Importa o modelo de classificações

const Ativ = db.sequelize.define('atividades', {
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
            type: db.Sequelize.BLOB,
            allowNull: true
        }, 
        video: {
            type: db.Sequelize.BLOB,
            allowNull: true
        },
        musica: {
            type: db.Sequelize.BLOB,
            allowNull: true
        },
        partitura: {
            type: db.Sequelize.BLOB,
            allowNull: true
        },
        obs: {
            type: db.Sequelize.STRING(100),
            allowNull: true
        },
        classificacao: {
            type: db.Sequelize.INTEGER,
            defaultValue: 1, // Valor padrão para a classificação
            allowNull: false,
            references: {
                model: 'classificacao', // deve ser igual ao nome da tabela em class.js
                key: 'id'
                        }
        },
        tipoId: {
            type: db.Sequelize.INTEGER,
            defaultValue: 1, // Valor padrão para o tipo de atividade
            allowNull: false,
            references: {
                model: 'tipo_atividades', // deve ser igual ao nome da tabela em TipoAtividade.js
                key: 'id'
            }
        },
    });

    // Associação
Ativ.belongsTo(TipoAtividade, { foreignKey: 'tipoId', as: 'tipo' });
    TipoAtividade.hasMany(Ativ, { foreignKey: 'tipoId' });
Ativ.belongsTo(Classificacao, { foreignKey: 'classId', as: 'class' });
    Classificacao.hasMany(Ativ, { foreignKey: 'classId' });
   
    module.exports = Ativ; //exportando o modelo Ativ para ser usado em outros arquivos