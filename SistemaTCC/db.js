const Sequelize = require('sequelize');

// Conexão com o banco de dados
const sequelize = new Sequelize('testetcc', 'root', '1234', {
    host: 'localhost',
    dialect: 'mysql',
    port: 5500
});


module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
};