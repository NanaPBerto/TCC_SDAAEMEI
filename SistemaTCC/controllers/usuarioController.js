const db = require('../db'); // Ajuste para o seu módulo de conexão com o banco

// Listar todos os usuários
exports.minhasSubmissoes = async (req, res) => {
    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios');
        res.render('usuarios', { usuarios });
    } catch (err) {
        res.status(500).send('Erro ao buscar usuários');
    }
};

// Exibir formulário para novo usuário
exports.novoUsuario = (req, res) => {
    res.render('formularioUsuario');
};

// Adicionar novo usuário
exports.add = async (req, res) => {
    const { nome, email, nivel_acesso } = req.body;
    try {
        await db.query('INSERT INTO usuarios (nome, email, nivel_acesso) VALUES (?, ?, ?)', [nome, email, nivel_acesso]);
        res.redirect('/usuarios');
    } catch (err) {
        res.status(500).send('Erro ao adicionar usuário');
    }
};

// Exibir formulário de edição
exports.editar = async (req, res) => {
    const { cod } = req.params;
    try {
        const [usuarios] = await db.query('SELECT * FROM usuarios WHERE cod = ?', [cod]);
        if (usuarios.length === 0) return res.status(404).send('Usuário não encontrado');
        res.render('formularioUsuario', { usuario: usuarios[0] });
    } catch (err) {
        res.status(500).send('Erro ao buscar usuário');
    }
};

// Atualizar usuário
exports.atualizar = async (req, res) => {
    const { cod } = req.params;
    const { nome, email, nivel_acesso } = req.body;
    try {
        await db.query('UPDATE usuarios SET nome = ?, email = ?, nivel_acesso = ? WHERE cod = ?', [nome, email, nivel_acesso, cod]);
        res.redirect('/usuarios');
    } catch (err) {
        res.status(500).send('Erro ao atualizar usuário');
    }
};

// Deletar usuário
exports.deletar = async (req, res) => {
    const { cod } = req.params;
    try {
        await db.query('DELETE FROM usuarios WHERE cod = ?', [cod]);
        res.redirect('/usuarios');
    } catch (err) {
        res.status(500).send('Erro ao deletar usuário');
    }
};

// Aqui você pode adicionar funções de autenticação/autorização futuramente