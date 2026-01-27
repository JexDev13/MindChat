using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MindChat.Application.DTOs.Psychologists;
using MindChat.Application.DTOs.Sessions;
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

        public async Task<bool> ToggleProfileVisibilityAsync(int userId)
        {
            try
            {
                // Encuentra el psicólogo por UserId
                var psychologist = await _context.Psychologists
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (psychologist == null)
                    return false;

                // Cambia el estado de visibilidad
                psychologist.IsProfileVisible = !psychologist.IsProfileVisible;

                // Guarda los cambios
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<Psychologist> GetPsychologistInfoAsync(int userId)
        {
            var psychologist = await _context.Psychologists
                .AsNoTracking()
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.UserId == userId);
            return psychologist;
        }

        // Devuelve chats activos (no cerrados) para mostrar en notificaciones
        public async Task<IEnumerable<Chat>> GetActiveChatNotificationsAsync(int userId)
        {
            try
            {
                var psychologist = await _context.Psychologists
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == userId);

                if (psychologist == null)
                    return Enumerable.Empty<Chat>();

                // Obtener chats que no están cerrados y tienen mensajes
                var activeChats = await _context.Chats
                    .AsNoTracking()
                    .Include(c => c.SessionRequest)
                        .ThenInclude(sr => sr.Patient)
                            .ThenInclude(pt => pt.User)
                    .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
                    .Where(c => c.SessionRequest.AssignedPsychologistId == psychologist.Id && 
                               !c.IsClosed && 
                               c.SessionRequest.Status == SessionRequestStatus.Accepted)
                    .OrderByDescending(c => c.Messages.Any() ? c.Messages.Max(m => m.SentAt) : DateTime.MinValue)
                    .ToListAsync();

                return activeChats;
            }
            catch (Exception)
            {
                return Enumerable.Empty<Chat>();
            }
        }

        public async Task<IEnumerable<SessionRequest>> GetPendingSessionRequestsAsync(int psychologistUserId)
        {
            try
            {
                var psychologist = await _context.Psychologists
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == psychologistUserId);

                if (psychologist == null)
                    return Enumerable.Empty<SessionRequest>();

                var pendingRequests = await _context.SessionRequests
                    .AsNoTracking()
                    .Include(sr => sr.Patient)
                        .ThenInclude(p => p.User)
                    .Where(sr => sr.AssignedPsychologistId == psychologist.Id && 
                                sr.Status == SessionRequestStatus.Pending)
                    .OrderByDescending(sr => sr.Id)
                    .ToListAsync();

                return pendingRequests;
            }
            catch (Exception)
            {
                return Enumerable.Empty<SessionRequest>();
            }
        }

        public async Task<(bool Success, string Error)> AcceptSessionRequestAsync(int psychologistUserId, int sessionRequestId)
        {
            try
            {
                var psychologist = await _context.Psychologists
                    .FirstOrDefaultAsync(p => p.UserId == psychologistUserId);

                if (psychologist == null)
                    return (false, "Psicólogo no encontrado");

                var sessionRequest = await _context.SessionRequests
                    .Include(sr => sr.Patient)
                    .FirstOrDefaultAsync(sr => sr.Id == sessionRequestId && 
                                              sr.AssignedPsychologistId == psychologist.Id &&
                                              sr.Status == SessionRequestStatus.Pending);

                if (sessionRequest == null)
                    return (false, "Solicitud no encontrada o ya procesada");

                // Check if a chat already exists for this patient and psychologist
                var existingChat = await _context.Chats
                    .Include(c => c.SessionRequest)
                    .FirstOrDefaultAsync(c => c.SessionRequest.PatientId == sessionRequest.PatientId &&
                                            c.SessionRequest.AssignedPsychologistId == psychologist.Id &&
                                            c.SessionRequest.Status == SessionRequestStatus.Accepted &&
                                            !c.IsClosed);

                if (existingChat != null)
                {
                    // Update the current request to accepted and associate it with existing chat
                    sessionRequest.Status = SessionRequestStatus.Accepted;
                    await _context.SaveChangesAsync();
                    return (true, "");
                }

                // Actualizar el estado de la solicitud
                sessionRequest.Status = SessionRequestStatus.Accepted;

                // Crear el chat asociado
                var chat = new Chat
                {
                    SessionRequestId = sessionRequestId,
                    IsClosed = false
                };

                _context.Chats.Add(chat);
                await _context.SaveChangesAsync();

                return (true, "");
            }
            catch (Exception)
            {
                return (false, "Error interno del servidor");
            }
        }

        public async Task<(bool Success, string Error)> RejectSessionRequestAsync(int psychologistUserId, int sessionRequestId)
        {
            try
            {
                var psychologist = await _context.Psychologists
                    .FirstOrDefaultAsync(p => p.UserId == psychologistUserId);

                if (psychologist == null)
                    return (false, "Psicólogo no encontrado");

                var sessionRequest = await _context.SessionRequests
                    .FirstOrDefaultAsync(sr => sr.Id == sessionRequestId && 
                                              sr.AssignedPsychologistId == psychologist.Id &&
                                              sr.Status == SessionRequestStatus.Pending);

                if (sessionRequest == null)
                    return (false, "Solicitud no encontrada o ya procesada");

                sessionRequest.Status = SessionRequestStatus.Rejected;
                await _context.SaveChangesAsync();

                return (true, "");
            }
            catch (Exception)
            {
                return (false, "Error interno del servidor");
            }
        }

        // Nuevo método: Obtener información de una solicitud de sesión
        public async Task<SessionRequestInfoDto?> GetSessionRequestInfoAsync(int sessionRequestId)
        {
            try
            {
                var sessionRequest = await _context.SessionRequests
                    .AsNoTracking()
                    .Include(sr => sr.Patient)
                        .ThenInclude(p => p.User)
                    .Include(sr => sr.AssignedPsychologist)
                        .ThenInclude(ps => ps.User)
                    .FirstOrDefaultAsync(sr => sr.Id == sessionRequestId);

                if (sessionRequest == null)
                    return null;

                return new SessionRequestInfoDto
                {
                    Id = sessionRequest.Id,
                    PatientUserId = sessionRequest.Patient.UserId,
                    PatientName = sessionRequest.Patient.User.FullName,
                    PsychologistUserId = sessionRequest.AssignedPsychologist?.UserId,
                    PsychologistName = sessionRequest.AssignedPsychologist?.User?.FullName,
                    InitialMessage = sessionRequest.InitialMessage,
                    CreatedAt = DateTime.UtcNow // You might want to add a CreatedAt field to SessionRequest entity
                };
            }
            catch (Exception)
            {
                return null;
            }
        }

        // Método para crear citas desde chat
        public async Task<(bool Success, string Error)> CreateAppointmentFromChatAsync(int psychologistUserId, int chatId, DateTime scheduledAt, string notes)
        {
            try
            {
                var psychologist = await _context.Psychologists
                    .FirstOrDefaultAsync(p => p.UserId == psychologistUserId);

                if (psychologist == null)
                    return (false, "Psicólogo no encontrado");

                // Obtener el chat con la información del paciente
                var chat = await _context.Chats
                    .Include(c => c.SessionRequest)
                        .ThenInclude(sr => sr.Patient)
                    .FirstOrDefaultAsync(c => c.Id == chatId && 
                                            c.SessionRequest.AssignedPsychologistId == psychologist.Id);

                if (chat == null)
                    return (false, "Chat no encontrado o no pertenece a este psicólogo");

                // Verificar que la fecha sea futura
                if (scheduledAt <= DateTime.Now)
                    return (false, "La fecha de la cita debe ser futura");

                // Verificar si ya existe una cita en el mismo horario para el psicólogo
                var conflictingAppointment = await _context.Appointments
                    .FirstOrDefaultAsync(a => a.PsychologistId == psychologist.Id && 
                                            a.ScheduledAt == scheduledAt && 
                                            !a.IsCancelled);

                if (conflictingAppointment != null)
                    return (false, "Ya tienes una cita programada en ese horario");

                // Crear la nueva cita
                var appointment = new Appointment
                {
                    PsychologistId = psychologist.Id,
                    PatientId = chat.SessionRequest.Patient.Id,
                    ScheduledAt = scheduledAt,
                    Notes = notes ?? "",
                    IsCancelled = false
                };

                _context.Appointments.Add(appointment);
                await _context.SaveChangesAsync();

                return (true, "");
            }
            catch (Exception)
            {
                return (false, "Error interno del servidor");
            }
        }

        // Nuevos métodos para gestión de citas

        // Buscar citas con filtros opcionales
        public async Task<IEnumerable<Appointment>> SearchAppointmentsAsync(int psychologistUserId, string? patientName = null, DateTime? fromDate = null, DateTime? toDate = null)
        {
            try
            {
                var psychologist = await _context.Psychologists
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == psychologistUserId);

                if (psychologist == null)
                    return Enumerable.Empty<Appointment>();

                var query = _context.Appointments
                    .AsNoTracking()
                    .Include(a => a.Patient)
                        .ThenInclude(p => p.User)
                    .Where(a => a.PsychologistId == psychologist.Id && !a.IsCancelled);

                // Filtrar por nombre del paciente si se proporciona
                if (!string.IsNullOrEmpty(patientName))
                {
                    query = query.Where(a => a.Patient.User.FullName.Contains(patientName));
                }

                // Filtrar por rango de fechas
                if (fromDate.HasValue)
                {
                    query = query.Where(a => a.ScheduledAt >= fromDate.Value);
                }

                if (toDate.HasValue)
                {
                    query = query.Where(a => a.ScheduledAt <= toDate.Value);
                }

                var appointments = await query.OrderBy(a => a.ScheduledAt).ToListAsync();
                return appointments;
            }
            catch (Exception)
            {
                return Enumerable.Empty<Appointment>();
            }
        }

        // Actualizar una cita existente
        public async Task<(bool Success, string Error)> UpdateAppointmentAsync(int psychologistUserId, int appointmentId, DateTime scheduledAt, string notes)
        {
            try
            {
                var psychologist = await _context.Psychologists
                    .FirstOrDefaultAsync(p => p.UserId == psychologistUserId);

                if (psychologist == null)
                    return (false, "Psicólogo no encontrado");

                var appointment = await _context.Appointments
                    .FirstOrDefaultAsync(a => a.Id == appointmentId && 
                                            a.PsychologistId == psychologist.Id && 
                                            !a.IsCancelled);

                if (appointment == null)
                    return (false, "Cita no encontrada");

                // Verificar que la fecha sea futura
                if (scheduledAt <= DateTime.Now)
                    return (false, "La fecha de la cita debe ser futura");

                // Verificar si hay conflictos de horario (excluyendo la cita actual)
                var conflictingAppointment = await _context.Appointments
                    .FirstOrDefaultAsync(a => a.PsychologistId == psychologist.Id && 
                                            a.ScheduledAt == scheduledAt && 
                                            a.Id != appointmentId && 
                                            !a.IsCancelled);

                if (conflictingAppointment != null)
                    return (false, "Ya tienes una cita programada en ese horario");

                // Actualizar la cita
                appointment.ScheduledAt = scheduledAt;
                appointment.Notes = notes ?? "";

                await _context.SaveChangesAsync();
                return (true, "");
            }
            catch (Exception)
            {
                return (false, "Error interno del servidor");
            }
        }

        // Eliminar (cancelar) una cita
        public async Task<(bool Success, string Error)> DeleteAppointmentAsync(int psychologistUserId, int appointmentId)
        {
            try
            {
                var psychologist = await _context.Psychologists
                    .FirstOrDefaultAsync(p => p.UserId == psychologistUserId);

                if (psychologist == null)
                    return (false, "Psicólogo no encontrado");

                var appointment = await _context.Appointments
                    .FirstOrDefaultAsync(a => a.Id == appointmentId && 
                                            a.PsychologistId == psychologist.Id && 
                                            !a.IsCancelled);

                if (appointment == null)
                    return (false, "Cita no encontrada");

                // Marcar la cita como cancelada en lugar de eliminarla físicamente
                appointment.IsCancelled = true;

                await _context.SaveChangesAsync();
                return (true, "");
            }
            catch (Exception)
            {
                return (false, "Error interno del servidor");
            }
        }

        // Obtener una cita específica
        public async Task<Appointment?> GetAppointmentAsync(int psychologistUserId, int appointmentId)
        {
            try
            {
                var psychologist = await _context.Psychologists
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == psychologistUserId);

                if (psychologist == null)
                    return null;

                var appointment = await _context.Appointments
                    .AsNoTracking()
                    .Include(a => a.Patient)
                        .ThenInclude(p => p.User)
                    .FirstOrDefaultAsync(a => a.Id == appointmentId && 
                                            a.PsychologistId == psychologist.Id && 
                                            !a.IsCancelled);

                return appointment;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
