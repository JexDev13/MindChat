using System.Net.Http.Json;
using AuthService.Contracts;

namespace AuthService.Services;

public interface IClinicalServiceClient
{
    Task<Guid?> CreatePatientProfileAsync(Guid userId);
    Task<Guid?> CreatePsychologistProfileAsync(Guid userId, string professionalLicense, string university, DateTime graduationDate);
}

public class ClinicalServiceClient : IClinicalServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ClinicalServiceClient> _logger;

    public ClinicalServiceClient(HttpClient httpClient, ILogger<ClinicalServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<Guid?> CreatePatientProfileAsync(Guid userId)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/api/patients", new { UserId = userId });
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to create patient profile. Status: {Status}", response.StatusCode);
                return null;
            }

            var result = await response.Content.ReadFromJsonAsync<ProfileCreatedResponse>();
            return result?.ProfileId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating patient profile for user {UserId}", userId);
            return null;
        }
    }

    public async Task<Guid?> CreatePsychologistProfileAsync(Guid userId, string professionalLicense, string university, DateTime graduationDate)
    {
        try
        {
            var response = await _httpClient.PostAsJsonAsync("/api/psychologists", new
            {
                UserId = userId,
                ProfessionalLicense = professionalLicense,
                University = university,
                GraduationDate = graduationDate
            });

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to create psychologist profile. Status: {Status}", response.StatusCode);
                return null;
            }

            var result = await response.Content.ReadFromJsonAsync<ProfileCreatedResponse>();
            return result?.ProfileId;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating psychologist profile for user {UserId}", userId);
            return null;
        }
    }

    private record ProfileCreatedResponse(Guid ProfileId);
}
