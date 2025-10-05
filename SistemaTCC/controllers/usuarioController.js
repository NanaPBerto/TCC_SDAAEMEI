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
        imagem: imagemPath
      };
    }

     // ⭐⭐ MODIFICAÇÃO: Criar usuário e fazer login automático ⭐⭐
    const novoUsuario = await Usuario.create(dados);
    
    // Criar sessão para o usuário
    req.session.usuario = {
      id: novoUsuario.id,
      nome: novoUsuario.nome,
      tipo: novoUsuario.tipo,
      login: novoUsuario.login,
      senha: novoUsuario.senha,
      email: novoUsuario.email,
      cidade: novoUsuario.cidade,
      uf: novoUsuario.uf,
      imagem: novoUsuario.imagem,
      cpf: novoUsuario.cpf,
      fone: novoUsuario.fone,
      ...(novoUsuario.minicurriculo && { minicurriculo: novoUsuario.minicurriculo }),
      ...(novoUsuario.obs && { obs: novoUsuario.obs })
    };

    console.log('✅ Usuário criado e logado automaticamente:', req.session.usuario);

    // Redirecionar para a página inicial já logado
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

    res.redirect('/perfil');
  } catch (erro) {
    console.error('Erro ao editar perfil:', erro);
    res.render('perfil', { 
      usuario: req.session.usuario, 
      alert: 'Erro ao atualizar perfil.' 
    });
  }
};

exports.listarPerfis = async (req, res) => {
    try {
        const { filtro, pesquisa } = req.query;
        
        let musicos = [];
        let educadores = [];

        // Buscar baseado no filtro
        if (!filtro || filtro === 'todos' || filtro === 'musico') {
            musicos = await Musico.findAll();
        }
        
        if (!filtro || filtro === 'todos' || filtro === 'educador') {
            educadores = await Educador.findAll();
        }

        let usuarios = [
            ...musicos.map(m => {
                const usuario = m.get({ plain: true });
                usuario.tipo = 'musico';
                return usuario;
            }),
            ...educadores.map(e => {
                const usuario = e.get({ plain: true });
                usuario.tipo = 'educador';
                return usuario;
            })
        ];

        // Aplicar filtro de pesquisa se existir
        if (pesquisa) {
            const termo = pesquisa.toLowerCase();
            usuarios = usuarios.filter(usuario => 
                usuario.nome.toLowerCase().includes(termo)
            );
        }

        // Aplicar filtro de tipo se especificado
        if (filtro && filtro !== 'todos') {
            usuarios = usuarios.filter(usuario => usuario.tipo === filtro);
        }

        res.render('perfis', { 
            usuarios,
            filtroAtual: filtro || 'todos',
            pesquisaAtual: pesquisa || ''
        });
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