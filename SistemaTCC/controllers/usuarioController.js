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
    let minicurriculoBuffer = null;

    if (req.files) {
      if (req.files['imagem']) {
        imagemBuffer = req.files['imagem'][0].buffer;
      }
      if (req.files['minicurriculo']) {
        minicurriculoBuffer = req.files['minicurriculo'][0].buffer;
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
        minicurriculo: minicurriculoBuffer,
        obs: req.body.obs,
        cidade: req.body.cidade
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
    res.redirect('/submissoes');
  } catch (erro) {
    console.error('Erro ao deletar usuário:', erro);
    res.status(500).send('Erro ao deletar usuário');
  }
};

// Editar perfil
exports.editarPerfil = async (req, res) => {
  try {
    if (!req.session.usuario) {
      return res.redirect('/login');
    }
    const tipoUsuario = req.session.usuario.tipo;
    const Usuario = getUsuarioModel(tipoUsuario);

    let updateData = {
      nome: req.body.nome,
      email: req.body.email,
      cidade: req.body.cidade,
      uf: req.body.uf,
      obs: req.body.obs
    };

    if (req.files && req.files['imagem']) {
      updateData.imagem = req.files['imagem'][0].buffer;
    }
    if (req.files && req.files['minicurriculo']) {
      updateData.minicurriculo = req.files['minicurriculo'][0].buffer;
    }

    await Usuario.update(updateData, { where: { id: req.session.usuario.id } });

    // Atualiza sessão 
    const usuarioAtualizado = await Usuario.findByPk(req.session.usuario.id);
    req.session.usuario = usuarioAtualizado.get({ plain: true });
    req.session.usuario.tipo = tipoUsuario;

    // Adiciona imagemBase64 para exibição no menu
    if (req.session.usuario.imagem) {
      req.session.usuario.imagemBase64 = Buffer.from(req.session.usuario.imagem).toString('base64');
    } else {
      req.session.usuario.imagemBase64 = null;
    }

    res.redirect('/perfil');
  } catch (erro) {
    console.error('Erro ao editar perfil:', erro);
    res.render('perfil', { usuario: req.session.usuario, alert: 'Erro ao atualizar perfil.' });
  }
};