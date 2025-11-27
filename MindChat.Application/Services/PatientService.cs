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

        // Devuelve chats activos (no cerrados) para mostrar en notificaciones
        public async Task<IEnumerable<Chat>> GetActiveChatNotificationsAsync(int userId)
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

                // Obtener chats que no están cerrados y tienen mensajes
                var activeChats = await _context.Chats
                    .AsNoTracking()
                    .Include(c => c.SessionRequest)
                        .ThenInclude(sr => sr.AssignedPsychologist)
                            .ThenInclude(ps => ps.User)
                    .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                    .Where(c => c.SessionRequest.PatientId == patient.Id && 
                               !c.IsClosed && 
                               c.SessionRequest.Status == SessionRequestStatus.Accepted)
                    .OrderByDescending(c => c.Messages.Any() ? c.Messages.Max(m => m.SentAt) : DateTime.MinValue)
                    .ToListAsync();

                return activeChats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener notificaciones de chat para UserId {UserId}", userId);
                return Enumerable.Empty<Chat>();
            }
        }

        // Crear solicitud de chat
        public async Task<(bool Success, int SessionRequestId, string Error)> CreateChatRequestAsync(int patientUserId, int psychologistId, string initialMessage)
        {
            try
            {
                var patient = await _context.Patients
                    .FirstOrDefaultAsync(p => p.UserId == patientUserId);

                if (patient == null)
                    return (false, 0, "Paciente no encontrado");

                var psychologist = await _context.Psychologists
                    .FirstOrDefaultAsync(p => p.Id == psychologistId);

                if (psychologist == null || !psychologist.IsProfileVisible)
                    return (false, 0, "Psicólogo no disponible");

                // Verificar si ya existe una solicitud pendiente
                var existingRequest = await _context.SessionRequests
                    .FirstOrDefaultAsync(sr => sr.PatientId == patient.Id && 
                                          sr.AssignedPsychologistId == psychologistId && 
                                          sr.Status == SessionRequestStatus.Pending);

                if (existingRequest != null)
                    return (false, 0, "Ya tienes una solicitud pendiente con este psicólogo");

                var sessionRequest = new SessionRequest
                {
                    PatientId = patient.Id,
                    AssignedPsychologistId = psychologistId,
                    Status = SessionRequestStatus.Pending,
                    InitialMessage = initialMessage
                };

                _context.SessionRequests.Add(sessionRequest);
                await _context.SaveChangesAsync();

                return (true, sessionRequest.Id, "");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear solicitud de chat");
                return (false, 0, "Error interno del servidor");
            }
        }

        // Nuevo método: Verificar si existe un chat activo entre paciente y psicólogo
        public async Task<(bool Success, bool HasActiveChat, string Error)> CheckExistingChatAsync(int patientUserId, int psychologistId)
        {
            try
            {
                var patient = await _context.Patients
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == patientUserId);

                if (patient == null)
                    return (false, false, "Paciente no encontrado");

                // Verificar si existe un chat activo (no cerrado) entre el paciente y el psicólogo
                var activeChat = await _context.Chats
                    .AsNoTracking()
                    .Include(c => c.SessionRequest)
                    .FirstOrDefaultAsync(c => c.SessionRequest.PatientId == patient.Id &&
                                            c.SessionRequest.AssignedPsychologistId == psychologistId &&
                                            c.SessionRequest.Status == SessionRequestStatus.Accepted &&
                                            !c.IsClosed);

                return (true, activeChat != null, "");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al verificar chat existente para patient {PatientUserId} y psychologist {PsychologistId}", patientUserId, psychologistId);
                return (false, false, "Error interno del servidor");
            }
        }
    }
}
