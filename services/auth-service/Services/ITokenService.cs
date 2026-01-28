using AuthService.Contracts;

namespace AuthService.Services;

public interface ITokenService
{
    string GenerateToken(Guid userId, string email, string fullName, string role, Guid? profileId = null);
}
