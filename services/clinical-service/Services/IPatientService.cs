using ClinicalService.Contracts;

namespace ClinicalService.Services;

public interface IPatientService
{
    Task<PatientProfileResponse?> CreateProfileAsync(CreatePatientProfileRequest request);
    Task<PatientProfileResponse?> GetProfileByUserIdAsync(Guid userId);
    Task<PatientProfileResponse?> GetProfileByIdAsync(Guid profileId);
    Task<bool> UpdateProfileAsync(Guid userId, UpdatePatientProfileRequest request);
    Task<bool> DeleteProfileAsync(Guid userId);
}
