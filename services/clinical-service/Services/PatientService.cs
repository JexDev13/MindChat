using ClinicalService.Contracts;
using ClinicalService.Data;
using ClinicalService.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicalService.Services;

public class PatientService : IPatientService
{
    private readonly ClinicalDbContext _context;
    private readonly ILogger<PatientService> _logger;

    public PatientService(ClinicalDbContext context, ILogger<PatientService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PatientProfileResponse?> CreateProfileAsync(CreatePatientProfileRequest request)
    {
        try
        {
            // Check if profile already exists
            var existing = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == request.UserId);

            if (existing != null)
            {
                _logger.LogWarning("Patient profile already exists for UserId: {UserId}", request.UserId);
                return MapToResponse(existing);
            }

            var patient = new Patient
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                EmotionalState = request.EmotionalState
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Patient profile created: {ProfileId} for UserId: {UserId}", 
                patient.Id, patient.UserId);

            return MapToResponse(patient);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating patient profile for UserId: {UserId}", request.UserId);
            return null;
        }
    }

    public async Task<PatientProfileResponse?> GetProfileByUserIdAsync(Guid userId)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.UserId == userId);

        return patient != null ? MapToResponse(patient) : null;
    }

    public async Task<PatientProfileResponse?> GetProfileByIdAsync(Guid profileId)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == profileId);

        return patient != null ? MapToResponse(patient) : null;
    }

    public async Task<bool> UpdateProfileAsync(Guid userId, UpdatePatientProfileRequest request)
    {
        try
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patient == null)
                return false;

            if (request.EmotionalState != null)
                patient.EmotionalState = request.EmotionalState;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Patient profile updated: {ProfileId}", patient.Id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating patient profile for UserId: {UserId}", userId);
            return false;
        }
    }

    public async Task<bool> DeleteProfileAsync(Guid userId)
    {
        try
        {
            var patient = await _context.Patients
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (patient == null)
                return false;

            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Patient profile deleted: {ProfileId}", patient.Id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting patient profile for UserId: {UserId}", userId);
            return false;
        }
    }

    private static PatientProfileResponse MapToResponse(Patient patient)
    {
        return new PatientProfileResponse
        {
            ProfileId = patient.Id,
            UserId = patient.UserId,
            EmotionalState = patient.EmotionalState
        };
    }
}
