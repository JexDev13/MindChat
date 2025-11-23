using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using MindChat.Domain.Entities;

namespace MindChat.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Psychologist> Psychologists { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<PsychologistTag> PsychologistTags { get; set; }
        public DbSet<SessionRequest> SessionRequests { get; set; }
        public DbSet<Chat> Chats { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<Appointment> Appointments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ApplicationUser>(entity =>
            {
                entity.Property(e => e.FullName)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.HasOne(e => e.PatientProfile)
                    .WithOne(p => p.User)
                    .HasForeignKey<Patient>(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.PsychologistProfile)
                    .WithOne(p => p.User)
                    .HasForeignKey<Psychologist>(p => p.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.UserId)
                    .IsUnique();

                entity.HasMany(e => e.SessionRequests)
                    .WithOne(sr => sr.Patient)
                    .HasForeignKey(sr => sr.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Appointments)
                    .WithOne(a => a.Patient)
                    .HasForeignKey(a => a.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Psychologist>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.UserId)
                    .IsUnique();

                entity.HasMany(e => e.Appointments)
                    .WithOne(a => a.Psychologist)
                    .HasForeignKey(a => a.PsychologistId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.SessionRequests)
                    .WithOne(sr => sr.Psychologist)
                    .HasForeignKey(sr => sr.PsychologistId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PsychologistTag>(entity =>
            {
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

            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasIndex(e => e.Name)
                    .IsUnique();
            });

            modelBuilder.Entity<SessionRequest>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.HasOne(sr => sr.ReferredPsychologist)
                    .WithMany()
                    .HasForeignKey(sr => sr.ReferredPsychologistId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Chat)
                    .WithOne(c => c.SessionRequest)
                    .HasForeignKey<Chat>(c => c.SessionRequestId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Chat>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasMany(e => e.Messages)
                    .WithOne(m => m.Chat)
                    .HasForeignKey(m => m.ChatId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ChatMessage>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Message)
                    .IsRequired();

                entity.Property(e => e.SentAt)
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(e => e.Sender)
                    .WithMany()
                    .HasForeignKey(e => e.SenderUserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.ScheduledAt)
                    .IsRequired();

                entity.Property(e => e.Notes)
                    .HasMaxLength(1000);

                entity.HasIndex(e => new { e.PsychologistId, e.ScheduledAt });
            });

            modelBuilder.Entity<ApplicationUser>().ToTable("Users");
            modelBuilder.Entity<IdentityRole<int>>().ToTable("Roles");
            modelBuilder.Entity<IdentityUserRole<int>>().ToTable("UserRoles");
            modelBuilder.Entity<IdentityUserClaim<int>>().ToTable("UserClaims");
            modelBuilder.Entity<IdentityUserLogin<int>>().ToTable("UserLogins");
            modelBuilder.Entity<IdentityUserToken<int>>().ToTable("UserTokens");
            modelBuilder.Entity<IdentityRoleClaim<int>>().ToTable("RoleClaims");
        }
    }
}