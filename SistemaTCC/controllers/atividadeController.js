const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');

// Página inicial de atividades
exports.home = async (req, res) => {
  try {
    const atividadesComImagem = await ativ.findAll({
      where: { imagem: { [require('sequelize').Op.ne]: null } }
    });
 
    const imagensCarrossel = atividadesComImagem
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(a => ({
        nome: a.nome,
        descricao: a.descricao,
        imagemBase64: a.imagem ? `/uploads/${a.imagem}` : null
      }));

    res.render('index', {
      imagensCarrossel,
    });
  } catch (error) {
    console.error('Erro ao carregar imagens do carrossel:', error);
    res.render('index', { imagensCarrossel: [] });
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
  // ⭐⭐ CORREÇÃO: Usar URLs diretas em vez de Base64 ⭐⭐
  // As imagens/arquivos agora são servidos estaticamente
  // Não precisa converter para Base64
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
        const { nome, descricao, objetivo, indicacao, vagas, duracao, recursos, condicoes, obs, desenvolvedor, classificacao, tipoId } = req.body;
        
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

        // Acessar arquivos - AGORA COM FILENAME CORRETO
        const imagem = req.files?.imagem?.[0];
        const video = req.files?.video?.[0];
        const musica = req.files?.musica?.[0];
        const partitura = req.files?.partitura?.[0];

        console.log('Detalhes dos arquivos:');
        if (imagem) console.log('Imagem:', imagem.filename, imagem.size + ' bytes');
        if (musica) console.log('Música:', musica.filename, musica.size + ' bytes');
        if (video) console.log('Vídeo:', video ? video.filename : 'não enviado');
        if (partitura) console.log('Partitura:', partitura ? partitura.filename : 'não enviado');

        // Mapear classificação para ID
        const classificacaoMap = {
            '1 a 2 anos': 1,
            '2 a 3 anos': 2,
            '3 a 4 anos': 3,
            '4 a 5 anos': 4,
            '5 a 6 anos': 5
        };

        // ⭐⭐ CORREÇÃO: Salvar APENAS caminhos dos arquivos ⭐⭐
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
            classificacao: classificacaoMap[req.body.indicacao] || 3, // Corrigido typo: indexao → indicacao
            tipoId: req.body.tipoId,
            desenvolvedor: req.session.usuario.id,
            
            // ⭐⭐ APENAS CAMINHOS - NÃO SALVAR BUFFERS NO BANCO ⭐⭐
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

// Página editar atividade
exports.editar = async (req, res) => {
  try {
    const atividade = await ativ.findByPk(req.params.id);
    if (!atividade) {
      return res.status(404).send('Atividade não encontrada');
    }
    const tipos = await Tipoatividade.findAll();
    res.render('cadastroA', {
      atividade: atividade.toJSON(),
      tipos: tipos.map(tipo => tipo.toJSON())
    });
  } catch (erro) {
    console.error('Erro ao editar atividade:', erro);
    res.status(500).send('Erro ao carregar edição');
  }
};

// Atualizar atividade
exports.atualizar = async (req, res) => {
  try {
    const updateData = {
      nome: req.body.nome,
      descricao: req.body.descricao,
      objetivo: req.body.objetivo,
      indicacao: req.body.indicacao,
      vagas: req.body.vagas,
      duracao: req.body.duracao,
      recursos: req.body.recursos,
      condicoes: req.body.condicoes,
      obs: req.body.obs,
      classificacao: req.body.classificacao,
      tipoId: req.body.tipoId
    };

    // ⭐⭐ CORREÇÃO: Processar arquivos se existirem - APENAS CAMINHOS ⭐⭐
    if (req.files && req.files.length > 0) {
      const imagem = req.files.find(file => file.fieldname === 'imagem');
      const musica = req.files.find(file => file.fieldname === 'musica');
      const video = req.files.find(file => file.fieldname === 'video');
      const partitura = req.files.find(file => file.fieldname === 'partitura');

      if (imagem) {
        updateData.imagem = `/uploads/${imagem.filename}`;
      }
      if (musica) {
        updateData.musica = `/uploads/${musica.filename}`;
      }
      if (video) {
        updateData.video = `/uploads/${video.filename}`;
      }
      if (partitura) {
        updateData.partitura = `/uploads/${partitura.filename}`;
      }
    }

    await ativ.update(updateData, { where: { id: req.params.id } });
    res.redirect('/submissoes');
  } catch (erro) {
    console.error('Erro ao atualizar atividade:', erro);
    res.status(500).send('Erro ao atualizar atividade. Tente novamente.');
  }
};

// Página escolher
exports.escolher = (req, res) => {
  res.render('escolher');
};

exports.detalheAtividade = async (req, res) => {
  try {
    const id = req.params.id;
    const atividade = await ativ.findByPk(id, {
      include: [
        { model: Tipoatividade, as: 'tipo' },
        { model: require('../models/musico'), as: 'musico' }
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