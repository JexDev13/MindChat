namespace ServicioCitas.Models;

public class Appointment
{
    public Guid Id { get; set; }
    public Guid PsychologistId { get; set; }
    public Guid PatientId { get; set; }
    public DateTime ScheduledAt { get; set; }
    public string? Notes { get; set; }
    public bool IsCancelled { get; set; } = false;
}
