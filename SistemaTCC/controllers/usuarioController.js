const express = require('express');
const router = express.Router();
const Musico = require('../models/musico');
const Educador = require('../models/educador');

function getUsuarioModel(tipo) {
  if (tipo === 'M' || tipo === 'musico') return Musico;
  if (tipo === 'E' || tipo === 'educador') return Educador;
  throw new Error('Tipo de usuário inválido');
}

// Adicionar usuario
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

    const tipoUsuario = req.body.tipo || 'musico';
    const Usuario = getUsuarioModel(tipoUsuario);

    let dados = {};
    if (Usuario === Musico) {
      dados = {
        nome: req.body.nome || 'Nome não fornecido',
        tipo: req.body.tipo || 'musico',
        login: req.body.usuario,
        senha: req.body.senha,
        cpf: req.body.cpf ? req.body.cpf.replace(/\D/g, '') : null,
        email: req.body.email,
        fone: req.body.telefone ? req.body.telefone.replace(/\D/g, '') : null,
        uf: req.body.uf,
        imagem: imagemBuffer,
        obs: req.body.obs,
        cidade: req.body.cidade,
        minicurriculo: req.body.minicurriculo
      };
    } else {
      dados = {
        nome: req.body.nome || 'Educador sem nome',
        tipo: req.body.tipo || 'educador',
        login: req.body.usuario,
        senha: req.body.senha,
        cidade: req.body.cidade,
        uf: req.body.uf
      };
    }

    await Usuario.create(dados);
    res.redirect('/');
  } catch (erro) {
    console.error('Erro detalhado:', erro);
    res.render('cadastro' + (Usuario === Musico ? 'M' : 'E'), { alert: 'Houve um erro: ' + erro.message });
  }
};

// Deletar usuario
exports.deletar = async (req, res) => {
  try {
    await Musico.destroy({ where: { cod: req.params.id } });
    res.redirect('/Msub');
  } catch (erro) {
    console.error('Erro ao deletar usuário:', erro);
    res.status(500).send('Erro ao deletar usuário');
  }
};