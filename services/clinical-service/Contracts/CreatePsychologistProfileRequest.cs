using System.ComponentModel.DataAnnotations;

namespace ClinicalService.Contracts;

public record CreatePsychologistProfileRequest
{
    [Required]
    public Guid UserId { get; init; }
    
    [Required(ErrorMessage = "La licencia profesional es requerida")]
    public string ProfessionalLicense { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "La universidad es requerida")]
    public string University { get; init; } = string.Empty;
    
    [Required(ErrorMessage = "La fecha de graduación es requerida")]
    public DateTime GraduationDate { get; init; }
    
    public string? Bio { get; init; }
    
    public List<string>? Tags { get; init; }
}
