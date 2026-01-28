using AuthService.Data;
using AuthService.Helpers;
using AuthService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using AuthService.Contracts;

namespace AuthService.Services;

public class AuthServiceImpl : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly ITokenService _tokenService;
    private readonly IClinicalServiceClient _clinicalService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthServiceImpl> _logger;
    private readonly IConfiguration _configuration;

    public AuthServiceImpl(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        ITokenService tokenService,
        IClinicalServiceClient clinicalService,
        IEmailService emailService,
        ILogger<AuthServiceImpl> logger,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _tokenService = tokenService;
        _clinicalService = clinicalService;
        _emailService = emailService;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterPatientAsync(RegisterPatientRequest request)
    {
        try
        {
            // Validar si el email ya existe
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new[] { "El email ya está registrado." }
                };
            }

            // Generar username único
            var username = UsernameGenerator.Generate(request.FirstName, request.LastName);
            var usernameExists = await _userManager.FindByNameAsync(username);
            
            while (usernameExists != null)
            {
                username = UsernameGenerator.Generate(request.FirstName, request.LastName);
                usernameExists = await _userManager.FindByNameAsync(username);
            }

            // Crear usuario
            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = $"{request.FirstName} {request.LastName}",
                UserName = username,
                Email = request.Email,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = result.Errors.Select(e => e.Description)
                };
            }

            // Asignar rol Patient
            await EnsureRoleExistsAsync("Patient");
            await _userManager.AddToRoleAsync(user, "Patient");

            // Crear perfil en Clinical Service
            var profileId = await _clinicalService.CreatePatientProfileAsync(user.Id);

            // Generar token
            var token = _tokenService.GenerateToken(user.Id, user.Email!, user.FullName, "Patient", profileId);

            _logger.LogInformation("Patient registered successfully: {Email}", user.Email);

            return new AuthResponse
            {
                Success = true,
                Token = token,
                UserId = user.Id.ToString(),
                Email = user.Email,
                FullName = user.FullName,
                Role = "Patient",
                ProfileId = profileId?.ToString()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering patient");
            return new AuthResponse
            {
                Success = false,
                Errors = new[] { $"Error inesperado: {ex.Message}" }
            };
        }
    }

    public async Task<AuthResponse> RegisterPsychologistAsync(RegisterPsychologistRequest request)
    {
        try
        {
            // Validar si el email ya existe
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new[] { "El email ya está registrado." }
                };
            }

            // Generar username único
            var username = UsernameGenerator.Generate(request.FirstName, request.LastName);
            var usernameExists = await _userManager.FindByNameAsync(username);
            
            while (usernameExists != null)
            {
                username = UsernameGenerator.Generate(request.FirstName, request.LastName);
                usernameExists = await _userManager.FindByNameAsync(username);
            }

            // Crear usuario
            var user = new User
            {
                Id = Guid.NewGuid(),
                FullName = $"{request.FirstName} {request.LastName}",
                UserName = username,
                Email = request.Email,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = result.Errors.Select(e => e.Description)
                };
            }

            // Asignar rol Psychologist
            await EnsureRoleExistsAsync("Psychologist");
            await _userManager.AddToRoleAsync(user, "Psychologist");

            // Crear perfil en Clinical Service
            var profileId = await _clinicalService.CreatePsychologistProfileAsync(
                user.Id,
                request.ProfessionalLicense,
                request.University,
                request.GraduationDate
            );

            // Generar token
            var token = _tokenService.GenerateToken(user.Id, user.Email!, user.FullName, "Psychologist", profileId);

            _logger.LogInformation("Psychologist registered successfully: {Email}", user.Email);

            return new AuthResponse
            {
                Success = true,
                Token = token,
                UserId = user.Id.ToString(),
                Email = user.Email,
                FullName = user.FullName,
                Role = "Psychologist",
                ProfileId = profileId?.ToString()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering psychologist");
            return new AuthResponse
            {
                Success = false,
                Errors = new[] { $"Error inesperado: {ex.Message}" }
            };
        }
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string requiredRole)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new[] { "Email o contraseña inválidos." }
                };
            }

            var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!passwordValid)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new[] { "Email o contraseña inválidos." }
                };
            }

            var roles = await _userManager.GetRolesAsync(user);
            if (!roles.Contains(requiredRole))
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new[] { $"No tiene permisos para acceder como {requiredRole}." }
                };
            }

            // Generar token
            var token = _tokenService.GenerateToken(user.Id, user.Email!, user.FullName, requiredRole);

            _logger.LogInformation("User logged in successfully: {Email} as {Role}", user.Email, requiredRole);

            return new AuthResponse
            {
                Success = true,
                Token = token,
                UserId = user.Id.ToString(),
                Email = user.Email,
                FullName = user.FullName,
                Role = requiredRole
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return new AuthResponse
            {
                Success = false,
                Errors = new[] { $"Error inesperado: {ex.Message}" }
            };
        }
    }

    private async Task EnsureRoleExistsAsync(string roleName)
    {
        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            await _roleManager.CreateAsync(new Role { Name = roleName });
        }
    }

    public async Task<AuthResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            
            // Por seguridad, siempre retornamos éxito aunque el usuario no exista
            if (user == null)
            {
                _logger.LogWarning("Password reset requested for non-existent email: {Email}", request.Email);
                return new AuthResponse
                {
                    Success = true,
                    Message = "Si el email existe, recibirás un enlace para restablecer tu contraseña."
                };
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            // Construir el link de reset
            var frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:3000";
            var resetLink = $"{frontendUrl}/reset-password?email={Uri.EscapeDataString(user.Email ?? "")}&token={Uri.EscapeDataString(token)}";

            // Crear mensaje HTML para el email
            var htmlMessage = $@"
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
                        .header h1 {{ color: white; margin: 0; }}
                        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
                        .button {{ display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>MindChat</h1>
                        </div>
                        <div class='content'>
                            <h2>Restablecer Contraseña</h2>
                            <p>Hola,</p>
                            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en MindChat.</p>
                            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                            <p style='text-align: center;'>
                                <a href='{resetLink}' class='button'>Restablecer Contraseña</a>
                            </p>
                            <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                            <p>Este enlace expirará en 1 hora por seguridad.</p>
                            <div class='footer'>
                                <p>© 2026 MindChat - Plataforma de Salud Mental</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>";

            // Enviar email
            try
            {
                await _emailService.SendEmailAsync(user.Email, "Restablecer contraseña - MindChat", htmlMessage);
                _logger.LogInformation("Password reset email sent to {Email}", user.Email);
            }
            catch (Exception emailEx)
            {
                _logger.LogError(emailEx, "Error sending password reset email to {Email}", user.Email);
                // No fallar la operación si el email no se pudo enviar
                // En su lugar, registrar el token para desarrollo
                _logger.LogWarning("Password reset token for {Email}: {Token}", user.Email, token);
            }

            return new AuthResponse
            {
                Success = true,
                Message = "Si el email existe, recibirás un enlace para restablecer tu contraseña."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en forgot password para email: {Email}", request.Email);
            return new AuthResponse
            {
                Success = false,
                Errors = new[] { "Error al procesar la solicitud." }
            };
        }
    }

    public async Task<AuthResponse> ResetPasswordAsync(ResetPasswordRequest request)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            
            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = new[] { "Usuario no encontrado." }
                };
            }

            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.Password);

            if (!result.Succeeded)
            {
                return new AuthResponse
                {
                    Success = false,
                    Errors = result.Errors.Select(e => e.Description).ToArray()
                };
            }

            _logger.LogInformation("Password reset successfully for user: {Email}", user.Email);

            return new AuthResponse
            {
                Success = true,
                Message = "Contraseña restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for email: {Email}", request.Email);
            return new AuthResponse
            {
                Success = false,
                Errors = new[] { "Error al restablecer la contraseña." }
            };
        }
    }
}
