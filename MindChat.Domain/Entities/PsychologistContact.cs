using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Domain.Entities
{
    public class PsychologistContact
    {
        public int Id { get; set; }
        public int OwnerId { get; set; }
        public Psychologist Owner { get; set; }
        public int ContactPsychologistId { get; set; }
        public Psychologist ContactPsychologist { get; set; }
        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
