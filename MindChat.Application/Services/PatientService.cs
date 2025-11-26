using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MindChat.Application.DTOs.Patients;
using MindChat.Application.Helpers;
using MindChat.Application.Interfaces;
using MindChat.Domain.Entities;
using MindChat.Domain.Enums;
using MindChat.Infrastructure.Data;

namespace MindChat.Application.Services
{
    public class PatientService : IPatientService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PatientService> _logger;

        public PatientService(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            ILogger<PatientService> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        public async Task<(bool Success, IEnumerable<string> Errors)> RegisterAsync(RegisterPatientDto dto)
        {
            try
            {
                dto.UserName = UsernameGenerator.Generate(dto.FirstName, dto.LastName);

                if (dto.Password != dto.ConfirmPassword)
                    return (false, new[] { "Las contraseñas no coinciden." });

                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null)
                    return (false, new[] { "El email ya está registrado." });

                var existingUsername = await _userManager.FindByNameAsync(dto.UserName);
                if (existingUsername != null)
                    return (false, new[] { "El nombre de usuario ya está en uso." });

                var user = new ApplicationUser
                {
                    FullName = dto.FullName,
                    UserName = dto.UserName,
                    Email = dto.Email,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, dto.Password);
                if (!result.Succeeded)
                    return (false, result.Errors.Select(e => e.Description));

                var patientRole = UserRole.Patient.ToString();

                await _userManager.AddToRoleAsync(user, patientRole);

                var patient = new Patient { UserId = user.Id };

                _context.Patients.Add(patient);
                await _context.SaveChangesAsync();

                return (true, Enumerable.Empty<string>());
            }
            catch (Exception ex)
            {
                return (false, new[] { $"Error inesperado: {ex.Message}" });
            }
        }

        public async Task<ApplicationUser?> FindByUsernameAsync(string userEmail)
        {
            return await _userManager.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        }

        public async Task<bool> CheckPasswordAsync(ApplicationUser user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }

        public async Task<IList<string>> GetRolesAsync(ApplicationUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }


    }
}
