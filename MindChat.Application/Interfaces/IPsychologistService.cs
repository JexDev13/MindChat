using MindChat.Application.DTOs.Psychologists;
using MindChat.Application.DTOs.Sessions;
using MindChat.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace MindChat.Application.Interfaces
{
    public interface IPsychologistService
    {
        Task<(bool Success, IEnumerable<string> Errors)> RegisterAsync(RegisterPsychologistDto dto);
        Task<IEnumerable<Chat>> GetChatsAsync(int userId);
        Task<IEnumerable<Appointment>> GetAppointmentsAsync(int userId);
        Task<bool> ToggleProfileVisibilityAsync(int userId);
        Task<Psychologist> GetPsychologistInfoAsync(int userId);
        Task<IEnumerable<Chat>> GetActiveChatNotificationsAsync(int userId);
        
        // Nuevos métodos para manejar solicitudes
        Task<IEnumerable<SessionRequest>> GetPendingSessionRequestsAsync(int psychologistUserId);
        Task<(bool Success, string Error)> AcceptSessionRequestAsync(int psychologistUserId, int sessionRequestId);
        Task<(bool Success, string Error)> RejectSessionRequestAsync(int psychologistUserId, int sessionRequestId);
        
        // Método para obtener información de una solicitud de sesión
        Task<SessionRequestInfoDto?> GetSessionRequestInfoAsync(int sessionRequestId);
    }
}
