namespace MindChat.Domain.Enums.Extensions
{
    public static class UserRoleExtensions
    {
        public static string ToRoleName(this UserRole role)
        {
            return role.ToString();
        }
    }
}
