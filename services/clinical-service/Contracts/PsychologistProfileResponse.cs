namespace ClinicalService.Contracts;

public record PsychologistProfileResponse
{
    public Guid ProfileId { get; init; }
    public Guid UserId { get; init; }
    public string? ProfessionalLicense { get; init; }
    public string? University { get; init; }
    public DateTime? GraduationDate { get; init; }
    public string? Bio { get; init; }
    public bool IsVerified { get; init; }
    public bool IsProfileVisible { get; init; }
    public List<string> Tags { get; init; } = new();
}
