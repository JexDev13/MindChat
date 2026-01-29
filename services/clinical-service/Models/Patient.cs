namespace ClinicalService.Models;

public class Patient
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? EmotionalState { get; set; }
}
