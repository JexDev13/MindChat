using MindChat.Application.DTOs.Patients;
using MindChat.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MindChat.Application.Interfaces
{
    public interface IPatientService
    {
        Task<(bool Success, IEnumerable<string> Errors)> RegisterAsync(RegisterPatientDto dto);

        // Devuelve chats relacionados con el usuario (asumiendo que se usa UserId para resolver Patient)
        Task<IEnumerable<Chat>> GetChatsAsync(int userId);

        // Devuelve todos los psicólogos cuyo perfil está visible
        Task<IEnumerable<Psychologist>> GetVisiblePsychologistsAsync();
    }
}
