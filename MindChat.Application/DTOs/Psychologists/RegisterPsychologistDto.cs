namespace MindChat.Application.DTOs.Psychologists
{
    public class RegisterPsychologistDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";

        public string? UserName { get; set; }
        public string Email { get; set; }

        public string ProfessionalLicense { get; set; }
        public string University { get; set; }
        public DateTime? GraduationDate { get; set; }

        public string Password { get; set; }
        public string ConfirmPassword { get; set; }
    }
}
