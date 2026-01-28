namespace ClinicalService.Contracts;

public record UpdatePatientProfileRequest
{
    public string? EmotionalState { get; init; }
}
