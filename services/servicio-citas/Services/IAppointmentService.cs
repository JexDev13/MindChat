using ServicioCitas.Contracts;
using ServicioCitas.Models;

namespace ServicioCitas.Services;

public interface IAppointmentService
{
    Task<AppointmentResponse?> GetByIdAsync(Guid id);
    Task<IEnumerable<AppointmentResponse>> GetAllAsync();
    Task<IEnumerable<AppointmentResponse>> GetByPsychologistIdAsync(Guid psychologistId);
    Task<IEnumerable<AppointmentResponse>> GetByPatientIdAsync(Guid patientId);
    Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest request);
    Task<AppointmentResponse?> UpdateAsync(Guid id, UpdateAppointmentRequest request);
    Task<bool> CancelAsync(Guid id);
    Task<bool> DeleteAsync(Guid id);
}
