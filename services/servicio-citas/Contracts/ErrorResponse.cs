namespace ServicioCitas.Contracts;

public record ErrorResponse(
    string Message,
    int StatusCode,
    DateTime Timestamp
);
