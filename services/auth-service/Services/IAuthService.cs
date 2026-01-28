using AuthService.Contracts;

namespace AuthService.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterPatientAsync(RegisterPatientRequest request);
    Task<AuthResponse> RegisterPsychologistAsync(RegisterPsychologistRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request, string requiredRole);
}
