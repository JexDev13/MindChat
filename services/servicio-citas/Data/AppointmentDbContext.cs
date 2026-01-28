using Microsoft.EntityFrameworkCore;
using ServicioCitas.Models;

namespace ServicioCitas.Data;

public class AppointmentDbContext : DbContext
{
    public AppointmentDbContext(DbContextOptions<AppointmentDbContext> options) : base(options)
    {
    }

    public DbSet<Appointment> Appointments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.ToTable("Appointments");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.PsychologistId).IsRequired();
            entity.Property(a => a.PatientId).IsRequired();
            entity.Property(a => a.ScheduledAt).IsRequired();
            entity.Property(a => a.IsCancelled).HasDefaultValue(false);
        });
    }
}
