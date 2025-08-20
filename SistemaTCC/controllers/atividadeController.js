const ativ = require('../models/ativ');
const tipoatividade = require('../models/tipoatividade');
const classificacao = require('../models/classificacao');

// Página inicial de atividades
exports.home = (req, res) => {
  res.render('homeE', { showMenu: true, showSidebar: true });
};

// Listar submissões
exports.minhasSubmissoes = async (req, res) => {
  try {
    const ativs = await ativ.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: tipoatividade, as: 'tipo' }]
    });
    const plainAtivs = ativs.map(ativ => {
      const obj = ativ.toJSON();
      if (obj.imagem) {
        obj.imagemMime = obj.imagemMime || 'image/jpeg';
        obj.imagemBase64 = Buffer.from(obj.imagem).toString('base64');
      }
      return obj;
    });
    res.render('Msub', { 
      atividades: plainAtivs, 
      showMenu: true, 
      showSidebar: true, 
      showBackButton: true
    });
  } catch (erro) {
    console.error('Erro ao listar submissões:', erro);
    res.status(500).send('Erro ao listar submissões. Tente novamente mais tarde.');
  }
};

// Formulário de nova atividade
exports.novaAtividade = async (req, res) => {
  const tipos = await tipoatividade.findAll();
  res.render('formulario', {
    showMenu: true,
    showSidebar: true,
    showBackButton: true,
    tipos: tipos.map(tipo => tipo.toJSON()),
    atividade: null // Adicionado para facilitar lógica no formulário
  });
};

// Adicionar atividade
exports.add = async (req, res) => {
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

    // Validação simples dos campos obrigatórios
    if (!req.body.nome || !req.body.descricao || !req.body.tipoId) {
      return res.status(400).send('Preencha todos os campos obrigatórios.');
    }

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
      imagemMime: imagemMime, // Salva o mimetype se desejar
      obs: req.body.obs,
      classificacao: req.body.classificacao,
      tipoId: req.body.tipoId 
    });
    res.redirect('/painelM');
  } catch (erro) {
    console.error('Erro ao adicionar atividade:', erro);
    res.status(500).send('Erro ao adicionar atividade. Tente novamente.');
  }
};

// Deletar atividade
exports.deletar = async (req, res) => {
  try {
    await ativ.destroy({ where: { id: req.params.id } });
    res.redirect('/minhasSubmissoes');
  } catch (erro) {
    console.error('Erro ao deletar atividade:', erro);
    res.status(500).send('Erro ao deletar atividade. Tente novamente.');
  }
};

// Página editar atividade (renderiza o formulário para edição)
exports.editar = async (req, res) => {
  try {
    const ativ = await ativ.findByPk(req.params.id);
    if (!ativ) {
      return res.status(404).send('Atividade não encontrada');
    }
    const tipos = await tipoatividade.findAll();
    res.render('formulario', {
      showMenu: true,
      showSidebar: true,
      atividade: ativ.toJSON(),
      tipos: tipos.map(tipo => tipo.toJSON()),
      showBackButton: true,
    });
  } catch (erro) {
    res.send('Houve um erro: ' + erro);
  }
};

// Atualizar atividade (processa o formulário de edição)
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
    res.redirect('/minhasSubmissoes');
  } catch (erro) {
    console.error('Erro ao atualizar atividade:', erro);
    res.status(500).send('Erro ao atualizar atividade. Tente novamente.');
  }
};

// Página escolher
exports.escolher = (req, res) => {
  res.render('escolher', { showMenu: false, showSidebar: false, paginaEscolher: true });
};
