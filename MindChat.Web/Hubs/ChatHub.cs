using Microsoft.AspNetCore.SignalR;
using MindChat.Application.Interfaces;
using MindChat.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

namespace MindChat.Web.Hubs
{
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly ApplicationDbContext _context;

        public ChatHub(IChatService chatService, ApplicationDbContext context)
        {
            _chatService = chatService;
            _context = context;
        }

        public async Task SendMessage(int chatId, string message, string sender)
        {
            // Obtener el UserId del contexto de la conexión
            var userId = GetUserIdFromContext();
            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "Usuario no autenticado");
                return;
            }

            // Verificar si el usuario está autorizado para este chat
            if (!await _chatService.IsUserAuthorizedForChatAsync(chatId, userId.Value))
            {
                await Clients.Caller.SendAsync("Error", "No autorizado para este chat");
                return;
            }

            try
            {
                // Guardar el mensaje en la base de datos
                var savedMessage = await _chatService.SaveMessageAsync(chatId, userId.Value, message);
                
                // Enviar el mensaje a todos los miembros del grupo
                await Clients.Group($"chat-{chatId}").SendAsync("ReceiveMessage", chatId, message, sender, savedMessage.SentAt.ToString("HH:mm"));
            }
            catch (Exception ex)
            {
                await Clients.Caller.SendAsync("Error", "Error al enviar el mensaje");
            }
        }

        public async Task JoinChat(int chatId)
        {
            var userId = GetUserIdFromContext();
            if (!userId.HasValue)
            {
                await Clients.Caller.SendAsync("Error", "Usuario no autenticado");
                return;
            }

            // Verificar autorización
            if (!await _chatService.IsUserAuthorizedForChatAsync(chatId, userId.Value))
            {
                await Clients.Caller.SendAsync("Error", "No autorizado para este chat");
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, $"chat-{chatId}");

            // Cargar y enviar mensajes históricos
            var messages = await _chatService.GetMessagesAsync(chatId);
            foreach (var msg in messages)
            {
                await Clients.Caller.SendAsync("ReceiveMessage", chatId, msg.Message, msg.Sender.FullName, msg.SentAt.ToString("HH:mm"));
            }
        }

        public async Task LeaveChat(int chatId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"chat-{chatId}");
        }

        private int? GetUserIdFromContext()
        {
            // Obtener el token JWT desde las cookies o headers
            var httpContext = Context.GetHttpContext();
            var token = httpContext?.Session.GetString("JWT");
            
            if (string.IsNullOrEmpty(token))
                return null;

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                var userIdClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                
                if (int.TryParse(userIdClaim, out var userId))
                    return userId;
            }
            catch
            {
                return null;
            }

            return null;
        }
    }
}
