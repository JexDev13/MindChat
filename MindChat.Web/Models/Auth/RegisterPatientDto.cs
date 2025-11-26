using System.ComponentModel.DataAnnotations;

namespace MindChat.Web.Models.Auth
{
    public class RegisterPatientDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        public string FullName { get; set; }

        public string EmotionalState { get; set; }
    }
}
