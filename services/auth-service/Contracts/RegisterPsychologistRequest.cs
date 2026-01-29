using System.ComponentModel.DataAnnotations;

namespace AuthService.Contracts;

public record RegisterPsychologistRequest
{
    [Required(ErrorMessage = "El nombre es requerido")]
    public string FirstName { get; init; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido")]
    public string LastName { get; init; } = string.Empty;

    [Required(ErrorMessage = "El email es requerido")]
    [EmailAddress(ErrorMessage = "Email inválido")]
    public string Email { get; init; } = string.Empty;

    [Required(ErrorMessage = "La licencia profesional es requerida")]
    public string ProfessionalLicense { get; init; } = string.Empty;

    [Required(ErrorMessage = "La universidad es requerida")]
    public string University { get; init; } = string.Empty;

    [Required(ErrorMessage = "La fecha de graduación es requerida")]
    public DateTime GraduationDate { get; init; }

    [Required(ErrorMessage = "La contraseña es requerida")]
    [MinLength(6, ErrorMessage = "La contraseña debe tener al menos 6 caracteres")]
    public string Password { get; init; } = string.Empty;

    [Required(ErrorMessage = "La confirmación de contraseña es requerida")]
    [Compare(nameof(Password), ErrorMessage = "Las contraseñas no coinciden")]
    public string ConfirmPassword { get; init; } = string.Empty;
}
