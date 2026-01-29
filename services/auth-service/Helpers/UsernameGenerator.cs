namespace AuthService.Helpers;

public static class UsernameGenerator
{
    public static string Generate(string firstName, string lastName)
    {
        var firstPart = firstName.ToLower().Trim();
        var lastPart = lastName.ToLower().Trim();
        var randomNumber = Random.Shared.Next(100, 9999);
        
        return $"{firstPart}.{lastPart}{randomNumber}";
    }
}
