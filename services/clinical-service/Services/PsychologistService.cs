using ClinicalService.Contracts;
using ClinicalService.Data;
using ClinicalService.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicalService.Services;

public class PsychologistService : IPsychologistService
{
    private readonly ClinicalDbContext _context;
    private readonly ILogger<PsychologistService> _logger;

    public PsychologistService(ClinicalDbContext context, ILogger<PsychologistService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PsychologistProfileResponse?> CreateProfileAsync(CreatePsychologistProfileRequest request)
    {
        try
        {
            // Check if profile already exists
            var existing = await _context.Psychologists
                .FirstOrDefaultAsync(p => p.UserId == request.UserId);

            if (existing != null)
            {
                _logger.LogWarning("Psychologist profile already exists for UserId: {UserId}", request.UserId);
                return await MapToResponseAsync(existing);
            }

            var psychologist = new Psychologist
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                ProfessionalLicense = request.ProfessionalLicense,
                University = request.University,
                GraduationDate = request.GraduationDate,
                Bio = request.Bio,
                IsVerified = false,
                IsProfileVisible = true
            };

            _context.Psychologists.Add(psychologist);
            await _context.SaveChangesAsync();

            // Add tags if provided
            if (request.Tags != null && request.Tags.Any())
            {
                await AddTagsToPsychologistAsync(psychologist.Id, request.Tags);
            }

            _logger.LogInformation("Psychologist profile created: {ProfileId} for UserId: {UserId}", 
                psychologist.Id, psychologist.UserId);

            return await MapToResponseAsync(psychologist);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating psychologist profile for UserId: {UserId}", request.UserId);
            return null;
        }
    }

    public async Task<PsychologistProfileResponse?> GetProfileByUserIdAsync(Guid userId)
    {
        var psychologist = await _context.Psychologists
            .Include(p => p.PsychologistTags)
            .ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.UserId == userId);

        return psychologist != null ? await MapToResponseAsync(psychologist) : null;
    }

    public async Task<PsychologistProfileResponse?> GetProfileByIdAsync(Guid profileId)
    {
        var psychologist = await _context.Psychologists
            .Include(p => p.PsychologistTags)
            .ThenInclude(pt => pt.Tag)
            .FirstOrDefaultAsync(p => p.Id == profileId);

        return psychologist != null ? await MapToResponseAsync(psychologist) : null;
    }

    public async Task<List<PsychologistProfileResponse>> GetAllVisibleProfilesAsync()
    {
        var psychologists = await _context.Psychologists
            .Include(p => p.PsychologistTags)
            .ThenInclude(pt => pt.Tag)
            .Where(p => p.IsProfileVisible)
            .ToListAsync();

        var responses = new List<PsychologistProfileResponse>();
        foreach (var psychologist in psychologists)
        {
            responses.Add(await MapToResponseAsync(psychologist));
        }

        return responses;
    }

    public async Task<List<PsychologistProfileResponse>> SearchByTagsAsync(List<string> tags)
    {
        var normalizedTags = tags.Select(t => t.ToLower()).ToList();

        var psychologists = await _context.Psychologists
            .Include(p => p.PsychologistTags)
            .ThenInclude(pt => pt.Tag)
            .Where(p => p.IsProfileVisible && 
                        p.PsychologistTags.Any(pt => normalizedTags.Contains(pt.Tag.Name.ToLower())))
            .ToListAsync();

        var responses = new List<PsychologistProfileResponse>();
        foreach (var psychologist in psychologists)
        {
            responses.Add(await MapToResponseAsync(psychologist));
        }

        return responses;
    }

    public async Task<bool> UpdateProfileAsync(Guid userId, UpdatePsychologistProfileRequest request)
    {
        try
        {
            var psychologist = await _context.Psychologists
                .Include(p => p.PsychologistTags)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (psychologist == null)
                return false;

            if (request.Bio != null)
                psychologist.Bio = request.Bio;

            if (request.IsProfileVisible.HasValue)
                psychologist.IsProfileVisible = request.IsProfileVisible.Value;

            // Update tags if provided
            if (request.Tags != null)
            {
                // Remove existing tags
                _context.PsychologistTags.RemoveRange(psychologist.PsychologistTags);
                await _context.SaveChangesAsync();

                // Add new tags
                await AddTagsToPsychologistAsync(psychologist.Id, request.Tags);
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Psychologist profile updated: {ProfileId}", psychologist.Id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating psychologist profile for UserId: {UserId}", userId);
            return false;
        }
    }

    public async Task<bool> DeleteProfileAsync(Guid userId)
    {
        try
        {
            var psychologist = await _context.Psychologists
                .Include(p => p.PsychologistTags)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (psychologist == null)
                return false;

            _context.Psychologists.Remove(psychologist);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Psychologist profile deleted: {ProfileId}", psychologist.Id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting psychologist profile for UserId: {UserId}", userId);
            return false;
        }
    }

    private async Task AddTagsToPsychologistAsync(Guid psychologistId, List<string> tagNames)
    {
        foreach (var tagName in tagNames)
        {
            var tag = await _context.Tags
                .FirstOrDefaultAsync(t => t.Name.ToLower() == tagName.ToLower());

            if (tag == null)
            {
                tag = new Tag
                {
                    Id = Guid.NewGuid(),
                    Name = tagName
                };
                _context.Tags.Add(tag);
                await _context.SaveChangesAsync();
            }

            var psychologistTag = new PsychologistTag
            {
                PsychologistId = psychologistId,
                TagId = tag.Id
            };

            _context.PsychologistTags.Add(psychologistTag);
        }

        await _context.SaveChangesAsync();
    }

    private async Task<PsychologistProfileResponse> MapToResponseAsync(Psychologist psychologist)
    {
        // Ensure tags are loaded
        if (!_context.Entry(psychologist).Collection(p => p.PsychologistTags).IsLoaded)
        {
            await _context.Entry(psychologist)
                .Collection(p => p.PsychologistTags)
                .Query()
                .Include(pt => pt.Tag)
                .LoadAsync();
        }

        return new PsychologistProfileResponse
        {
            ProfileId = psychologist.Id,
            UserId = psychologist.UserId,
            ProfessionalLicense = psychologist.ProfessionalLicense,
            University = psychologist.University,
            GraduationDate = psychologist.GraduationDate,
            Bio = psychologist.Bio,
            IsVerified = psychologist.IsVerified,
            IsProfileVisible = psychologist.IsProfileVisible,
            Tags = psychologist.PsychologistTags.Select(pt => pt.Tag.Name).ToList()
        };
    }
}
