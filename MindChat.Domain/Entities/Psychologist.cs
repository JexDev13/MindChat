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

        public string ProfessionalLicense { get; set; }
        public string University { get; set; }
        public DateTime GraduationYear { get; set; }
        public string Bio { get; set; }
        public bool IsProfileVisible { get; set; } = true;

        public ICollection<PsychologistTag> PsychologistTags { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<SessionRequest> SessionRequests { get; set; }
    }
}
