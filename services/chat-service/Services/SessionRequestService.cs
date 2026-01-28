using Microsoft.EntityFrameworkCore;
using ChatService.Contracts;
using ChatService.Data;
using ChatService.Models;

namespace ChatService.Services;

public class SessionRequestService : ISessionRequestService
{
    private readonly ChatDbContext _context;
    private readonly ILogger<SessionRequestService> _logger;

    public SessionRequestService(ChatDbContext context, ILogger<SessionRequestService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<SessionRequestResponse?> GetByIdAsync(Guid id)
    {
        var sessionRequest = await _context.SessionRequests
            .Include(sr => sr.Chat)
            .FirstOrDefaultAsync(sr => sr.Id == id);
        
        return sessionRequest == null ? null : MapToResponse(sessionRequest);
    }

    public async Task<IEnumerable<SessionRequestResponse>> GetAllAsync()
    {
        var requests = await _context.SessionRequests
            .Include(sr => sr.Chat)
            .OrderByDescending(sr => sr.CreatedAt)
            .ToListAsync();

        return requests.Select(MapToResponse);
    }

    public async Task<IEnumerable<SessionRequestResponse>> GetByPatientIdAsync(Guid patientId)
    {
        var requests = await _context.SessionRequests
            .Include(sr => sr.Chat)
            .Where(sr => sr.PatientId == patientId)
            .OrderByDescending(sr => sr.CreatedAt)
            .ToListAsync();

        return requests.Select(MapToResponse);
    }

    public async Task<IEnumerable<SessionRequestResponse>> GetByPsychologistIdAsync(Guid psychologistId)
    {
        var requests = await _context.SessionRequests
            .Include(sr => sr.Chat)
            .Where(sr => sr.AssignedPsychologistId == psychologistId)
            .OrderByDescending(sr => sr.CreatedAt)
            .ToListAsync();

        return requests.Select(MapToResponse);
    }

    public async Task<IEnumerable<SessionRequestResponse>> GetPendingRequestsAsync()
    {
        var requests = await _context.SessionRequests
            .Include(sr => sr.Chat)
            .Where(sr => sr.Status == "Pending")
            .OrderByDescending(sr => sr.CreatedAt)
            .ToListAsync();

        return requests.Select(MapToResponse);
    }

    public async Task<SessionRequestResponse> CreateAsync(CreateSessionRequestRequest request)
    {
        var sessionRequest = new SessionRequest
        {
            Id = Guid.NewGuid(),
            PatientId = request.PatientId,
            InitialMessage = request.InitialMessage,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.SessionRequests.Add(sessionRequest);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Solicitud de sesión creada: {SessionRequestId}", sessionRequest.Id);

        return MapToResponse(sessionRequest);
    }

    public async Task<SessionRequestResponse?> AssignPsychologistAsync(Guid id, Guid psychologistId)
    {
        var sessionRequest = await _context.SessionRequests
            .Include(sr => sr.Chat)
            .FirstOrDefaultAsync(sr => sr.Id == id);
        
        if (sessionRequest == null)
            return null;

        sessionRequest.AssignedPsychologistId = psychologistId;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Psicólogo {PsychologistId} asignado a solicitud {SessionRequestId}", 
            psychologistId, id);

        return MapToResponse(sessionRequest);
    }

    public async Task<SessionRequestResponse?> UpdateStatusAsync(Guid id, string status)
    {
        var sessionRequest = await _context.SessionRequests
            .Include(sr => sr.Chat)
            .FirstOrDefaultAsync(sr => sr.Id == id);
        
        if (sessionRequest == null)
            return null;

        sessionRequest.Status = status;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Estado de solicitud {SessionRequestId} actualizado a {Status}", 
            id, status);

        return MapToResponse(sessionRequest);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var sessionRequest = await _context.SessionRequests.FindAsync(id);
        if (sessionRequest == null)
            return false;

        _context.SessionRequests.Remove(sessionRequest);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Solicitud de sesión eliminada: {SessionRequestId}", id);

        return true;
    }

    private static SessionRequestResponse MapToResponse(SessionRequest sessionRequest)
    {
        return new SessionRequestResponse(
            sessionRequest.Id,
            sessionRequest.PatientId,
            sessionRequest.AssignedPsychologistId,
            sessionRequest.Status,
            sessionRequest.InitialMessage,
            sessionRequest.CreatedAt,
            sessionRequest.Chat?.Id
        );
    }
}
