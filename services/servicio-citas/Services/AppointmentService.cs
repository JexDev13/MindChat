using Microsoft.EntityFrameworkCore;
using ServicioCitas.Contracts;
using ServicioCitas.Data;
using ServicioCitas.Models;

namespace ServicioCitas.Services;

public class AppointmentService : IAppointmentService
{
    private readonly AppointmentDbContext _context;
    private readonly ILogger<AppointmentService> _logger;

    public AppointmentService(AppointmentDbContext context, ILogger<AppointmentService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<AppointmentResponse?> GetByIdAsync(Guid id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        return appointment == null ? null : MapToResponse(appointment);
    }

    public async Task<IEnumerable<AppointmentResponse>> GetAllAsync()
    {
        var appointments = await _context.Appointments
            .Where(a => !a.IsCancelled)
            .OrderBy(a => a.ScheduledAt)
            .ToListAsync();

        return appointments.Select(MapToResponse);
    }

    public async Task<IEnumerable<AppointmentResponse>> GetByPsychologistIdAsync(Guid psychologistId)
    {
        var appointments = await _context.Appointments
            .Where(a => a.PsychologistId == psychologistId && !a.IsCancelled)
            .OrderBy(a => a.ScheduledAt)
            .ToListAsync();

        return appointments.Select(MapToResponse);
    }

    public async Task<IEnumerable<AppointmentResponse>> GetByPatientIdAsync(Guid patientId)
    {
        var appointments = await _context.Appointments
            .Where(a => a.PatientId == patientId && !a.IsCancelled)
            .OrderBy(a => a.ScheduledAt)
            .ToListAsync();

        return appointments.Select(MapToResponse);
    }

    public async Task<AppointmentResponse> CreateAsync(CreateAppointmentRequest request)
    {
        var appointment = new Appointment
        {
            Id = Guid.NewGuid(),
            PsychologistId = request.PsychologistId,
            PatientId = request.PatientId,
            ScheduledAt = request.ScheduledAt,
            Notes = request.Notes,
            IsCancelled = false
        };

        _context.Appointments.Add(appointment);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Cita creada: {AppointmentId}", appointment.Id);

        return MapToResponse(appointment);
    }

    public async Task<AppointmentResponse?> UpdateAsync(Guid id, UpdateAppointmentRequest request)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null || appointment.IsCancelled)
            return null;

        if (request.ScheduledAt.HasValue)
            appointment.ScheduledAt = request.ScheduledAt.Value;

        if (request.Notes != null)
            appointment.Notes = request.Notes;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Cita actualizada: {AppointmentId}", appointment.Id);

        return MapToResponse(appointment);
    }

    public async Task<bool> CancelAsync(Guid id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null)
            return false;

        appointment.IsCancelled = true;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Cita cancelada: {AppointmentId}", appointment.Id);

        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var appointment = await _context.Appointments.FindAsync(id);
        if (appointment == null)
            return false;

        _context.Appointments.Remove(appointment);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Cita eliminada: {AppointmentId}", appointment.Id);

        return true;
    }

    private static AppointmentResponse MapToResponse(Appointment appointment)
    {
        return new AppointmentResponse(
            appointment.Id,
            appointment.PsychologistId,
            appointment.PatientId,
            appointment.ScheduledAt,
            appointment.Notes,
            appointment.IsCancelled
        );
    }
}
