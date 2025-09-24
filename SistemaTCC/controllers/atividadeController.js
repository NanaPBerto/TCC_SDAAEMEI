const express = require('express');
const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');

// Página inicial de atividades
exports.home = async (req, res) => {
  try {
    const atividadesComImagem = await ativ.findAll({
      where: { imagem: { [require('sequelize').Op.ne]: null } }
    });

    // LOG para depuração: veja se realmente há imagens vindas do banco
    console.log('Atividades com imagem do banco:', atividadesComImagem.map(a => ({
      nome: a.nome,
      imagemTipo: typeof a.imagem,
      imagemTamanho: a.imagem ? a.imagem.length : 0
    })));

    const imagensCarrossel = atividadesComImagem
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(a => ({
        nome: a.nome,
        descricao: a.descricao,
        imagemBase64: a.imagem ? `data:image/jpeg;base64,${Buffer.from(a.imagem).toString('base64')}` : null
      }));

    console.log('Imagens enviadas para o carrossel:', imagensCarrossel.map(img => ({
      nome: img.nome,
      descricao: img.descricao,
      tamanhoBase64: img.imagemBase64 ? img.imagemBase64.length : 0
    })));

    res.render('homeE', {
      imagensCarrossel,
      // ...outras variáveis necessárias...
    });
  } catch (error) {
    console.error('Erro ao carregar imagens do carrossel:', error);
    res.render('homeE', { imagensCarrossel: [] });
  }
};

// Listar submissões
exports.Msub = async (req, res) => {
  try {
    const usuario = res.locals.usuario;
    console.log('Usuário na sessão (Msub):', usuario);
    console.log('Tipo:', usuario && usuario.tipo);
    console.log('ID:', usuario && usuario.id);
    if (!usuario || usuario.tipo !== 'musico' || !usuario.id) {
      return res.status(403).send('Acesso negado ou usuário sem id.');
    }

    // Filtra atividades pelo ID do músico logado
    const ativs = await ativ.findAll({
      where: { desenvolvedor: usuario.id }, // ajuste o campo conforme seu model
      order: [['createdAt', 'DESC']],
      include: [{ model: Tipoatividade, as: 'tipo' }]
    });

    const plainAtivs = ativs.map(ativ => {
      const obj = ativ.toJSON();
      if (obj.imagem) {
        obj.imagemMime = obj.imagemMime || 'image/jpeg';
        obj.imagemBase64 = Buffer.from(obj.imagem).toString('base64');
      }
      return obj;
    });

    const isMusico = usuario.tipo === 'musico';
const isEducador = usuario.tipo === 'educador';

res.render('Msub', {
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
    res.render('formulario', {
      tipos: tipos.map(tipo => tipo.toJSON()),
      atividade: null
    });
  } catch (error) {
    console.error('Erro ao carregar formulário:', error);
    res.status(500).send('Erro ao carregar formulário');
  }
};

// Adicionar atividade
exports.add = async (req, res) => {
  try {
    console.log('Body recebido:', req.body);
    console.log('Files recebidos:', req.files);
    console.log('Usuário na sessão:', req.session.usuario);
    if (!req.session.usuario || !req.session.usuario.id) {
      return res.status(403).send('Usuário não logado ou id não encontrado.');
    }

    let imagemBuffer = null;
    let imagemMime = null;
    let videoBuffer = null;
    let musicaBuffer = null;
    let partituraBuffer = null;

    // Processar arquivos específicos
    if (req.files) {
      if (req.files['imagem']) {
        imagemBuffer = req.files['imagem'][0].buffer;
        imagemMime = req.files['imagem'][0].mimetype;
      }
      if (req.files['video']) {
        videoBuffer = req.files['video'][0].buffer;
      }
      if (req.files['musica']) {
        musicaBuffer = req.files['musica'][0].buffer;
      }
      if (req.files['partitura']) {
        partituraBuffer = req.files['partitura'][0].buffer;
      }
    }

    // Validar campos obrigatórios do modelo
    const camposObrigatorios = [
      'nome', 'descricao', 'objetivo', 'indicacao', 'vagas', 
      'duracao', 'recursos', 'condicoes', 'tipoId'
    ];
    
    for (const campo of camposObrigatorios) {
      if (!req.body[campo]) {
        return res.status(400).send(`Campo obrigatório faltando: ${campo}`);
      }
    }

    // Mapear classificação para ID (ajuste conforme sua tabela classificacao)
    const classificacaoMap = {
      '1 a 2 anos': 1,
      '2 a 3 anos': 2,
      '3 a 4 anos': 3,
      '4 a 5 anos': 4,
      '5 a 6 anos': 5
    };

    await ativ.create({
      nome: req.body.nome,
      descricao: req.body.descricao,
      objetivo: req.body.objetivo,
      indicacao: req.body.indicacao,
      vagas: req.body.vagas,
      duracao: req.body.duracao,
      recursos: req.body.recursos,
      condicoes: req.body.condicoes,
      imagem: imagemBuffer,
      imagemMime: imagemMime,
      video: videoBuffer,
      musica: musicaBuffer,
      partitura: partituraBuffer,
      obs: req.body.obs,
      classificacao: classificacaoMap[req.body.classificacao] || 3,
      tipoId: req.body.tipoId,
      desenvolvedor: req.session.usuario.id // Confirme que este campo existe
    });

    res.redirect('/painelM');
  } catch (erro) {
    console.error('Erro detalhado ao adicionar atividade:', erro);
    res.status(500).send('Erro ao adicionar atividade. Tente novamente.');
  }
};

exports.deletar = async (req, res) => {
  try {
    await ativ.destroy({ where: { id: req.params.id } });
    res.redirect('/Msub'); // Alterado para /Msub
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
    res.render('formulario', {
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
    let imagemBuffer = null;
    let imagemMime = null;

    if (req.files && req.files.length > 0) {
      const imgFile = req.files.find(file => file.fieldname === 'anexos' && file.mimetype.startsWith('image/'));
      if (imgFile) {
        imagemBuffer = imgFile.buffer;
        imagemMime = imgFile.mimetype;
      }
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
      obs: req.body.obs,
      classificacao: req.body.classificacao,
      tipoId: req.body.tipoId
    };

    if (imagemBuffer) {
      updateData.imagem = imagemBuffer;
      updateData.imagemMime = imagemMime;
    }

   await ativ.update(updateData, { where: { id: req.params.id } });
    res.redirect('/Msub');
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
    if (obj.imagem) {
      obj.imagemBase64 = `data:image/jpeg;base64,${Buffer.from(obj.imagem.data ? obj.imagem.data : obj.imagem).toString('base64')}`;
    }
    if (obj.partitura) {
      obj.partituraBase64 = `data:application/pdf;base64,${Buffer.from(obj.partitura.data ? obj.partitura.data : obj.partitura).toString('base64')}`;
    }
    if (obj.musica) {
      obj.musicaBase64 = `data:audio/mpeg;base64,${Buffer.from(obj.musica.data ? obj.musica.data : obj.musica).toString('base64')}`;
    }
    // Envie o nome do desenvolvedor (músico)
    obj.desenvolvedorNome = obj.musico ? obj.musico.nome : 'Desconhecido';
    res.render('atividade', { atividade: obj });
  } catch (error) {
    console.error('Erro ao buscar detalhes da atividade:', error);
    res.status(500).send('Erro ao buscar detalhes da atividade.');
  }
};