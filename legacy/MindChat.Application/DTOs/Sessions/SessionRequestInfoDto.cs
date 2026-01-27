namespace MindChat.Application.DTOs.Sessions
{
    public class SessionRequestInfoDto
    {
        public int Id { get; set; }
        public int PatientUserId { get; set; }
        public string PatientName { get; set; } = string.Empty;
        public int? PsychologistUserId { get; set; }
        public string? PsychologistName { get; set; }
        public string InitialMessage { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}