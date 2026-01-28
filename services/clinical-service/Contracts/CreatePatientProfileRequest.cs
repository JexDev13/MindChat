using System.ComponentModel.DataAnnotations;

namespace ClinicalService.Contracts;

public record CreatePatientProfileRequest
{
    [Required]
    public Guid UserId { get; init; }
    
    public string? EmotionalState { get; init; }
}
