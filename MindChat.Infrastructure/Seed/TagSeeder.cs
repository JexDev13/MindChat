using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MindChat.Domain.Entities;
using MindChat.Domain.Enums;
using MindChat.Domain.Enums.Extensions;
using MindChat.Infrastructure.Data;

namespace MindChat.Infrastructure.Seed
{
    public static class TagSeeder
    {
        public static async Task SeedTagAsync(ApplicationDbContext context, ILogger logger)
        {
            var tags = Enum.GetValues<PsychologyTag>();

            foreach (var tag in tags)
            {
                var tagName = tag.ToTagName();

                var exists = await context.Tags.AnyAsync(t => t.Name == tagName);

                if (!exists)
                {
                    context.Tags.Add(new Tag
                    {
                        Name = tagName
                    });
                    logger.LogInformation($"Seed Tag: {tagName}");
                }
            }

            await context.SaveChangesAsync();
            logger.LogInformation("Tag seeding completado.");
        }
    }
}
