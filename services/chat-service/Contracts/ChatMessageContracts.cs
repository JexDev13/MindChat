namespace ChatService.Contracts;

// Chat Message DTOs
public record SendMessageRequest(
    Guid ChatId,
    Guid SenderUserId,
    string Message
);

public record ChatMessageResponse(
    Guid Id,
    Guid ChatId,
    Guid SenderUserId,
    string Message,
    DateTime SentAt
);
