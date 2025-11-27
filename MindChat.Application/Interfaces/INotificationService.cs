namespace MindChat.Application.Interfaces
{
    public interface INotificationService
    {
        Task SendChatRequestNotificationAsync(int psychologistUserId, int sessionRequestId, string patientName, string initialMessage);
        Task SendChatRequestResponseNotificationAsync(int patientUserId, bool accepted, string psychologistName);
    }
}