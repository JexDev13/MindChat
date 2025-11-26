using MindChat.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace MindChat.Application.Interfaces
{
    public interface IAuthService
    {
        Task<ApplicationUser?> FindByUsernameAsync(string username);
        Task<bool> CheckPasswordAsync(ApplicationUser user, string password);
        Task<IList<string>> GetRolesAsync(ApplicationUser user);
        Task<string?> GeneratePasswordResetTokenAsync(ApplicationUser user);
        Task<IdentityResult> ResetPasswordAsync(ApplicationUser user, string token, string newPassword);
    }
}
