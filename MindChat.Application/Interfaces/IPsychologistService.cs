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
        
        // Método para crear citas desde chat
        Task<(bool Success, string Error)> CreateAppointmentFromChatAsync(int psychologistUserId, int chatId, DateTime scheduledAt, string notes);
        
        // Nuevos métodos para gestión de citas
        Task<IEnumerable<Appointment>> SearchAppointmentsAsync(int psychologistUserId, string? patientName = null, DateTime? fromDate = null, DateTime? toDate = null);
        Task<(bool Success, string Error)> UpdateAppointmentAsync(int psychologistUserId, int appointmentId, DateTime scheduledAt, string notes);
        Task<(bool Success, string Error)> DeleteAppointmentAsync(int psychologistUserId, int appointmentId);
        Task<Appointment?> GetAppointmentAsync(int psychologistUserId, int appointmentId);
    }
}
