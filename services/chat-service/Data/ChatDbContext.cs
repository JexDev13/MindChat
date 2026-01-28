using Microsoft.EntityFrameworkCore;
using ChatService.Models;

namespace ChatService.Data;

public class ChatDbContext : DbContext
{
    public ChatDbContext(DbContextOptions<ChatDbContext> options) : base(options)
    {
    }

    public DbSet<SessionRequest> SessionRequests { get; set; }
    public DbSet<Chat> Chats { get; set; }
    public DbSet<ChatMessage> ChatMessages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // SessionRequest configuration
        modelBuilder.Entity<SessionRequest>(entity =>
        {
            entity.ToTable("SessionRequests");
            entity.HasKey(sr => sr.Id);
            entity.Property(sr => sr.PatientId).IsRequired();
            entity.Property(sr => sr.Status).IsRequired().HasMaxLength(50);
            entity.Property(sr => sr.CreatedAt).HasDefaultValueSql("GETDATE()");
            
            // One-to-one relationship with Chat
            entity.HasOne(sr => sr.Chat)
                .WithOne(c => c.SessionRequest)
                .HasForeignKey<Chat>(c => c.SessionRequestId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Chat configuration
        modelBuilder.Entity<Chat>(entity =>
        {
            entity.ToTable("Chats");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.SessionRequestId).IsRequired();
            entity.Property(c => c.IsClosed).HasDefaultValue(false);
            entity.Property(c => c.CreatedAt).HasDefaultValueSql("GETDATE()");
        });

        // ChatMessage configuration
        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.ToTable("ChatMessages");
            entity.HasKey(cm => cm.Id);
            entity.Property(cm => cm.ChatId).IsRequired();
            entity.Property(cm => cm.SenderUserId).IsRequired();
            entity.Property(cm => cm.Message).IsRequired();
            entity.Property(cm => cm.SentAt).HasDefaultValueSql("GETDATE()");

            // Many-to-one relationship with Chat
            entity.HasOne(cm => cm.Chat)
                .WithMany(c => c.Messages)
                .HasForeignKey(cm => cm.ChatId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
