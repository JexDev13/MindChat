using MindChat.Application.DTOs.Patients;
using MindChat.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MindChat.Application.Interfaces
{
    public interface IPatientService
    {
        Task<(bool Success, IEnumerable<string> Errors)> RegisterAsync(RegisterPatientDto dto);
        Task<IEnumerable<Chat>> GetChatsAsync(int userId);
        Task<IEnumerable<Psychologist>> GetVisiblePsychologistsAsync();
        Task<IEnumerable<Chat>> GetActiveChatNotificationsAsync(int userId);
        
        // Nuevos métodos para solicitudes de chat
        Task<(bool Success, int SessionRequestId, string Error)> CreateChatRequestAsync(int patientUserId, int psychologistId, string initialMessage);
        
        // Método para verificar si existe un chat activo entre paciente y psicólogo
        Task<(bool Success, bool HasActiveChat, string Error)> CheckExistingChatAsync(int patientUserId, int psychologistId);
    }
}
