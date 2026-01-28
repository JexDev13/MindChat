namespace ClinicalService.Contracts;

public record PatientProfileResponse
{
    public Guid ProfileId { get; init; }
    public Guid UserId { get; init; }
    public string? EmotionalState { get; init; }
}
