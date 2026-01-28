using Microsoft.EntityFrameworkCore;
using ChatService.Contracts;
using ChatService.Data;
using ChatService.Models;

namespace ChatService.Services;

public class ChatServiceImpl : IChatService
{
    private readonly ChatDbContext _context;
    private readonly ILogger<ChatServiceImpl> _logger;

    public ChatServiceImpl(ChatDbContext context, ILogger<ChatServiceImpl> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ChatResponse?> GetByIdAsync(Guid id)
    {
        var chat = await _context.Chats
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        return chat == null ? null : MapToResponse(chat);
    }

    public async Task<ChatDetailResponse?> GetWithMessagesAsync(Guid id)
    {
        var chat = await _context.Chats
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        return chat == null ? null : MapToDetailResponse(chat);
    }

    public async Task<ChatResponse?> GetBySessionRequestIdAsync(Guid sessionRequestId)
    {
        var chat = await _context.Chats
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c => c.SessionRequestId == sessionRequestId);
        
        return chat == null ? null : MapToResponse(chat);
    }

    public async Task<ChatResponse> CreateAsync(Guid sessionRequestId)
    {
        // Verificar que la solicitud de sesión existe
        var sessionRequest = await _context.SessionRequests.FindAsync(sessionRequestId);
        if (sessionRequest == null)
            throw new InvalidOperationException("Session request not found");

        // Verificar que no exista ya un chat para esta solicitud
        var existingChat = await _context.Chats
            .FirstOrDefaultAsync(c => c.SessionRequestId == sessionRequestId);
        if (existingChat != null)
            throw new InvalidOperationException("Chat already exists for this session request");

        var chat = new Chat
        {
            Id = Guid.NewGuid(),
            SessionRequestId = sessionRequestId,
            IsClosed = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Chats.Add(chat);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Chat creado: {ChatId} para solicitud {SessionRequestId}", 
            chat.Id, sessionRequestId);

        return MapToResponse(chat);
    }

    public async Task<bool> CloseAsync(Guid id)
    {
        var chat = await _context.Chats.FindAsync(id);
        if (chat == null)
            return false;

        chat.IsClosed = true;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Chat cerrado: {ChatId}", id);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var chat = await _context.Chats.FindAsync(id);
        if (chat == null)
            return false;

        _context.Chats.Remove(chat);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Chat eliminado: {ChatId}", id);

        return true;
    }

    private static ChatResponse MapToResponse(Chat chat)
    {
        return new ChatResponse(
            chat.Id,
            chat.SessionRequestId,
            chat.IsClosed,
            chat.CreatedAt,
            chat.Messages?.Count ?? 0
        );
    }

    private static ChatDetailResponse MapToDetailResponse(Chat chat)
    {
        var messages = chat.Messages?
            .Select(m => new ChatMessageResponse(m.Id, m.ChatId, m.SenderUserId, m.Message, m.SentAt))
            .OrderBy(m => m.SentAt)
            .ToList() ?? new List<ChatMessageResponse>();

        return new ChatDetailResponse(
            chat.Id,
            chat.SessionRequestId,
            chat.IsClosed,
            chat.CreatedAt,
            messages
        );
    }
}
