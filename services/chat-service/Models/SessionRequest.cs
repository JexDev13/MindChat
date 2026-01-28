namespace ChatService.Models;

public class SessionRequest
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public Guid? AssignedPsychologistId { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Accepted, Rejected
    public string? InitialMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Chat? Chat { get; set; }
}
