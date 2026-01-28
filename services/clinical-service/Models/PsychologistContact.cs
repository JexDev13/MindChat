namespace ClinicalService.Models;

public class PsychologistContact
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public Guid ContactPsychologistId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public Psychologist ContactPsychologist { get; set; } = null!;
}
