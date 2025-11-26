using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Domain.Entities
{
    public class Patient
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string EmotionalState { get; set; }
        public ApplicationUser User { get; set; }

        public string EmotionalState { get; set; }

        public ICollection<SessionRequest> SessionRequests { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
    }
}