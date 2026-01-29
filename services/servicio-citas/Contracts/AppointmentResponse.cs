namespace ServicioCitas.Contracts;

public record AppointmentResponse(
    Guid Id,
    Guid PsychologistId,
    Guid PatientId,
    DateTime ScheduledAt,
    string? Notes,
    bool IsCancelled
);
