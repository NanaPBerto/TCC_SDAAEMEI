// associations.js
const db = require('../db');
const Ativ = require('./ativ');
const Tipoatividade = require('./tipoatividade');
const classificacao = require('./classificacao');
const Musico = require('./musico');

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
  
  // Associação Ativ -> Musico
  Ativ.belongsTo(Musico, {
    foreignKey: 'desenvolvedor',
    as: 'musico'
  });
  Musico.hasMany(Ativ, {
    foreignKey: 'desenvolvedor',
    as: 'atividades'
  });
}
module.exports = setupAssociations;