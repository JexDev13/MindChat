namespace ChatService.Models;

public class Chat
{
    public Guid Id { get; set; }
    public Guid SessionRequestId { get; set; }
    public bool IsClosed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public SessionRequest SessionRequest { get; set; } = null!;
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}
