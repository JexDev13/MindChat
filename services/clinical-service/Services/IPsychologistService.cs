using ClinicalService.Contracts;

namespace ClinicalService.Services;

public interface IPsychologistService
{
    Task<PsychologistProfileResponse?> CreateProfileAsync(CreatePsychologistProfileRequest request);
    Task<PsychologistProfileResponse?> GetProfileByUserIdAsync(Guid userId);
    Task<PsychologistProfileResponse?> GetProfileByIdAsync(Guid profileId);
    Task<List<PsychologistProfileResponse>> GetAllVisibleProfilesAsync();
    Task<List<PsychologistProfileResponse>> SearchByTagsAsync(List<string> tags);
    Task<bool> UpdateProfileAsync(Guid userId, UpdatePsychologistProfileRequest request);
    Task<bool> DeleteProfileAsync(Guid userId);
}
