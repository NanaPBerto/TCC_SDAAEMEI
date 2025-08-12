const Sequelize = require('sequelize');

// Conexão com o banco de dados
const sequelize = new Sequelize('bdtcc', 'root', 'Necess1dad&', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306 // altere para 3306 se não tiver certeza que é 5500
});


module.exports = {
    Sequelize: Sequelize,
    sequelize: sequelize
};