using Microsoft.EntityFrameworkCore;
using ChatService.Contracts;
using ChatService.Data;
using ChatService.Models;

namespace ChatService.Services;

public class MessageService : IMessageService
{
    private readonly ChatDbContext _context;
    private readonly ILogger<MessageService> _logger;

    public MessageService(ChatDbContext context, ILogger<MessageService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ChatMessageResponse> SendMessageAsync(SendMessageRequest request)
    {
        // Verificar que el chat existe y no está cerrado
        var chat = await _context.Chats.FindAsync(request.ChatId);
        if (chat == null)
            throw new InvalidOperationException("Chat not found");
        
        if (chat.IsClosed)
            throw new InvalidOperationException("Cannot send messages to a closed chat");

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ChatId = request.ChatId,
            SenderUserId = request.SenderUserId,
            Message = request.Message,
            SentAt = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Mensaje enviado: {MessageId} en chat {ChatId}", 
            message.Id, request.ChatId);

        return MapToResponse(message);
    }

    public async Task<IEnumerable<ChatMessageResponse>> GetChatMessagesAsync(Guid chatId)
    {
        var messages = await _context.ChatMessages
            .Where(m => m.ChatId == chatId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        return messages.Select(MapToResponse);
    }

    public async Task<bool> DeleteMessageAsync(Guid id)
    {
        var message = await _context.ChatMessages.FindAsync(id);
        if (message == null)
            return false;

        _context.ChatMessages.Remove(message);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Mensaje eliminado: {MessageId}", id);

        return true;
    }

    private static ChatMessageResponse MapToResponse(ChatMessage message)
    {
        return new ChatMessageResponse(
            message.Id,
            message.ChatId,
            message.SenderUserId,
            message.Message,
            message.SentAt
        );
    }
}
