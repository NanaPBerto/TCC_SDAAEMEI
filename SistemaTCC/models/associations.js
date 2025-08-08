// associations.js
const db = require('../db');
const ativ = require('./ativ');
const tipoatividade = require('./tipoatividade');
const classificacao = require('./classificacao');

function setupAssociations() {
  // Associação ativ -> tipoatividade
  ativ.belongsTo(tipoatividade, {
    foreignKey: 'tipoId',
    as: 'tipo'
  });
  
  // Associação inversa
  tipoatividade.hasMany(ativ, {
    foreignKey: 'tipoId',
    as: 'atividades'
  });
  
  // Associação ativ -> classificacao
  ativ.belongsTo(classificacao, {
    foreignKey: 'classificacao',
    as: 'class'
  });
  
  // Associação inversa
  classificacao.hasMany(ativ, {
    foreignKey: 'classificacao',
    as: 'atividades'
  });
}

module.exports = setupAssociations;