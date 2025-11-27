using Microsoft.AspNetCore.Identity;
using MindChat.Domain.Enums.Extensions;
using MindChat.Domain.Enums;

namespace MindChat.Infrastructure.Seed
{
    public static class IdentitySeeder
    {
        public static async Task SeedCoreAsync(RoleManager<IdentityRole<int>> roleManager)
        {
            var roles = Enum.GetValues<UserRole>();

            foreach (var role in roles)
            {
                var roleName = role.ToRoleName();

                if (!await roleManager.RoleExistsAsync(roleName))
                    await roleManager.CreateAsync(new IdentityRole<int>(roleName));
            }
        }
    }
}
