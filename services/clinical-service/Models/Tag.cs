namespace ClinicalService.Models;

public class Tag
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    
    // Navigation properties
    public ICollection<PsychologistTag> PsychologistTags { get; set; } = new List<PsychologistTag>();
}
