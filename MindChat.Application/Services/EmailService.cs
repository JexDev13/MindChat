using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using MimeKit.Text;
using MindChat.Application.Configuration;
using MindChat.Application.Interfaces;

namespace MindChat.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> options, ILogger<EmailService> logger)
        {
            _settings = options.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlMessage)
        {
            if (string.IsNullOrWhiteSpace(_settings.SenderEmail))
                throw new InvalidOperationException("El correo del remitente no está configurado.");

            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_settings.SenderName, _settings.SenderEmail));
            email.To.Add(MailboxAddress.Parse(to));
            email.Subject = subject;
            email.Body = new TextPart(TextFormat.Html) { Text = htmlMessage };

            using var smtp = new SmtpClient();

            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                smtp.ServerCertificateValidationCallback = (sender, certificate, chain, sslPolicyErrors) =>
                {
                    return true;
                };
            }

            await smtp.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_settings.SenderEmail, _settings.Password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }

}
