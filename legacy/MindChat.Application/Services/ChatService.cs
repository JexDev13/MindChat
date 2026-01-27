using Microsoft.EntityFrameworkCore;
using MindChat.Application.Interfaces;
using MindChat.Domain.Entities;
using MindChat.Infrastructure.Data;

namespace MindChat.Application.Services
{
    public class ChatService : IChatService
    {
        private readonly ApplicationDbContext _context;

        public ChatService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChatMessage>> GetMessagesAsync(int chatId)
        {
            return await _context.ChatMessages
                .Where(m => m.ChatId == chatId)
                .Include(m => m.Sender)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }

        public async Task<ChatMessage> SaveMessageAsync(int chatId, int senderUserId, string message)
        {
            var chatMessage = new ChatMessage
            {
                ChatId = chatId,
                SenderUserId = senderUserId,
                Message = message,
                SentAt = DateTime.UtcNow
            };

            _context.ChatMessages.Add(chatMessage);
            await _context.SaveChangesAsync();

            // Cargar el remitente para retornar el objeto completo
            return await _context.ChatMessages
                .Include(m => m.Sender)
                .FirstAsync(m => m.Id == chatMessage.Id);
        }

        public async Task<Chat?> GetChatAsync(int chatId)
        {
            return await _context.Chats
                .Include(c => c.SessionRequest)
                    .ThenInclude(sr => sr.Patient)
                        .ThenInclude(p => p.User)
                .Include(c => c.SessionRequest)
                    .ThenInclude(sr => sr.AssignedPsychologist)
                        .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(c => c.Id == chatId);
        }

        public async Task<bool> IsUserAuthorizedForChatAsync(int chatId, int userId)
        {
            var chat = await _context.Chats
                .Include(c => c.SessionRequest)
                    .ThenInclude(sr => sr.Patient)
                .Include(c => c.SessionRequest)
                    .ThenInclude(sr => sr.AssignedPsychologist)
                .FirstOrDefaultAsync(c => c.Id == chatId);

            if (chat == null) return false;

            var patientUserId = chat.SessionRequest.Patient.UserId;
            var psychologistUserId = chat.SessionRequest.AssignedPsychologist?.UserId;

            return userId == patientUserId || userId == psychologistUserId;
        }
    }
}