const Ativ = require('./ativ');
const Tipoatividade = require('./tipoatividade');
const classificacao = require('./classificacao');
const Musico = require('./musico');
const AtividadeTipo = require('./atividade_tipo');

function setupAssociations() { 
  
  Ativ.belongsTo(classificacao, {
    foreignKey: 'classificacao',
    as: 'faixaEtaria'
  });
  
  classificacao.hasMany(Ativ, {
    foreignKey: 'classificacao',
    as: 'atividadesClassificadas' 
  });
  
  Ativ.belongsTo(Musico, {
    foreignKey: 'desenvolvedor',
    as: 'musico'
  });
  
  Musico.hasMany(Ativ, {
    foreignKey: 'desenvolvedor',
    as: 'atividades'
  });

  Ativ.belongsToMany(Tipoatividade, {
    through: AtividadeTipo,
    foreignKey: 'atividadeId',
    otherKey: 'tipoId',
    as: 'tipos'
  });

  Tipoatividade.belongsToMany(Ativ, {
    through: AtividadeTipo,
    foreignKey: 'tipoId',
    otherKey: 'atividadeId',
    as: 'atividades'
  });
}

module.exports = setupAssociations;