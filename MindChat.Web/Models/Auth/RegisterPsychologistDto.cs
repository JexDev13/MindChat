using System;
using System.ComponentModel.DataAnnotations;

namespace MindChat.Web.Models.Auth
{
    public class RegisterPsychologistDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        public string FullName { get; set; }

        public string ProfessionalLicense { get; set; }
        public string University { get; set; }
        public DateTime? GraduationYear { get; set; }
        public string Bio { get; set; }
        public bool IsProfileVisible { get; set; } = true;
    }
}
