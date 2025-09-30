document.addEventListener('DOMContentLoaded', function() {
    // Favoritar atividade
    document.querySelectorAll('.favorito').forEach(btn => {
        btn.addEventListener('click', function() {
            const atividadeId = this.dataset.id;
            const isAtivo = this.classList.contains('ativo');
            
            // Simulação de toggle
            if (isAtivo) {
                this.classList.remove('ativo');
                this.innerHTML = '<i class="bi bi-heart"></i>';
                this.title = "Adicionar aos Favoritos";
            } else {
                this.classList.add('ativo');
                this.innerHTML = '<i class="bi bi-heart-fill"></i>';
                this.title = "Remover dos Favoritos";
            }
            
            // Aqui você faria a chamada AJAX para atualizar no backend
            console.log(`Atividade ${atividadeId} ${isAtivo ? 'desfavoritada' : 'favoritada'}`);
        });
    });
    
    // Visualizar atividade
    document.querySelectorAll('.visualizar').forEach(btn => {
        btn.addEventListener('click', function() {
            const atividadeId = this.dataset.id;
            window.location.href = `/atividade/${atividadeId}`;
        });
    });
    
    // Compartilhar atividade
    document.querySelectorAll('.compartilhar').forEach(btn => {
        btn.addEventListener('click', function() {
            const atividadeId = this.dataset.id;
            // Implementar lógica de compartilhamento
            if (navigator.share) {
                navigator.share({
                    title: 'Confira esta atividade musical!',
                    url: `${window.location.origin}/atividade/${atividadeId}`
                });
            } else {
                // Fallback para copiar link
                navigator.clipboard.writeText(`${window.location.origin}/atividade/${atividadeId}`);
                alert('Link copiado para a área de transferência!');
            }
        });
    });
});