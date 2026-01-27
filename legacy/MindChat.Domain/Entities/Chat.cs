using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Domain.Entities
{
    public class Chat
    {
        public int Id { get; set; }
        public int SessionRequestId { get; set; }
        public SessionRequest SessionRequest { get; set; }

        public ICollection<ChatMessage> Messages { get; set; }
        public bool IsClosed { get; set; } = false;
    }

    public class ChatMessage
    {
        public int Id { get; set; }
        public int ChatId { get; set; }
        public Chat Chat { get; set; }

        public int SenderUserId { get; set; }
        public ApplicationUser Sender { get; set; }

        public string Message { get; set; }
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
