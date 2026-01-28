using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using ChatService.Services;
using ChatService.Contracts;
using System.Security.Claims;

namespace ChatService.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly IChatService _chatService;
    private readonly IMessageService _messageService;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(
        IChatService chatService, 
        IMessageService messageService,
        ILogger<ChatHub> logger)
    {
        _chatService = chatService;
        _messageService = messageService;
        _logger = logger;
    }

    /// <summary>
    /// Enviar un mensaje en tiempo real a un chat
    /// </summary>
    public async Task SendMessage(string chatId, string message)
    {
        var userId = GetUserIdFromContext();
        if (string.IsNullOrEmpty(userId))
        {
            await Clients.Caller.SendAsync("Error", "Usuario no autenticado");
            return;
        }

        if (!Guid.TryParse(chatId, out var chatGuid) || !Guid.TryParse(userId, out var userGuid))
        {
            await Clients.Caller.SendAsync("Error", "IDs inválidos");
            return;
        }

        try
        {
            // Verificar que el chat existe y no está cerrado
            var chat = await _chatService.GetByIdAsync(chatGuid);
            if (chat == null)
            {
                await Clients.Caller.SendAsync("Error", "Chat no encontrado");
                return;
            }

            if (chat.IsClosed)
            {
                await Clients.Caller.SendAsync("Error", "El chat está cerrado");
                return;
            }

            // Guardar el mensaje en la base de datos
            var savedMessage = await _messageService.SendMessageAsync(new SendMessageRequest(
                chatGuid,
                userGuid,
                message
            ));

            // Enviar el mensaje a todos los miembros del grupo del chat
            await Clients.Group($"chat-{chatId}").SendAsync("ReceiveMessage", new
            {
                savedMessage.Id,
                savedMessage.ChatId,
                savedMessage.SenderUserId,
                savedMessage.Message,
                savedMessage.SentAt
            });

            _logger.LogInformation("Mensaje enviado en chat {ChatId} por usuario {UserId}", chatId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al enviar mensaje en chat {ChatId}", chatId);
            await Clients.Caller.SendAsync("Error", "Error al enviar el mensaje");
        }
    }

    /// <summary>
    /// Unirse a un chat para recibir mensajes en tiempo real
    /// </summary>
    public async Task JoinChat(string chatId)
    {
        var userId = GetUserIdFromContext();
        if (string.IsNullOrEmpty(userId))
        {
            await Clients.Caller.SendAsync("Error", "Usuario no autenticado");
            return;
        }

        if (!Guid.TryParse(chatId, out var chatGuid))
        {
            await Clients.Caller.SendAsync("Error", "Chat ID inválido");
            return;
        }

        try
        {
            // Verificar que el chat existe
            var chat = await _chatService.GetByIdAsync(chatGuid);
            if (chat == null)
            {
                await Clients.Caller.SendAsync("Error", "Chat no encontrado");
                return;
            }

            // Agregar al grupo del chat
            await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{chatId}");

            // Notificar a otros usuarios que alguien se unió
            await Clients.OthersInGroup($"chat-{chatId}").SendAsync("UserJoined", userId);

            _logger.LogInformation("Usuario {UserId} se unió al chat {ChatId}", userId, chatId);

            // Enviar confirmación al usuario
            await Clients.Caller.SendAsync("JoinedChat", chatId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al unirse al chat {ChatId}", chatId);
            await Clients.Caller.SendAsync("Error", "Error al unirse al chat");
        }
    }

    /// <summary>
    /// Salir de un chat
    /// </summary>
    public async Task LeaveChat(string chatId)
    {
        var userId = GetUserIdFromContext();
        
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{chatId}");

            // Notificar a otros usuarios
            await Clients.OthersInGroup($"chat-{chatId}").SendAsync("UserLeft", userId);

            _logger.LogInformation("Usuario {UserId} salió del chat {ChatId}", userId, chatId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al salir del chat {ChatId}", chatId);
        }
    }

    /// <summary>
    /// Notificar que el usuario está escribiendo
    /// </summary>
    public async Task Typing(string chatId)
    {
        var userId = GetUserIdFromContext();
        if (!string.IsNullOrEmpty(userId))
        {
            await Clients.OthersInGroup($"chat-{chatId}").SendAsync("UserTyping", userId);
        }
    }

    /// <summary>
    /// Notificar que el usuario dejó de escribir
    /// </summary>
    public async Task StopTyping(string chatId)
    {
        var userId = GetUserIdFromContext();
        if (!string.IsNullOrEmpty(userId))
        {
            await Clients.OthersInGroup($"chat-{chatId}").SendAsync("UserStoppedTyping", userId);
        }
    }

    /// <summary>
    /// Cerrar un chat (solo psicólogos o administradores)
    /// </summary>
    public async Task CloseChat(string chatId)
    {
        var userId = GetUserIdFromContext();
        if (string.IsNullOrEmpty(userId) || !Guid.TryParse(chatId, out var chatGuid))
        {
            await Clients.Caller.SendAsync("Error", "Operación no autorizada");
            return;
        }

        try
        {
            var result = await _chatService.CloseAsync(chatGuid);
            if (result)
            {
                // Notificar a todos en el chat que se cerró
                await Clients.Group($"chat-{chatId}").SendAsync("ChatClosed", chatId);
                _logger.LogInformation("Chat {ChatId} cerrado por usuario {UserId}", chatId, userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al cerrar chat {ChatId}", chatId);
            await Clients.Caller.SendAsync("Error", "Error al cerrar el chat");
        }
    }

    public override async Task OnConnectedAsync()
    {
        var userId = GetUserIdFromContext();
        _logger.LogInformation("Usuario {UserId} conectado a SignalR. ConnectionId: {ConnectionId}", 
            userId, Context.ConnectionId);
        
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = GetUserIdFromContext();
        _logger.LogInformation("Usuario {UserId} desconectado de SignalR. ConnectionId: {ConnectionId}", 
            userId, Context.ConnectionId);
        
        await base.OnDisconnectedAsync(exception);
    }

    private string? GetUserIdFromContext()
    {
        // Obtener el userId desde los claims del JWT
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                  ?? Context.User?.FindFirst("sub")?.Value
                  ?? Context.User?.FindFirst("userId")?.Value;
        
        return userId;
    }
}
