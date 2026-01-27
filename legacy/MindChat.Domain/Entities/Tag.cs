using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Domain.Entities
{
    public class Tag
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public ICollection<PsychologistTag> PsychologistTags { get; set; }
    }

    public class PsychologistTag
    {
        public int PsychologistId { get; set; }
        public Psychologist Psychologist { get; set; }

        public int TagId { get; set; }
        public Tag Tag { get; set; }
    }
}
