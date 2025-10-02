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
    let imagemPath = null;
    let minicurriculoPath = null;

    // ⭐⭐ CORREÇÃO: Salvar apenas caminhos dos arquivos ⭐⭐
    if (req.files) {
      if (req.files['imagem']) {
        imagemPath = `/uploads/${req.files['imagem'][0].filename}`;
      }
      if (req.files['minicurriculo']) {
        minicurriculoPath = `/uploads/${req.files['minicurriculo'][0].filename}`;
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
        // ⭐⭐ APENAS CAMINHOS - NÃO SALVAR BUFFERS ⭐⭐
        imagem: imagemPath,
        minicurriculo: minicurriculoPath,
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
        uf: req.body.uf,
        // ⭐⭐ Educador também pode ter imagem ⭐⭐
        imagem: imagemPath
      };
    }

    await Usuario.create(dados);
    res.redirect('/');
  } catch (erro) {
    console.error('Erro detalhado:', erro);
    res.render('cadastro' + (tipoUsuario === 'musico' ? 'M' : 'E'), { 
      alert: 'Houve um erro: ' + erro.message,
      formData: req.body 
    });
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

    // ⭐⭐ CORREÇÃO: Salvar apenas caminhos dos arquivos ⭐⭐
    if (req.files && req.files['imagem']) {
      updateData.imagem = `/uploads/${req.files['imagem'][0].filename}`;
    }
    if (req.files && req.files['minicurriculo']) {
      updateData.minicurriculo = `/uploads/${req.files['minicurriculo'][0].filename}`;
    }

    await Usuario.update(updateData, { where: { id: req.session.usuario.id } });

    // Atualiza sessão 
    const usuarioAtualizado = await Usuario.findByPk(req.session.usuario.id);
    req.session.usuario = usuarioAtualizado.get({ plain: true });
    req.session.usuario.tipo = tipoUsuario;

    // ⭐⭐ REMOVER conversão para Base64 - usar URL direta ⭐⭐
    // Não precisa mais de imagemBase64, a view vai usar a URL diretamente

    res.redirect('/perfil');
  } catch (erro) {
    console.error('Erro ao editar perfil:', erro);
    res.render('perfil', { 
      usuario: req.session.usuario, 
      alert: 'Erro ao atualizar perfil.' 
    });
  }
};

// Listar perfis
exports.listarPerfis = async (req, res) => {
  try {
    const musicos = await Musico.findAll();
    const educadores = await Educador.findAll();
    
const usuarios = [
  ...musicos.map(m => {
    const usuario = m.get({ plain: true });
    usuario.tipo = 'musico';
    // ⭐⭐ REMOVER conversão para Base64 - usar URL direta ⭐⭐
    // usuario.imagem já contém o caminho '/uploads/nome-do-arquivo.jpg'
    return usuario;
  }),
  ...educadores.map(e => {
    const usuario = e.get({ plain: true });
    usuario.tipo = 'educador';
    // ⭐⭐ REMOVER conversão para Base64 - usar URL direta ⭐⭐
    return usuario;
  })
];

    res.render('perfis', { usuarios });
  } catch (erro) {
    console.error('Erro ao listar perfis:', erro);
    res.status(500).send('Erro ao listar perfis');
  }
};
// Ver perfil específico
exports.verPerfil = async (req, res) => {
  try {
    let usuario = await Musico.findByPk(req.params.id);
    let tipo = 'musico';
    
    if (!usuario) {
      usuario = await Educador.findByPk(req.params.id);
      tipo = 'educador';
    }
    
    if (!usuario) {
      return res.status(404).send('Usuário não encontrado');
    }

    // Converter para objeto simples e adicionar tipo
    const usuarioData = usuario.get({ plain: true });
    usuarioData.tipo = tipo;
    
    // Verificar se é o próprio perfil
    const isOwnProfile = req.session.usuario && req.session.usuario.id == req.params.id;

    res.render('perfil', { 
      usuario: usuarioData, 
      isOwnProfile: isOwnProfile,
      session: req.session // Passar sessão para a view
    });
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro);
    res.status(500).send('Erro ao buscar perfil');
  }
};