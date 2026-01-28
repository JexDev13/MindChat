namespace AuthService.Contracts;

public record AuthResponse
{
    public bool Success { get; init; }
    public string? Token { get; init; }
    public string? UserId { get; init; }
    public string? Email { get; init; }
    public string? FullName { get; init; }
    public string? Role { get; init; }
    public string? ProfileId { get; init; }
    public IEnumerable<string> Errors { get; init; } = Enumerable.Empty<string>();
}
