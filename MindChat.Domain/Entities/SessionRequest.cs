using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Domain.Entities
{
    public class SessionRequest
    {
        public int Id { get; set; }
        public int PatientId { get; set; }
        public Patient Patient { get; set; }

        public int? PsychologistId { get; set; }
        public Psychologist Psychologist { get; set; }

        public string Status { get; set; }

        public int? ReferredPsychologistId { get; set; }
        public Psychologist ReferredPsychologist { get; set; }

        public Chat Chat { get; set; }
    }
}
