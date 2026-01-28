using ClinicalService.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicalService.Data;

public class ClinicalDbContext : DbContext
{
    public ClinicalDbContext(DbContextOptions<ClinicalDbContext> options) : base(options)
    {
    }

    public DbSet<Patient> Patients { get; set; }
    public DbSet<Psychologist> Psychologists { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<PsychologistTag> PsychologistTags { get; set; }
    public DbSet<PsychologistContact> PsychologistContacts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Patient configuration
        modelBuilder.Entity<Patient>(entity =>
        {
            entity.ToTable("Patients");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.UserId).IsRequired();
            entity.HasIndex(p => p.UserId).IsUnique();
        });

        // Psychologist configuration
        modelBuilder.Entity<Psychologist>(entity =>
        {
            entity.ToTable("Psychologists");
            entity.HasKey(p => p.Id);
            entity.Property(p => p.UserId).IsRequired();
            entity.HasIndex(p => p.UserId).IsUnique();
            entity.Property(p => p.ProfessionalLicense).HasMaxLength(100);
            entity.Property(p => p.University).HasMaxLength(200);
            entity.Property(p => p.IsVerified).HasDefaultValue(false);
            entity.Property(p => p.IsProfileVisible).HasDefaultValue(true);
        });

        // Tag configuration
        modelBuilder.Entity<Tag>(entity =>
        {
            entity.ToTable("Tags");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Name).IsRequired().HasMaxLength(100);
            entity.HasIndex(t => t.Name).IsUnique();
        });

        // PsychologistTag (Many-to-Many) configuration
        modelBuilder.Entity<PsychologistTag>(entity =>
        {
            entity.ToTable("PsychologistTags");
            entity.HasKey(pt => new { pt.PsychologistId, pt.TagId });

            entity.HasOne(pt => pt.Psychologist)
                .WithMany(p => p.PsychologistTags)
                .HasForeignKey(pt => pt.PsychologistId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(pt => pt.Tag)
                .WithMany(t => t.PsychologistTags)
                .HasForeignKey(pt => pt.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PsychologistContact configuration
        modelBuilder.Entity<PsychologistContact>(entity =>
        {
            entity.ToTable("PsychologistContacts");
            entity.HasKey(pc => pc.Id);
            entity.Property(pc => pc.OwnerId).IsRequired();
            entity.Property(pc => pc.ContactPsychologistId).IsRequired();
            entity.Property(pc => pc.AddedAt).HasDefaultValueSql("GETDATE()");

            entity.HasOne(pc => pc.ContactPsychologist)
                .WithMany()
                .HasForeignKey(pc => pc.ContactPsychologistId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(pc => new { pc.OwnerId, pc.ContactPsychologistId }).IsUnique();
        });
    }
}
