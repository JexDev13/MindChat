using ChatService.Contracts;
using ChatService.Models;

namespace ChatService.Services;

public interface ISessionRequestService
{
    Task<SessionRequestResponse?> GetByIdAsync(Guid id);
    Task<IEnumerable<SessionRequestResponse>> GetAllAsync();
    Task<IEnumerable<SessionRequestResponse>> GetByPatientIdAsync(Guid patientId);
    Task<IEnumerable<SessionRequestResponse>> GetByPsychologistIdAsync(Guid psychologistId);
    Task<IEnumerable<SessionRequestResponse>> GetPendingRequestsAsync();
    Task<SessionRequestResponse> CreateAsync(CreateSessionRequestRequest request);
    Task<SessionRequestResponse?> AssignPsychologistAsync(Guid id, Guid psychologistId);
    Task<SessionRequestResponse?> UpdateStatusAsync(Guid id, string status);
    Task<bool> DeleteAsync(Guid id);
}
