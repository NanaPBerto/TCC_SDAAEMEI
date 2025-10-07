const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade'); // Certifique-se que é sempre esse nome
const AtividadeTipo = require('../models/atividade_tipo');
const db = require('../db');

// Página inicial de atividades - VERSÃO CORRIGIDA E TESTADA
exports.home = async (req, res) => {
  try {
    console.log('=== INICIANDO CARREGAMENTO DO CARROSSEL ===');
    
    const atividades = await ativ.findAll({
      limit: 5,
      order: db.sequelize.random(),
      where: {
        [db.Sequelize.Op.and]: [
          { imagem: { [db.Sequelize.Op.ne]: null } },
          { imagem: { [db.Sequelize.Op.ne]: '' } }
        ]
      },
      attributes: ['id', 'nome', 'objetivo', 'imagem']
    });

    console.log(`✅ Encontradas ${atividades.length} atividades para o carrossel`);
    
    // Log detalhado para debug
    atividades.forEach((atividade, index) => {
      console.log(`📁 Atividade ${index + 1}:`, {
        id: atividade.id,
        nome: atividade.nome,
        imagem: atividade.imagem,
        objetivo: atividade.objetivo
      });
    });

    // Garantir que os dados sejam objetos simples
    const atividadesCarrossel = atividades.map(a => a.get ? a.get({ plain: true }) : a);

    console.log('🎯 Dados que serão enviados para o template:', atividadesCarrossel);

    res.render('index', {
      atividades: atividadesCarrossel,
      layout: 'main' // Garantir que use o layout correto
    });

  } catch (error) {
    console.error('❌ Erro ao carregar carrossel:', error);
    // Em caso de erro, enviar array vazio explicitamente
    res.render('index', { 
      atividades: [],
      layout: 'main'
    });
  }
};

// Listar submissões
exports.submissoes = async (req, res) => {
  try {
    const usuario = res.locals.usuario;
    console.log('Usuário na sessão (submissoes):', usuario);
    
    if (!usuario || usuario.tipo !== 'musico' || !usuario.id) {
      return res.status(403).send('Acesso negado ou usuário sem id.');
    }

    const ativs = await ativ.findAll({
      where: { desenvolvedor: usuario.id },
      order: [['createdAt', 'DESC']],
      include: [{ 
        model: Tipoatividade, 
        as: 'tipos',
        through: { attributes: [] }
      }]
    });

    const plainAtivs = ativs.map(ativ => {
      const obj = ativ.toJSON();
      return obj;
    });

    const isMusico = usuario.tipo === 'musico';
    const isEducador = usuario.tipo === 'educador';

    res.render('submissoes', {
      atividades: plainAtivs,
      isMusico,
      isEducador,
    });
  } catch (erro) {
    console.error('Erro ao listar submissões:', erro);
    res.render('submissoes', { atividades: [], alert: 'Erro ao listar submissões. Tente novamente mais tarde.' });
  }
};

// Formulário de nova atividade
exports.novaAtividade = async (req, res) => {
  try {
    const tipos = await Tipoatividade.findAll();
    res.render('cadastroA', {
      tipos: tipos.map(tipo => tipo.toJSON()),
      atividade: { tiposSelecionados: [] }, // Corrija para tiposSelecionados
      edicao: false
      
    });
  } catch (error) {
    console.error('Erro ao carregar formulário:', error);
    res.render('cadastroA', { tipos: [], atividade: null, alert: 'Erro ao carregar formulário' });
  }
};

