using MindChat.Domain.Entities;

namespace MindChat.Application.Interfaces
{
    public interface IChatService
    {
        Task<IEnumerable<ChatMessage>> GetMessagesAsync(int chatId);
        Task<ChatMessage> SaveMessageAsync(int chatId, int senderUserId, string message);
        Task<Chat?> GetChatAsync(int chatId);
        Task<bool> IsUserAuthorizedForChatAsync(int chatId, int userId);
    }
}