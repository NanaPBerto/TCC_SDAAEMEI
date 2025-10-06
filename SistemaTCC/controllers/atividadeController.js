const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');
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
      include: [{ model: Tipoatividade, as: 'tipo' }]
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
    res.status(500).send('Erro ao listar submissões. Tente novamente mais tarde.');
  }
};

// Formulário de nova atividade
exports.novaAtividade = async (req, res) => {
  try {
    const tipos = await Tipoatividade.findAll();
    res.render('cadastroA', {
      tipos: tipos.map(tipo => tipo.toJSON()),
      atividade: null
    });
  } catch (error) {
    console.error('Erro ao carregar formulário:', error);
    res.status(500).send('Erro ao carregar formulário');
  }
};

exports.add = async (req, res) => {
    try {
        const { nome, descricao, objetivo, indicacao, vagas, duracao, recursos, condicoes, obs, tipoId } = req.body;
        
        // Validar usuário logado
        if (!req.session.usuario || !req.session.usuario.id) {
            return res.status(401).send('Usuário não autenticado');
        }

        // Validar campos obrigatórios
        const camposObrigatorios = [
            'nome', 'descricao', 'objetivo', 'indicacao', 'vagas', 
            'duracao', 'recursos', 'condicoes', 'tipoId'
        ];
        
        for (const campo of camposObrigatorios) {
            if (!req.body[campo]) {
                return res.status(400).send(`Campo obrigatório faltando: ${campo}`);
            }
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
            '1 a 2 anos': 1,
            '2 a 3 anos': 2,
            '3 a 4 anos': 3,
            '4 a 5 anos': 4,
            '5 a 6 anos': 5
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
            indicacao: req.body.indicacao, // Nível de dificuldade (input text)
            vagas: req.body.vagas,
            duracao: req.body.duracao,
            recursos: req.body.recursos,
            condicoes: req.body.condicoes,
            obs: req.body.obs || null,

            classificacao: classificacaoId,
            tipoId: req.body.tipoId,
            desenvolvedor: req.session.usuario.id,
            
            // Caminhos dos arquivos
            imagem: imagem ? `/uploads/${imagem.filename}` : null,
            musica: musica ? `/uploads/${musica.filename}` : null,
            video: video ? `/uploads/${video.filename}` : null,
            partitura: partitura ? `/uploads/${partitura.filename}` : null,
        };

        console.log('Dados para criar atividade:', atividadeData);

        await ativ.create(atividadeData);
        res.redirect('/painelM');

    } catch (erro) {
        console.error('Erro detalhado ao adicionar atividade:', erro);
        
        // Recarregar tipos para o formulário em caso de erro
        try {
            const tipos = await Tipoatividade.findAll();
            res.render('cadastroA', {
                tipos: tipos.map(tipo => tipo.toJSON()),
                atividade: null,
                error: 'Erro ao adicionar atividade: ' + erro.message,
                formData: req.body
            });
        } catch (loadError) {
            res.status(500).send('Erro ao adicionar atividade. Tente novamente.');
        }
    }
};

exports.deletar = async (req, res) => {
  try {
    await ativ.destroy({ where: { id: req.params.id } });
    res.redirect('/submissoes');
  } catch (erro) {
    console.error('Erro ao deletar atividade:', erro);
    res.status(500).send('Erro ao deletar atividade. Tente novamente.');
  }
};

// Editar atividade

// Carregar formulário de edição (GET) - VERSÃO SEGURA
exports.carregarEdicao = async (req, res) => {
  try {
    // Por enquanto, não inclua associações para evitar problemas
    const atividade = await ativ.findByPk(req.params.id);
    const tipos = await Tipoatividade.findAll();
    
    if (!atividade) {
      return res.status(404).send('Atividade não encontrada');
    }

    res.render('cadastroA', {
      tipos: tipos.map(tipo => tipo.toJSON()),
      atividade: atividade.toJSON(),
      edicao: true
    });
  } catch (error) {
    console.error('Erro ao carregar edição:', error);
    res.status(500).send('Erro ao carregar formulário de edição');
  }
};

// Processar edição (POST)
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
      indicacao: req.body.indicacao, // Nível de dificuldade (input text)
      vagas: req.body.vagas,
      duracao: req.body.duracao,
      recursos: req.body.recursos,
      condicoes: req.body.condicoes,
      obs: req.body.obs,
      tipoId: req.body.tipoId
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
    
    await ativ.update(updateData, { where: { id: atividadeId } });
    res.redirect('/submissoes');
    
  } catch (erro) {
    console.error('Erro ao atualizar atividade:', erro);
    
    // Recarregar tipos e atividade em caso de erro
    try {
      const tipos = await Tipoatividade.findAll();
      const atividade = await ativ.findByPk(req.params.id);
      
      res.render('cadastroA', {
        tipos: tipos.map(tipo => tipo.toJSON()),
        atividade: atividade ? atividade.toJSON() : null,
        edicao: true,
        error: 'Erro ao atualizar atividade: ' + erro.message,
        formData: req.body
      });
    } catch (loadError) {
      res.status(500).send('Erro ao atualizar atividade. Tente novamente.');
    }
  }
};

// Página escolher
exports.escolher = (req, res) => {
  res.render('escolher');
};

//função detalheAtividade
exports.detalheAtividade = async (req, res) => {
  try {
    const id = req.params.id;
    const atividade = await ativ.findByPk(id, {
      include: [
        { model: Tipoatividade, as: 'tipo' },
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
    res.status(500).send('Erro ao buscar detalhes da atividade.');
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
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};