// associations.js
const db = require('../db');
const Ativ = require('./ativ');
const Tipoatividade = require('./tipoatividade');
const classificacao = require('./classificacao');

function setupAssociations() {
  // Associação Ativ -> Tipoatividade
  Ativ.belongsTo(Tipoatividade, {
    foreignKey: 'tipoId',
    as: 'tipo'
  });
  
  // Associação inversa
  Tipoatividade.hasMany(Ativ, {
    foreignKey: 'tipoId',
    as: 'atividades'
  });
  
  // Associação Ativ -> classificacao
  Ativ.belongsTo(classificacao, {
    foreignKey: 'classificacao',
    as: 'class'
  });
  
  // Associação inversa
  classificacao.hasMany(Ativ, {
    foreignKey: 'classificacao',
    as: 'atividades'
  });
}
module.exports = setupAssociations;