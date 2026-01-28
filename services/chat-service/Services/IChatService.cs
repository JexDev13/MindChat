using ChatService.Contracts;

namespace ChatService.Services;

public interface IChatService
{
    Task<ChatResponse?> GetByIdAsync(Guid id);
    Task<ChatDetailResponse?> GetWithMessagesAsync(Guid id);
    Task<ChatResponse?> GetBySessionRequestIdAsync(Guid sessionRequestId);
    Task<ChatResponse> CreateAsync(Guid sessionRequestId);
    Task<bool> CloseAsync(Guid id);
    Task<bool> DeleteAsync(Guid id);
}

public interface IMessageService
{
    Task<ChatMessageResponse> SendMessageAsync(SendMessageRequest request);
    Task<IEnumerable<ChatMessageResponse>> GetChatMessagesAsync(Guid chatId);
    Task<bool> DeleteMessageAsync(Guid id);
}
