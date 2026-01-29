namespace ClinicalService.Contracts;

public record UpdatePsychologistProfileRequest
{
    public string? Bio { get; init; }
    public bool? IsProfileVisible { get; init; }
    public List<string>? Tags { get; init; }
}
