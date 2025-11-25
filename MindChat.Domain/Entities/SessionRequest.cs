using MindChat.Domain.Enums;
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

        public int? AssignedPsychologistId { get; set; }
        public Psychologist AssignedPsychologist { get; set; }

        public SessionRequestStatus Status { get; set; }

        public string InitialMessage { get; set; }

        public Chat Chat { get; set; }
    }
}
