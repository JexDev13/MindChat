using System.ComponentModel.DataAnnotations;

namespace AuthService.Contracts;

public record ForgotPasswordRequest
{
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    public string Email { get; init; } = string.Empty;
}
