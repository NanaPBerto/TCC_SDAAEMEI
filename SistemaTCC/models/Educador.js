const db = require('./db');

const Educador = db.sequelize.define('educadores', {
    cod: {
        type: db.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nome: {
        type: db.Sequelize.STRING(50),
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
    cidade: {
        type: db.Sequelize.STRING(50),
        allowNull: true
    },
    uf: {
        type: db.Sequelize.STRING(2),
        allowNull: true
    }
});

//Educador.sync({ force: true }) //force: true para recriar a tabela, false para não recriar
module.exports = Educador; //exportando o modelo Educador para ser usado em outros arquivos