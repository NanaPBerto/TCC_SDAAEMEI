const Ativ = require('../models/Ativ');
const TipoAtividade = require('../models/TipoAtividade');



// Página inicial de atividades
exports.home = (req, res) => {
  res.render('homeM', { showMenu: true, showSidebar: true });
};

// Listar submissões
exports.minhasSubmissoes = (req, res) => {
  Ativ.findAll({
    order: [['createdAt', 'DESC']],
    include: [{ model: TipoAtividade, as: 'tipo' }]
  }).then(ativs => {
    const plainAtivs = ativs.map(ativ => {
      const obj = ativ.toJSON();
      if (obj.imagem) {
        // Se você salva o mimetype, use ele. Caso contrário, use image/jpeg como padrão.
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
  });
};

// Formulário de nova atividade
exports.novaAtividade = async (req, res) => {
  const tipos = await TipoAtividade.findAll();
  res.render('formulario', {
    showMenu: true,
    showSidebar: true,
    showBackButton: true,
    tipos: tipos.map(tipo => tipo.toJSON()),
    atividade: null // Adicionado para facilitar lógica no formulário
  });
};

// Adicionar atividade
exports.add = (req, res) => {
  let imagemBuffer = null;
  let imagemMime = null;

  if (req.files && req.files.length > 0) {
    // Procura o primeiro arquivo de imagem enviado no campo 'anexos'
    const imgFile = req.files.find(file => file.fieldname === 'anexos' && file.mimetype.startsWith('image/'));
    if (imgFile) {
      imagemBuffer = imgFile.buffer;
      imagemMime = imgFile.mimetype;
    }
  }

  Ativ.create({
    nome: req.body.nome,
    descricao: req.body.descricao,
    objetivo: req.body.objetivo,
    indicacao: req.body.indicacao,
    vagas: req.body.vagas,
    duracao: req.body.duracao,
    recursos: req.body.recursos,
    condicoes: req.body.condicoes,
    imagem: imagemBuffer,
    obs: req.body.obs,
    classificacao: req.body.classificacao,
    tipoId: req.body.tipoId 
  }).then(() => res.redirect('/'))
    .catch(erro => res.send('Houve um erro: ' + erro));
};

// Deletar atividade
exports.deletar = (req, res) => {
  Ativ.destroy({ where: { id: req.params.id } })
    .then(() => res.redirect('/minhasSubmissoes'))
    .catch(erro => res.send('Houve um erro: ' + erro));
};

// Página editar atividade (renderiza o formulário para edição)
exports.editar = async (req, res) => {
  try {
    const ativ = await Ativ.findByPk(req.params.id);
    if (!ativ) {
      return res.status(404).send('Atividade não encontrada');
    }
    const tipos = await TipoAtividade.findAll();
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
      // Se quiser salvar o mimetype, adicione aqui: updateData.imagemMime = imagemMime;
    }

    await Ativ.update(updateData, { where: { id: req.params.id } });
    res.redirect('/minhasSubmissoes');
  } catch (erro) {
    res.send('Houve um erro ao atualizar: ' + erro);
  }
};

// Página escolher
exports.escolher = (req, res) => {
  res.render('escolher', { showMenu: false, showSidebar: false });
};
