// services/emailService.js
const transporter = require('../config/emailConfig');

class EmailService {
    // Enviar notificação de conta validada
    static async enviarNotificacaoValidacao(usuario) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'musicoteca@seusite.com',
                to: usuario.email,
                subject: '🎵 Sua conta na Musicoteca foi validada!',
                html: this.templateEmailValidacao(usuario)
            };

            const result = await transporter.sendMail(mailOptions);
            console.log(`✅ Email de validação enviado para: ${usuario.email}`);
            return result;
        } catch (error) {
            console.error('❌ Erro ao enviar email de validação:', error);
            throw error;
        }
    }

    // Enviar notificação de conta desvalidada
    static async enviarNotificacaoDesvalidacao(usuario) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'musicoteca@gmail.com',
                to: usuario.email,
                subject: '⚠️ Status da sua conta na Musicoteca foi alterado',
                html: this.templateEmailDesvalidacao(usuario)
            };

            const result = await transporter.sendMail(mailOptions);
            console.log(`✅ Email de desvalidação enviado para: ${usuario.email}`);
            return result;
        } catch (error) {
            console.error('❌ Erro ao enviar email de desvalidação:', error);
            throw error;
        }
    }

    // Template para email de validação
    static templateEmailValidacao(usuario) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎵 Musicoteca</h1>
                    <h2>Conta Validada com Sucesso!</h2>
                </div>
                <div class="content">
                    <p>Olá, <strong>${usuario.nome}</strong>!</p>
                    
                    <p>É com grande satisfação que informamos que sua conta de <strong>professor de música</strong> na Musicoteca foi <strong>validada e aprovada</strong> pelo nosso time administrativo.</p>
                    
                    <p>📋 <strong>Seus dados de acesso:</strong></p>
                    <ul>
                        <li><strong>Login:</strong> ${usuario.login}</li>
                        <li><strong>Nome:</strong> ${usuario.nome}</li>
                        <li><strong>Email:</strong> ${usuario.email}</li>
                    </ul>
                    
                    <p>🎉 <strong>O que você pode fazer agora:</strong></p>
                    <ul>
                        <li>Acessar o Painel do Músico</li>
                        <li>Criar e compartilhar atividades musicais</li>
                        <li>Gerenciar suas submissões</li>
                        <li>Interagir com outros músicos e educadores</li>
                    </ul>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" class="button">
                            Acessar Minha Conta
                        </a>
                    </div>
                    
                    <p>Se você tiver alguma dúvida ou precisar de ajuda, não hesite em entrar em contato conosco.</p>
                    
                    <p>Atenciosamente,<br>
                    <strong>Equipe Musicoteca</strong></p>
                </div>
                <div class="footer">
                    <p>Este é um email automático, por favor não responda.</p>
                    <p>© ${new Date().getFullYear()} Musicoteca. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Template para email de desvalidação
    static templateEmailDesvalidacao(usuario) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎵 Musicoteca</h1>
                    <h2>Alteração no Status da Sua Conta</h2>
                </div>
                <div class="content">
                    <p>Olá, <strong>${usuario.nome}</strong>!</p>
                    
                    <p>Informamos que o status da sua conta de <strong>professor de música</strong> na Musicoteca foi alterado.</p>
                    
                    <p>⚠️ <strong>Sua conta está temporariamente desativada para revisão.</strong></p>
                    
                    <p>📋 <strong>Detalhes:</strong></p>
                    <ul>
                        <li><strong>Nome:</strong> ${usuario.nome}</li>
                        <li><strong>Email:</strong> ${usuario.email}</li>
                        <li><strong>Status atual:</strong> Aguardando revalidação</li>
                    </ul>
                    
                    <p>🔍 <strong>O que aconteceu?</strong></p>
                    <p>Nossa equipe administrativa identificou a necessidade de revisão adicional do seu cadastro. Isso pode ocorrer por diversos motivos, como necessidade de informações complementares ou verificação de dados.</p>
                    
                    <p>📞 <strong>Próximos passos:</strong></p>
                    <ul>
                        <li>Entre em contato conosco para entender os detalhes</li>
                        <li>Envie informações adicionais se necessário</li>
                        <li>Aguarde o reprocessamento do seu cadastro</li>
                    </ul>
                    
                    <p>Pedimos desculpas por qualquer inconveniente e estamos à disposição para esclarecer qualquer dúvida.</p>
                    
                    <p>Atenciosamente,<br>
                    <strong>Equipe Musicoteca</strong></p>
                </div>
                <div class="footer">
                    <p>Este é um email automático, por favor não responda.</p>
                    <p>© ${new Date().getFullYear()} Musicoteca. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = EmailService;