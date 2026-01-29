namespace ChatService.Contracts;

// Chat DTOs
public record CreateChatRequest(
    Guid SessionRequestId
);

public record ChatResponse(
    Guid Id,
    Guid SessionRequestId,
    bool IsClosed,
    DateTime CreatedAt,
    int MessageCount
);

public record ChatDetailResponse(
    Guid Id,
    Guid SessionRequestId,
    bool IsClosed,
    DateTime CreatedAt,
    List<ChatMessageResponse> Messages
);
