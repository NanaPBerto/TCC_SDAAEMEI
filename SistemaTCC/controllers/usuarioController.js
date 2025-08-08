const Musico = require('../models/musico');
const Educador = require('../models/educador');

// Função auxiliar para escolher o model
function getUsuarioModel(tipo) {
  if (tipo === 'M' || tipo === 'musico') return Musico;
  if (tipo === 'E' || tipo === 'educador') return Educador;
  throw new Error('Tipo de usuário inválido');
}

// Adicionar usuario
exports.add = async (req, res) => {
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

  // Defina o tipo de usuário pelo formulário (exemplo: req.body.tipoUsuario)
  const tipoUsuario = req.body.tipoUsuario || 'musico'; // ajuste conforme seu formulário

  const Usuario = getUsuarioModel(tipoUsuario);

  // Monte os dados conforme o tipo
  let dados = {};
    if (Usuario === Musico) {
      dados = {
        nome: req.body.nome || 'Nome não fornecido',
        tipo: req.body.tipo || 'musico',
        login: req.body.usuario,
        senha: req.body.senha,
        cpf: req.body.cpf ? req.body.cpf.replace(/\D/g, '') : null, // mantém como string numérica
        email: req.body.email,
        fone: req.body.telefone ? req.body.telefone.replace(/\D/g, '') : null, // mantém como string numérica
        uf: req.body.uf,
        imagem: imagemBuffer,
        obs: req.body.obs,

    };

    dados = {
      nome: req.body.nome,
      tipo: req.body.tipo || 'educador',
      login: req.body.usuario,
      senha: req.body.senha,
      cidade: req.body.cidade,
      uf: req.body.uf,

    };
  }else { // Educador
        dados = {
            nome: req.body.nome || 'Educador sem nome',
            tipo: req.body.tipo || 'educador',
            login: req.body.usuario,
            senha: req.body.senha,
            cidade: req.body.cidade,
            uf: req.body.uf,

        };
  }

   try {
        await Usuario.create(dados);
        res.redirect('/');
    } catch (erro) {
        console.error('Erro detalhado:', erro);
        res.status(500).send('Houve um erro: ' + erro.message);
    }
};

// Deletar usuario
exports.deletar = (req, res) => {
  // Escolha o model conforme o tipo, se necessário
  // Exemplo: const Usuario = getUsuarioModel(req.body.tipoUsuario);
  Musico.destroy({ where: { cod: req.params.id } }) // ou Educador, conforme o caso
    .then(() => res.redirect('/minhasSubmissoes'))
    .catch(erro => res.send('Houve um erro: ' + erro));
};

// Página editar usuario (renderiza o formulário para edição)
exports.editar = async (req, res) => {
  try {
    const ativ = await Usuario.findByPk(req.params.id);
    if (!ativ) {
      return res.status(404).send('Atividade não encontrada');
    }
    const tipos = await TipoAtividade.findAll();
    res.render('formulario', {
      showMenu: true,
      showSidebar: true,
      usuario: ativ.toJSON(),
      tipos: tipos.map(tipo => tipo.toJSON()),
      showBackButton: true,
    });
  } catch (erro) {
    res.send('Houve um erro: ' + erro);
  }
};

// Atualizar usuario (processa o formulário de edição)
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

    await Usuario.update(updateData, { where: { id: req.params.id } });
    res.redirect('/minhasSubmissoes');
  } catch (erro) {
    res.send('Houve um erro ao atualizar: ' + erro);
  }
};