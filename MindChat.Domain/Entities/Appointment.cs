using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Domain.Entities
{
    public class Appointment
    {
        public int Id { get; set; }

        public int PsychologistId { get; set; }
        public Psychologist Psychologist { get; set; }

        public int PatientId { get; set; }
        public Patient Patient { get; set; }

        public DateTime ScheduledAt { get; set; }
        public string Notes { get; set; }
        public bool IsCancelled { get; set; } = false;
    }
}
