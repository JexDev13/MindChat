using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MindChat.Application.Configuration;
using MindChat.Application.Interfaces;
using MindChat.Application.Services;
using MindChat.Domain.Entities;
using MindChat.Infrastructure.Data;
using MindChat.Infrastructure.Seed;
using MindChat.Web.Hubs;
using MindChat.Web.Services;
using System.Text;
using Microsoft.AspNetCore.Antiforgery; // added

var builder = WebApplication.CreateBuilder(args);

Env.Load();

builder.Configuration.AddEnvironmentVariables();

var dbServer = Environment.GetEnvironmentVariable("DB_SERVER");
var dbName = Environment.GetEnvironmentVariable("DB_NAME");
var dbUser = Environment.GetEnvironmentVariable("DB_USER");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER");
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE");
var jwtExpiry = Environment.GetEnvironmentVariable("JWT_EXPIRY");

var emailSmtpHost = Environment.GetEnvironmentVariable("EMAIL_SMTP_HOST");
var emailSmtpPort = Environment.GetEnvironmentVariable("EMAIL_SMTP_PORT");
var emailSenderName = Environment.GetEnvironmentVariable("EMAIL_SENDER_NAME");
var emailSenderEmail = Environment.GetEnvironmentVariable("EMAIL_SENDER_EMAIL");
var emailPassword = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");

var connectionString =
 $"Server={dbServer};Database={dbName};User Id={dbUser};Password={dbPassword};Encrypt=True;TrustServerCertificate=True;";

var infraAssembly = typeof(ApplicationDbContext).Assembly.FullName;

builder.Services.AddDbContext<ApplicationDbContext>(options =>
 options.UseSqlServer(connectionString, b => b.MigrationsAssembly(infraAssembly))
);

builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
{
 options.Password.RequireDigit = true;
 options.Password.RequireLowercase = true;
 options.Password.RequireUppercase = true;
 options.Password.RequireNonAlphanumeric = false;
 options.Password.RequiredLength =6;

 options.User.RequireUniqueEmail = true;

 options.SignIn.RequireConfirmedEmail = false;
 options.SignIn.RequireConfirmedAccount = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
 options.LoginPath = "/Account/Login";
 options.LogoutPath = "/Account/Logout";
 options.AccessDeniedPath = "/Account/AccessDenied";
 options.ExpireTimeSpan = TimeSpan.FromHours(24);
 options.SlidingExpiration = true;
 options.Cookie.HttpOnly = true;
 options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

builder.Services.AddAuthentication(options =>
{
 options.DefaultAuthenticateScheme = "Identity.Application";
 options.DefaultChallengeScheme = "Identity.Application";
})
.AddJwtBearer(options =>
{
 options.TokenValidationParameters = new TokenValidationParameters
 {
 ValidateIssuer = true,
 ValidateAudience = true,
 ValidateLifetime = true,
 ValidateIssuerSigningKey = true,
 ValidIssuer = jwtIssuer,
 ValidAudience = jwtAudience,
 IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
 };

 options.Events = new JwtBearerEvents
 {
 OnMessageReceived = context =>
 {
 var accessToken = context.Request.Query["access_token"];
 var path = context.HttpContext.Request.Path;
 if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationhub"))
 {
 context.Token = accessToken;
 }
 return Task.CompletedTask;
 }
 };
});

builder.Services.Configure<EmailSettings>(options =>
{
 options.SmtpHost = emailSmtpHost;
 options.SmtpPort = int.Parse(emailSmtpPort ?? "587");
 options.SenderName = emailSenderName;
 options.SenderEmail = emailSenderEmail;
 options.Password = emailPassword;
});

builder.Services.AddAutoMapper(typeof(MindChat.Application.MappingProfiles.AutoMapperProfile));

builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IPsychologistService, PsychologistService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IChatService, ChatService>();
builder.Services.AddScoped<INotificationService, MindChat.Web.Services.NotificationService>();

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Information);

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

builder.Services.AddSignalR(options =>
{
 options.EnableDetailedErrors = true;
});

// Antiforgery configuration so SPA can read token (cookie httpOnly false)
builder.Services.AddAntiforgery(options =>
{
 options.Cookie.Name = "XSRF-TOKEN";
 options.Cookie.HttpOnly = false; // so browser JS can read if needed
 options.HeaderName = "X-XSRF-TOKEN";
});

// CORS to allow Next dev server with credentials
builder.Services.AddCors(options =>
{
 options.AddPolicy("Frontend", policy =>
 {
 policy.WithOrigins("http://localhost:3000")
 .AllowAnyHeader()
 .AllowAnyMethod()
 .AllowCredentials();
 });
});

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options => { options.IdleTimeout = TimeSpan.FromMinutes(30); });

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
 var services = scope.ServiceProvider;

 try
 {
 var context = services.GetRequiredService<ApplicationDbContext>();
 var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();
 var logger = services.GetRequiredService<ILogger<Program>>();
 context.Database.Migrate();
 await IdentitySeeder.SeedCoreAsync(roleManager);
 await TagSeeder.SeedTagAsync(context, logger);
 logger.LogInformation("Migracion y seeding completados exitosamente.");
 }
 catch (Exception ex)
 {
 var logger = services.GetRequiredService<ILogger<Program>>();
 logger.LogError(ex, "Ocurrio un error durante la migracion o el seeding.");
 }
}

if (!app.Environment.IsDevelopment())
{
 app.UseExceptionHandler("/Home/Error");
 app.UseHsts();
}
else
{
 app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseCookiePolicy(new CookiePolicyOptions
{
 MinimumSameSitePolicy = SameSiteMode.Lax
});

app.UseCors("Frontend");

app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
 name: "default",
 pattern: "{controller=Auth}/{action=LoginPatient}/{id?}");

app.MapHub<ChatHub>("/chathub");
app.MapHub<NotificationHub>("/notificationhub");

app.MapRazorPages();

// Antiforgery token endpoint for SPA
app.MapGet("/api/antiforgery", (IAntiforgery antiforgery, HttpContext http) =>
{
 var tokens = antiforgery.GetAndStoreTokens(http);
 return Results.Ok(new { token = tokens.RequestToken });
});

app.Run();