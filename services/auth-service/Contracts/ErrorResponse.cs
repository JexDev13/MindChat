namespace AuthService.Contracts;

public record ErrorResponse
{
    public bool Success => false;
    public IEnumerable<string> Errors { get; init; } = Enumerable.Empty<string>();
}
