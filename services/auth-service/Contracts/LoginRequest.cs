using System.ComponentModel.DataAnnotations;

namespace AuthService.Contracts;

public record LoginRequest
{
    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    public string Password { get; init; } = string.Empty;
}
