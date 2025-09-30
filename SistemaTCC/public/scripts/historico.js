document.addEventListener('DOMContentLoaded', function() {
    // Inicializar círculos de progresso
    document.querySelectorAll('.progresso-circle').forEach(circle => {
        const progresso = circle.dataset.progresso;
        circle.style.setProperty('--progresso', `${progresso}%`);
    });
    
    // Marcar atividades muito recentes
    document.querySelectorAll('.atividade-mini-card').forEach(card => {
        const dataAcesso = card.querySelector('.bi-calendar').parentElement.textContent;
        if (ehMuitoRecente(dataAcesso)) {
            card.classList.add('recente');
        }
    });
    
    // Continuar atividade
    document.querySelectorAll('.continuar').forEach(btn => {
        btn.addEventListener('click', function() {
            const atividadeId = this.dataset.id;
            window.location.href = `/atividade/${atividadeId}?continuar=true`;
        });
    });
    
    // Refazer atividade
    document.querySelectorAll('.refazer').forEach(btn => {
        btn.addEventListener('click', function() {
            const atividadeId = this.dataset.id;
            if (confirm('Deseja reiniciar esta atividade? Seu progresso atual será perdido.')) {
                window.location.href = `/atividade/${atividadeId}?refazer=true`;
            }
        });
    });
    
    // Ver detalhes
    document.querySelectorAll('.detalhes').forEach(btn => {
        btn.addEventListener('click', function() {
            const atividadeId = this.dataset.id;
            window.location.href = `/atividade/${atividadeId}?detalhes=true`;
        });
    });
    
    function ehMuitoRecente(dataTexto) {
        // Lógica para verificar se a atividade foi acessada nas últimas 24h
        const hoje = new Date();
        const dataAcesso = new Date(dataTexto);
        const diferenca = hoje - dataAcesso;
        const horas = diferenca / (1000 * 60 * 60);
        return horas < 24;
    }
});

// Helper para formatar data (deve ser registrado no Handlebars)
function formatarData(data) {
    if (!data) return '';
    
    const dataObj = new Date(data);
    const agora = new Date();
    const diferenca = agora - dataObj;
    const minutos = Math.floor(diferenca / (1000 * 60));
    const horas = Math.floor(diferenca / (1000 * 60 * 60));
    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    
    if (minutos < 1) return 'Agora mesmo';
    if (minutos < 60) return `${minutos} min atrás`;
    if (horas < 24) return `${horas} h atrás`;
    if (dias === 1) return 'Ontem';
    if (dias < 7) return `${dias} dias atrás`;
    
    return dataObj.toLocaleDateString('pt-BR');
}