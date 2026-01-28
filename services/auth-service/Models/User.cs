using Microsoft.AspNetCore.Identity;

namespace AuthService.Models;

public class User : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public string? ProfilePictureUrl { get; set; }
}
