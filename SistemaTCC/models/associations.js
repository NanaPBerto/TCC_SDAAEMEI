// associations.js
const Ativ = require('./ativ');
const Tipoatividade = require('./tipoatividade');
const classificacao = require('./classificacao');
const Musico = require('./musico');
const AtividadeTipo = require('./atividade_tipo');

function setupAssociations() { 
  
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

    // Associação muitos-para-muitos Ativ <-> Tipoatividade
  Ativ.belongsToMany(Tipoatividade, {
    through: AtividadeTipo,
    foreignKey: 'atividadeId',
    otherKey: 'tipoId',
    as: 'tipos' // O alias deve ser 'tipos'
  });

  Tipoatividade.belongsToMany(Ativ, {
    through: AtividadeTipo,
    foreignKey: 'tipoId',
    otherKey: 'atividadeId',
    as: 'atividades'
  });
}



module.exports = setupAssociations;