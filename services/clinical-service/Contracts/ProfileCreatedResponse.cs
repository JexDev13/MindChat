namespace ClinicalService.Contracts;

public record ProfileCreatedResponse
{
    public Guid ProfileId { get; init; }
}
