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
        public DbSet<PsychologistContact> PsychologistContacts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de ApplicationUser
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

            // Configuración de Patient
            modelBuilder.Entity<Patient>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.UserId)
                    .IsUnique();

                entity.Property(e => e.EmotionalState)
                    .HasMaxLength(50);

                entity.HasMany(e => e.SessionRequests)
                    .WithOne(sr => sr.Patient)
                    .HasForeignKey(sr => sr.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Appointments)
                    .WithOne(a => a.Patient)
                    .HasForeignKey(a => a.PatientId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración de Psychologist
            modelBuilder.Entity<Psychologist>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.UserId)
                    .IsUnique();

                entity.Property(e => e.ProfessionalLicense)
                    .HasMaxLength(100);

                entity.Property(e => e.University)
                    .HasMaxLength(200);

                entity.Property(e => e.Bio)
                    .HasMaxLength(2000);

                entity.HasMany(e => e.Appointments)
                    .WithOne(a => a.Psychologist)
                    .HasForeignKey(a => a.PsychologistId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.SessionRequests)
                    .WithOne(sr => sr.AssignedPsychologist)
                    .HasForeignKey(sr => sr.AssignedPsychologistId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Contacts)
                    .WithOne(c => c.Owner)
                    .HasForeignKey(c => c.OwnerId)
                    .OnDelete(DeleteBehavior.Cascade);
            });


            // Configuración de PsychologistTag (tabla intermedia)
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

            // Configuración de Tag
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasIndex(e => e.Name)
                    .IsUnique();
            });

            // Configuración de SessionRequest
            modelBuilder.Entity<SessionRequest>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.InitialMessage)
                    .IsRequired();

                entity.HasOne(e => e.Chat)
                    .WithOne(c => c.SessionRequest)
                    .HasForeignKey<Chat>(c => c.SessionRequestId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.AssignedPsychologist)
                    .WithMany(p => p.SessionRequests)
                    .HasForeignKey(e => e.AssignedPsychologistId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración de PsychologistContact
            modelBuilder.Entity<PsychologistContact>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasOne(pc => pc.Owner)
                    .WithMany(p => p.Contacts)
                    .HasForeignKey(pc => pc.OwnerId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(pc => pc.ContactPsychologist)
                    .WithMany()
                    .HasForeignKey(pc => pc.ContactPsychologistId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuración de Chat
            modelBuilder.Entity<Chat>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.HasIndex(e => e.SessionRequestId)
                    .IsUnique();

                entity.HasMany(e => e.Messages)
                    .WithOne(m => m.Chat)
                    .HasForeignKey(m => m.ChatId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuración de ChatMessage
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

                entity.HasIndex(e => new { e.ChatId, e.SentAt });
            });

            // Configuración de Appointment
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.ScheduledAt)
                    .IsRequired();

                entity.Property(e => e.Notes)
                    .HasMaxLength(1000);

                entity.HasIndex(e => new { e.PsychologistId, e.ScheduledAt });
                entity.HasIndex(e => new { e.PatientId, e.ScheduledAt });
            });

            modelBuilder.Entity<ApplicationUser>().ToTable("Users"); 
            modelBuilder.Entity<IdentityRole<int>>().ToTable("Roles"); 
            modelBuilder.Entity<IdentityUserRole<int>>().ToTable("UserRoles"); 

            modelBuilder.Ignore<IdentityUserLogin<int>>(); 
            modelBuilder.Ignore<IdentityUserToken<int>>(); 
            modelBuilder.Ignore<IdentityRoleClaim<int>>(); 
            modelBuilder.Ignore<IdentityUserClaim<int>>();
        }
    }
}