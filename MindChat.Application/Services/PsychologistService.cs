using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MindChat.Application.DTOs.Psychologists;
using MindChat.Application.Helpers;
using MindChat.Application.Interfaces;
using MindChat.Domain.Entities;
using MindChat.Domain.Enums;
using MindChat.Infrastructure.Data;

namespace MindChat.Application.Services
{
    public class PsychologistService : IPsychologistService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public PsychologistService(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<(bool Success, IEnumerable<string> Errors)> RegisterAsync(RegisterPsychologistDto dto)
        {
            try
            {
                if (dto.GraduationDate == null)
                    return (false, new[] { "Debe seleccionar el año de graduación." });

                dto.UserName = UsernameGenerator.Generate(dto.FirstName, dto.LastName);

                if (dto.Password != dto.ConfirmPassword)
                    return (false, new[] { "Las contraseñas no coinciden." });

                var exists = await _userManager.FindByEmailAsync(dto.Email);
                if (exists != null)
                    return (false, new[] { "El email ya está registrado." });

                var user = new ApplicationUser
                {
                    FullName = dto.FullName,
                    UserName = dto.UserName,
                    Email = dto.Email,
                    EmailConfirmed = true
                };

                var createUser = await _userManager.CreateAsync(user, dto.Password);
                if (!createUser.Succeeded)
                    return (false, createUser.Errors.Select(e => e.Description));

                await _userManager.AddToRoleAsync(user, UserRole.Psychologist.ToString());

                var psychologist = new Psychologist
                {
                    UserId = user.Id,
                    ProfessionalLicense = dto.ProfessionalLicense,
                    University = dto.University,
                    GraduationDate = dto.GraduationDate,
                    IsProfileVisible = true
                };

                _context.Psychologists.Add(psychologist);
                await _context.SaveChangesAsync();

                return (true, Enumerable.Empty<string>());
            }
            catch (Exception ex)
            {
                return (false, new[] { $"Error inesperado: {ex.Message}" });
            }
        }
    }
}
