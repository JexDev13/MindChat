using MindChat.Application.DTOs.Psychologists;
using MindChat.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace MindChat.Application.Interfaces
{
    public interface IPsychologistService
    {
        Task<(bool Success, IEnumerable<string> Errors)> RegisterAsync(RegisterPsychologistDto dto);

        // Devuelve chats relacionados con el usuario (asumiendo que se usa UserId para resolver Psychologist)
        Task<IEnumerable<Chat>> GetChatsAsync(int userId);

        // Devuelve citas del psicólogo identificado por userId
        Task<IEnumerable<Appointment>> GetAppointmentsAsync(int userId);
    }
}
