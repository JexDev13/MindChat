using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Domain.Entities
{
    public class Psychologist
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public ApplicationUser User { get; set; }

        public bool IsProfilePrivate { get; set; } = false;

        public ICollection<PsychologistTag> PsychologistTags { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<SessionRequest> SessionRequests { get; set; }
    }
}
