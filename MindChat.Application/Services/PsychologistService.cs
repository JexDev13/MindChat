using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

        public async Task<IEnumerable<Chat>> GetChatsAsync(int userId)
        {
            // Resolve psychologist record by userId
            var psychologist = await _context.Psychologists
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (psychologist == null)
                return Enumerable.Empty<Chat>();

            // Load chats where the session request is assigned to this psychologist
            var chats = await _context.Chats
                .AsNoTracking()
                .Include(c => c.Messages)
                    .ThenInclude(m => m.Sender)
                .Include(c => c.SessionRequest)
                    .ThenInclude(sr => sr.Patient)
                        .ThenInclude(pt => pt.User)
                .Where(c => c.SessionRequest.AssignedPsychologistId == psychologist.Id)
                .OrderByDescending(c => c.Id)
                .ToListAsync();

            return chats;
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentsAsync(int userId)
        {
            // Resolve psychologist record by userId
            var psychologist = await _context.Psychologists
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (psychologist == null)
                return Enumerable.Empty<Appointment>();

            // Load non-cancelled appointments for this psychologist with patient info
            var appointments = await _context.Appointments
                .AsNoTracking()
                .Include(a => a.Patient)
                    .ThenInclude(pt => pt.User)
                .Where(a => a.PsychologistId == psychologist.Id && !a.IsCancelled)
                .OrderBy(a => a.ScheduledAt)
                .ToListAsync();

            return appointments;
        }
    }
}
