using MindChat.Application.DTOs.Psychologists;


namespace MindChat.Application.Interfaces
{
    public interface IPsychologistService
    {
        Task<(bool Success, IEnumerable<string> Errors)> RegisterAsync(RegisterPsychologistDto dto);
    }
}
