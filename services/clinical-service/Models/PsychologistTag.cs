namespace ClinicalService.Models;

public class PsychologistTag
{
    public Guid PsychologistId { get; set; }
    public Psychologist Psychologist { get; set; } = null!;
    
    public Guid TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}
