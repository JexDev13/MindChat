using System.ComponentModel.DataAnnotations;

namespace MindChat.Web.Models.Auth
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        // Optional: which profile the user wants to use as active
        public string ActiveProfile { get; set; }
    }
}
