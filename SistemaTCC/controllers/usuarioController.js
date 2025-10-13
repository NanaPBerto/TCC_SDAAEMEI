const express = require('express');
const Musico = require('../models/musico');
const Educador = require('../models/educador');
const ativ = require('../models/ativ');
const Tipoatividade = require('../models/tipoatividade');
const { usuarioUpload } = require('../middleware/uploadFile');

function getUsuarioModel(tipo) {
  if (tipo === 'M' || tipo === 'musico') return Musico;
  if (tipo === 'E' || tipo === 'educador') return Educador;
  throw new Error('Tipo de usuário inválido');
}
 
// Adicionar usuario - ATUALIZADO
exports.add = async (req, res) => {
  try {
    let imagemPath = null;
    let minicurriculoPath = null;

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

    // ⭐⭐ NOVO: Verificar se login ou email já existem ⭐⭐
    const loginExistente = await Usuario.findOne({ where: { login: req.body.usuario } });
    if (loginExistente) {
      throw new Error('Este nome de usuário já está em uso. Por favor, escolha outro.');
    }

    const emailExistente = await Usuario.findOne({ where: { email: req.body.email } });
    if (emailExistente) {
      throw new Error('Este email já está cadastrado. Por favor, use outro email ou faça login.');
    }

    // Verificar também no outro modelo (caso o usuário tente cadastrar com email/login de outro tipo)
    const OutroModelo = tipoUsuario === 'musico' ? Educador : Musico;
    const loginExistenteOutroModelo = await OutroModelo.findOne({ where: { login: req.body.usuario } });
    if (loginExistenteOutroModelo) {
      throw new Error('Este nome de usuário já está em uso. Por favor, escolha outro.');
    }

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
        cidade: req.body.cidade,
        validado: false // ⭐⭐ MÚSICOS NOVOS COMEÇAM NÃO VALIDADOS ⭐⭐
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

    const novoUsuario = await Usuario.create(dados);
    
    // ⭐⭐ MODIFICAÇÃO: SÓ FAZ LOGIN AUTOMÁTICO SE NÃO FOR MÚSICO OU SE FOR VALIDADO ⭐⭐
    if (Usuario !== Musico || novoUsuario.validado) {
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
        validado: novoUsuario.validado,
        ...(novoUsuario.minicurriculo && { minicurriculo: novoUsuario.minicurriculo }),
        ...(novoUsuario.obs && { obs: novoUsuario.obs })
      };

      console.log('✅ Usuário criado e logado automaticamente:', req.session.usuario);
      res.redirect('/');
    } else {
      // ⭐⭐ MÚSICO NÃO VALIDADO: MOSTRA MENSAGEM E REDIRECIONA PARA LOGIN ⭐⭐
      console.log('⚠️ Músico criado mas aguardando validação:', novoUsuario.nome);
      req.session.alertMessage = 'Cadastro realizado! Sua conta está aguardando validação do administrador.';
      res.redirect('/login');
    }

  } catch (erro) {
    console.error('Erro detalhado:', erro);
    
    // ⭐⭐ MELHORIA: Recuperar dados do formulário para manter preenchido ⭐⭐
    const formData = {
      nome: req.body.nome,
      usuario: req.body.usuario,
      email: req.body.email,
      telefone: req.body.telefone,
      cpf: req.body.cpf,
      uf: req.body.uf,
      cidade: req.body.cidade,
      obs: req.body.obs
    };
    const tipoUsuario = req.body.tipo
    const template = tipoUsuario === 'musico' ? 'cadastroM' : 'cadastroE';
    
    res.render(template, { 
      alert: 'Houve um erro: ' + erro.message,
      formData: formData 
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

        console.log(`📋 Listando perfis - Filtro: ${filtro}, Pesquisa: ${pesquisa}`);

        // Buscar baseado no filtro
        if (!filtro || filtro === 'todos' || filtro === 'musico') {
            musicos = await Musico.findAll({
                attributes: ['id', 'nome', 'email', 'cidade', 'uf', 'fone', 'imagem', 'tipo', 'validado']
            });
            console.log(`🎵 Encontrados ${musicos.length} músicos`);
        }
        
        if (!filtro || filtro === 'todos' || filtro === 'educador') {
            educadores = await Educador.findAll({
                attributes: ['id', 'nome', 'cidade', 'uf','imagem', 'tipo']
            });
            console.log(`👨‍🏫 Encontrados ${educadores.length} educadores`);
        }

        let usuarios = [
            ...musicos.map(m => {
                const usuario = m.get({ plain: true });
                usuario.tipo = 'musico';
                usuario.validado = m.validado; // Mantém info de validação
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
            console.log(`🔍 Após pesquisa: ${usuarios.length} usuários`);
        }

        // Aplicar filtro de tipo se especificado
        if (filtro && filtro !== 'todos') {
            usuarios = usuarios.filter(usuario => usuario.tipo === filtro);
            console.log(`🎯 Após filtro de tipo: ${usuarios.length} usuários`);
        }

        console.log(`📊 Total de usuários para exibir: ${usuarios.length}`);

        res.render('perfis', { 
            usuarios,
            filtroAtual: filtro || 'todos',
            pesquisaAtual: pesquisa || ''
        });
    } catch (erro) {
        console.error('❌ Erro ao listar perfis:', erro);
        res.status(500).send('Erro ao listar perfis');
    }
};
// Ver perfil específico de Músico
exports.verPerfilMusico = async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const usuarioLogadoId = req.session.usuario?.id;

    console.log(`🔍 Buscando perfil de MÚSICO ID: ${usuarioId}`);
    console.log(`👤 Usuário logado: ${usuarioLogadoId}`);

    const usuarioVisitado = await Musico.findByPk(usuarioId, {
      include: [
        {
          model: ativ,
          as: 'atividades',
          include: [{
            model: Tipoatividade,
            as: 'tipos',
            through: { attributes: [] }
          }]
        }
      ]
    });

    if (!usuarioVisitado) {
      console.log('❌ Músico não encontrado');
      return res.status(404).send('Músico não encontrado');
    }

    const isOwnProfile = usuarioId === usuarioLogadoId;
    const usuarioData = usuarioVisitado.toJSON();
    usuarioData.tipo = 'musico';

    console.log(`✅ Músico encontrado: ${usuarioData.nome}`);
    console.log(`📊 É próprio perfil? ${isOwnProfile}`);

    res.render('perfil', {
      usuarioVisitado: usuarioData, // Mude para usuarioVisitado
      isOwnProfile
    });

  } catch (error) {
    console.error('❌ Erro ao carregar perfil do músico:', error);
    res.status(500).send('Erro interno do servidor');
  }
};

// Ver perfil específico de Educador
exports.verPerfilEducador = async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const usuarioLogadoId = req.session.usuario?.id;

    console.log(`🔍 Buscando perfil de EDUCADOR ID: ${usuarioId}`);
    console.log(`👤 Usuário logado: ${usuarioLogadoId}`);

    const usuarioVisitado = await Educador.findByPk(usuarioId);

    if (!usuarioVisitado) {
      console.log('❌ Educador não encontrado');
      return res.status(404).send('Educador não encontrado');
    }

    const isOwnProfile = usuarioId === usuarioLogadoId;
    const usuarioData = usuarioVisitado.toJSON();
    usuarioData.tipo = 'educador';

    console.log(`✅ Educador encontrado: ${usuarioData.nome}`);
    console.log(`📊 É próprio perfil? ${isOwnProfile}`);

    res.render('perfil', {
      usuarioVisitado: usuarioData, // Mude para usuarioVisitado
      isOwnProfile
    });

  } catch (error) {
    console.error('❌ Erro ao carregar perfil do educador:', error);
    res.status(500).send('Erro interno do servidor');
  }
};