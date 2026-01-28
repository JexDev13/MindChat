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
    private readonly ILogger<AuthServiceImpl> _logger;

    public AuthServiceImpl(
        UserManager<User> userManager,
        RoleManager<Role> roleManager,
        ITokenService tokenService,
        IClinicalServiceClient clinicalService,
        ILogger<AuthServiceImpl> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _tokenService = tokenService;
        _clinicalService = clinicalService;
        _logger = logger;
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
}