exports.add = async (req, res) => {
    try {
        const { nome, descricao, objetivo, indicacao, vagas, duracao, recursos, condicoes, obs } = req.body;
        
        // Validar usuário logado
        if (!req.session.usuario || !req.session.usuario.id) {
            return res.status(401).send('Usuário não autenticado');
        }

        // Validar campos obrigatórios
        const camposObrigatorios = [
            'nome', 'descricao', 'objetivo', 'indicacao', 'vagas', 
            'duracao', 'recursos', 'condicoes'
        ];
        
        for (const campo of camposObrigatorios) {
            if (!req.body[campo]) {
                return res.status(400).send(`Campo obrigatório faltando: ${campo}`);
            }
        }

        // Validar que pelo menos um tipo foi selecionado
        const tiposSelecionados = Array.isArray(req.body.tipos) ? req.body.tipos : [req.body.tipos];
        if (!tiposSelecionados || tiposSelecionados.length === 0 || !tiposSelecionados[0]) {
            return res.status(400).send('Selecione pelo menos um tipo de atividade');
        }

        // Acessar arquivos
        const imagem = req.files?.imagem?.[0];
        const video = req.files?.video?.[0];
        const musica = req.files?.musica?.[0];
        const partitura = req.files?.partitura?.[0];

        console.log('Detalhes dos arquivos:');
        if (imagem) console.log('Imagem:', imagem.filename, imagem.size + ' bytes');
        if (musica) console.log('Música:', musica.filename, musica.size + ' bytes');
        if (video) console.log('Vídeo:', video ? video.filename : 'não enviado');
        if (partitura) console.log('Partitura:', partitura ? partitura.filename : 'não enviado');

        const faixaEtariaMap = {
      'berçário I': 1,
      'berçário II': 2,
      'berçário III': 3,
      'maternal I': 4,
      'maternal II': 5,
      'pré I': 6,
      'pré II': 7
    };

        const faixaEtariaSelecionada = req.body.classificacao;
        const classificacaoId = faixaEtariaMap[faixaEtariaSelecionada] || 3;

        console.log('Faixa etária selecionada:', faixaEtariaSelecionada);
        console.log('Classificação ID calculada:', classificacaoId);

        // Dados da atividade
        const atividadeData = {
            nome: req.body.nome,
            descricao: req.body.descricao,
            objetivo: req.body.objetivo,
            indicacao: req.body.indicacao,
            vagas: req.body.vagas,
            duracao: req.body.duracao,
            recursos: req.body.recursos,
            condicoes: req.body.condicoes,
            obs: req.body.obs || null,

            classificacao: classificacaoId,
            desenvolvedor: req.session.usuario.id,
            
            // Caminhos dos arquivos
            imagem: imagem ? `/uploads/${imagem.filename}` : null,
            musica: musica ? `/uploads/${musica.filename}` : null,
            video: video ? `/uploads/${video.filename}` : null,
            partitura: partitura ? `/uploads/${partitura.filename}` : null,
        };

        console.log('Dados para criar atividade:', atividadeData);
        console.log('Tipos selecionados:', tiposSelecionados);

        // Criar a atividade
        const novaAtividade = await ativ.create(atividadeData);
        
        // Criar registros na tabela de junção para os tipos
        const tiposData = tiposSelecionados.map(tipoId => ({
            atividadeId: novaAtividade.id,
            tipoId: parseInt(tipoId),
            tiposSelecionados
        }));
        
        await AtividadeTipo.bulkCreate(tiposData);

        res.redirect('/painelM');
    } catch (erro) {
        console.error('Erro detalhado ao adicionar atividade:', erro);
        try {
            const tipos = await Tipoatividade.findAll();
            res.render('cadastroA', {
                tipos: tipos.map(tipo => tipo.toJSON()),
                atividade: null,
                error: 'Erro ao adicionar atividade: ' + erro.message,
                alert: 'Erro ao adicionar atividade: ' + erro.message,
                formData: req.body
            });
        } catch (loadError) {
            req.session.alert = 'Erro ao adicionar atividade. Tente novamente.';
            return res.redirect('/painelM');
        }
    }
};

exports.deletar = async (req, res) => {
  try {
    // Primeiro deletar os registros da tabela de junção
    await AtividadeTipo.destroy({ where: { atividadeId: req.params.id } });
    // Depois deletar a atividade
    await ativ.destroy({ where: { id: req.params.id } });
    res.redirect('/submissoes');
  } catch (erro) {
    console.error('Erro ao deletar atividade:', erro);
    req.session.alert = 'Erro ao deletar atividade. Tente novamente.';
    res.redirect('/submissoes');
  }
};

// Carregar formulário de edição (GET) - VERSÃO ATUALIZADA
exports.carregarEdicao = async (req, res) => {
  try {
    const atividade = await ativ.findByPk(req.params.id, {
      include: [{
        model: Tipoatividade,
        as: 'tipos', // O alias deve ser 'tipos'
        through: { attributes: [] }
      }]
    });
    
    const tipos = await Tipoatividade.findAll();
    
    if (!atividade) {
      return res.status(404).send('Atividade não encontrada');
    }

    // Extrair IDs dos tipos selecionados
    const tiposSelecionados = atividade.tipos.map(tipo => tipo.id);

    res.render('cadastroA', {
      tipos: tipos.map(tipo => tipo.toJSON()),
      atividade: {
        ...atividade.toJSON(),
        tiposSelecionados // Corrija para tiposSelecionados
      },
      edicao: true
    });
  } catch (error) {
    console.error('Erro ao carregar edição:', error);
    res.render('cadastroA', { tipos: [], atividade: null, edicao: true, alert: 'Erro ao carregar formulário de edição' });
  }
};

