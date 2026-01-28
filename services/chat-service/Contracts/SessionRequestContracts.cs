namespace ChatService.Contracts;

// Session Request DTOs
public record CreateSessionRequestRequest(
    Guid PatientId,
    string InitialMessage
);

public record AssignPsychologistRequest(
    Guid PsychologistId
);

public record UpdateSessionStatusRequest(
    string Status  // Pending, Accepted, Rejected
);

public record SessionRequestResponse(
    Guid Id,
    Guid PatientId,
    Guid? AssignedPsychologistId,
    string Status,
    string? InitialMessage,
    DateTime CreatedAt,
    Guid? ChatId
);
