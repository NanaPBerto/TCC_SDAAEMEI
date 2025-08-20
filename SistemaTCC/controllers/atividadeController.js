const express = require('express');
const router = express.Router();
const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');
const Classificacao = require('../models/classificacao');

// Página inicial de atividades
exports.home = (req, res) => {
  res.render('homeE');
};

// Listar submissões
exports.Msub = async (req, res) => {
  try {
    const usuario = res.locals.usuario;
    const isMusico = usuario && usuario.tipo === 'musico';
    const isEducador = usuario && usuario.tipo === 'educador';

    const ativs = await ativ.findAll({
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

    res.render('Msub', {
      atividades: plainAtivs,
      isMusico,
      isEducador
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
    let imagemBuffer = null;
    let imagemMime = null;

    if (req.files && req.files.length > 0) {
      const imgFile = req.files.find(file => file.fieldname === 'anexos' && file.mimetype.startsWith('image/'));
      if (imgFile) {
        imagemBuffer = imgFile.buffer;
        imagemMime = imgFile.mimetype;
      }
    }

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
      imagemMime: imagemMime,
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