// Processar edição (POST) - VERSÃO ATUALIZADA
exports.processarEdicao = async (req, res) => {
  try {
    const atividadeId = req.params.id;
    
    // Buscar atividade atual para preservar arquivos
    const atividadeAtual = await ativ.findByPk(atividadeId);
    if (!atividadeAtual) {
      return res.status(404).send('Atividade não encontrada');
    }

    const updateData = {
      nome: req.body.nome,
      descricao: req.body.descricao,
      objetivo: req.body.objetivo,
      indicacao: req.body.indicacao,
      vagas: req.body.vagas,
      duracao: req.body.duracao,
      recursos: req.body.recursos,
      condicoes: req.body.condicoes,
      obs: req.body.obs
    };

    const faixaEtariaMap = {
      'berçário I': 1,
      'berçário II': 2,
      'berçário III': 3,
      'maternal I': 4,
      'maternal II': 5,
      'pré I': 6,
      'pré II': 7
    };

    const faixaEtariaSelecionada = req.body.classificacao;
    updateData.classificacao = faixaEtariaMap[faixaEtariaSelecionada] || 3;

    console.log('Faixa etária selecionada:', faixaEtariaSelecionada);
    console.log('Classificação ID calculada:', updateData.classificacao);

    // Processar arquivos - preservar existentes se não enviar novos
    if (req.files && req.files.length > 0) {
      const imagem = req.files.find(file => file.fieldname === 'imagem');
      const musica = req.files.find(file => file.fieldname === 'musica');
      const video = req.files.find(file => file.fieldname === 'video');
      const partitura = req.files.find(file => file.fieldname === 'partitura');

      if (imagem) {
        updateData.imagem = `/uploads/${imagem.filename}`;
      } else {
        updateData.imagem = atividadeAtual.imagem;
      }
      if (musica) {
        updateData.musica = `/uploads/${musica.filename}`;
      } else {
        updateData.musica = atividadeAtual.musica;
      }
      if (video) {
        updateData.video = `/uploads/${video.filename}`;
      } else {
        updateData.video = atividadeAtual.video;
      }
      if (partitura) {
        updateData.partitura = `/uploads/${partitura.filename}`;
      } else {
        updateData.partitura = atividadeAtual.partitura;
      }
    } else {
      // Se não enviou novos arquivos, manter os atuais
      updateData.imagem = atividadeAtual.imagem;
      updateData.musica = atividadeAtual.musica;
      updateData.video = atividadeAtual.video;
      updateData.partitura = atividadeAtual.partitura;
    }

    console.log('Atualizando atividade:', updateData);
    
    // Atualizar a atividade
    await ativ.update(updateData, { where: { id: atividadeId } });
    
    // Atualizar tipos - primeiro remover todos os tipos existentes
    await AtividadeTipo.destroy({ where: { atividadeId } });
    
    // Depois adicionar os novos tipos selecionados
    const tiposSelecionados = Array.isArray(req.body.tipos) ? req.body.tipos : [req.body.tipos];
    if (tiposSelecionados && tiposSelecionados.length > 0 && tiposSelecionados[0]) {
      const tiposData = tiposSelecionados.map(tipoId => ({
        atividadeId: atividadeId,
        tipoId: parseInt(tipoId)
      }));
      
      await AtividadeTipo.bulkCreate(tiposData);
    }

    res.redirect('/submissoes');
    
  } catch (erro) {
    console.error('Erro ao atualizar atividade:', erro);
    try {
      const tipos = await Tipoatividade.findAll();
      const atividade = await ativ.findByPk(req.params.id, {
        include: [{
          model: Tipoatividade,
          as: 'tipos',
          through: { attributes: [] }
        }]
      });
      
      const tiposSelecionados = atividade ? atividade.tipos.map(tipo => tipo.id) : [];
      
      res.render('cadastroA', {
        tipos: tipos.map(tipo => tipo.toJSON()),
        atividade: atividade ? {
          ...atividade.toJSON(),
          tiposSelecionados: tiposSelecionados
        } : null,
        edicao: true,
        error: 'Erro ao atualizar atividade: ' + erro.message,
        alert: 'Erro ao atualizar atividade: ' + erro.message,
        formData: req.body
      });
    } catch (loadError) {
      req.session.alert = 'Erro ao atualizar atividade. Tente novamente.';
      return res.redirect('/submissoes');
    }
  }
};

// Página escolher
exports.escolher = (req, res) => {
  res.render('escolher');
};

//função detalheAtividade - VERSÃO ATUALIZADA
exports.detalheAtividade = async (req, res) => {
  try {
    const id = req.params.id;
    const atividade = await ativ.findByPk(id, {
      include: [
        { 
          model: Tipoatividade, 
          as: 'tipos',
          through: { attributes: [] }
        },
        { model: require('../models/musico'), as: 'musico' },
        { model: require('../models/classificacao'), as: 'faixaEtaria' } 
      ]
    });
    if (!atividade) {
      return res.status(404).send('Atividade não encontrada');
    }
    const obj = atividade.toJSON();
    obj.desenvolvedorNome = obj.musico ? obj.musico.nome : 'Desconhecido';
    
    res.render('atividade', { atividade: obj });
  } catch (error) {
    console.error('Erro ao buscar detalhes da atividade:', error);
    res.render('atividade', { atividade: null, alert: 'Erro ao buscar detalhes da atividade.' });
  }
};

//pesquisas
exports.sugestoesAtividades = async (req, res) => {
    try {
        const termo = req.query.q || '';
        
        const atividades = await ativ.findAll({
            where: {
                nome: {
                    [db.Sequelize.Op.like]: `%${termo}%`
                }
            },
            limit: 5, // Limitar a 5 sugestões
            attributes: ['id', 'nome', 'objetivo'] // Apenas campos necessários
        });

        res.json(atividades);
    } catch (error) {
        console.error('Erro ao buscar sugestões:', error);
        res.status(500).json({ error: 'Erro interno do servidor', alert: 'Erro ao buscar sugestões.' });
    }
};