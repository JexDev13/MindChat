namespace ChatService.Contracts;

public record ErrorResponse(
    string Message,
    int StatusCode,
    DateTime Timestamp
);
