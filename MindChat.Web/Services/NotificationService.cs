using Microsoft.AspNetCore.SignalR;
using MindChat.Application.Interfaces;
using MindChat.Web.Hubs;

namespace MindChat.Web.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _notificationHub;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IHubContext<NotificationHub> notificationHub, ILogger<NotificationService> logger)
        {
            _notificationHub = notificationHub;
            _logger = logger;
        }

        public async Task SendChatRequestNotificationAsync(int psychologistUserId, int sessionRequestId, string patientName, string initialMessage)
        {
            try
            {
                await _notificationHub.Clients.Group($"user_{psychologistUserId}")
                    .SendAsync("ReceiveChatRequest", new
                    {
                        SessionRequestId = sessionRequestId,
                        PatientName = patientName,
                        InitialMessage = initialMessage,
                        Timestamp = DateTime.UtcNow
                    });

                _logger.LogInformation($"Chat request notification sent to psychologist {psychologistUserId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send chat request notification to psychologist {psychologistUserId}");
            }
        }

        public async Task SendChatRequestResponseNotificationAsync(int patientUserId, bool accepted, string psychologistName)
        {
            try
            {
                await _notificationHub.Clients.Group($"user_{patientUserId}")
                    .SendAsync("ReceiveChatRequestResponse", new
                    {
                        Accepted = accepted,
                        PsychologistName = psychologistName,
                        Timestamp = DateTime.UtcNow
                    });

                _logger.LogInformation($"Chat request response notification sent to patient {patientUserId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send chat request response notification to patient {patientUserId}");
            }
        }
    }
}