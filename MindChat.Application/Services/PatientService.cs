using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        // Devuelve chats relacionados con el usuario (asumiendo que se usa UserId para resolver Patient)
        public async Task<IEnumerable<Chat>> GetChatsAsync(int userId)
        {
            try
            {
                var patient = await _context.Patients
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (patient == null)
                {
                    _logger.LogWarning("No se encontró Patient para UserId {UserId}", userId);
                    return Enumerable.Empty<Chat>();
                }

                var chats = await _context.Chats
                    .AsNoTracking()
                    .Include(c => c.Messages)
                        .ThenInclude(m => m.Sender)
                    .Include(c => c.SessionRequest)
                        .ThenInclude(sr => sr.AssignedPsychologist)
                            .ThenInclude(ps => ps.User)
                    .Where(c => c.SessionRequest.PatientId == patient.Id)
                    .OrderByDescending(c => c.Id)
                    .ToListAsync();

                return chats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener chats para UserId {UserId}", userId);
                return Enumerable.Empty<Chat>();
            }
        }

        // Devuelve todos los psicólogos cuyo perfil está visible
        public async Task<IEnumerable<Psychologist>> GetVisiblePsychologistsAsync()
        {
            try
            {
                var psychologists = await _context.Psychologists
                    .AsNoTracking()
                    .Include(p => p.User)
                    .Include(p => p.PsychologistTags)
                        .ThenInclude(pt => pt.Tag)
                    .Where(p => p.IsProfileVisible)
                    .OrderBy(p => p.User.FullName)
                    .ToListAsync();

                return psychologists;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener psicólogos visibles");
                return Enumerable.Empty<Psychologist>();
            }
        }
    }
}
