namespace ServicioCitas.Contracts;

public record UpdateAppointmentRequest(
    DateTime? ScheduledAt,
    string? Notes
);
