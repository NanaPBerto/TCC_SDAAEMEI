exports.getHistorico = async (req, res) => {
    try {
        // Esta view agora será renderizada no cliente
        // O JavaScript no frontend vai popular os dados
        res.render('historicoA', { 
            ultimasAtividades: [] // Dados vazios, preenchidos no frontend
        });
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        res.render('historicoA', { ultimasAtividades: [], alert: 'Erro ao carregar histórico.' });
    }
};