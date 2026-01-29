namespace ServicioCitas.Contracts;

public record CreateAppointmentRequest(
    Guid PsychologistId,
    Guid PatientId,
    DateTime ScheduledAt,
    string? Notes
);
