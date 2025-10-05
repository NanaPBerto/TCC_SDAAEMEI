// associations.js
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
  
  // ⭐⭐ CORREÇÃO: Mude o alias para evitar conflito ⭐⭐
  Ativ.belongsTo(classificacao, {
    foreignKey: 'classificacao',
    as: 'faixaEtaria' // ⭐⭐ ALIAS DIFERENTE DO NOME DO MODELO ⭐⭐
  });
  
  // Associação inversa (também com alias diferente)
  classificacao.hasMany(Ativ, {
    foreignKey: 'classificacao',
    as: 'atividadesClassificadas' // ⭐⭐ ALIAS DIFERENTE ⭐⭐
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