namespace ClinicalService.Models;

public class Psychologist
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? ProfessionalLicense { get; set; }
    public string? University { get; set; }
    public DateTime? GraduationDate { get; set; }
    public string? Bio { get; set; }
    public bool IsVerified { get; set; }
    public bool IsProfileVisible { get; set; } = true;
    
    // Navigation properties
    public ICollection<PsychologistTag> PsychologistTags { get; set; } = new List<PsychologistTag>();
}
