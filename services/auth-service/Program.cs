using System.Text;
using AuthService.Data;
using AuthService.Models;
using AuthService.Services;
using AuthService.Contracts;
using AuthService.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Database Configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseSqlServer(connectionString));

// Identity Configuration
builder.Services.AddIdentity<User, Role>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AuthDbContext>()
.AddDefaultTokenProviders();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] 
    ?? throw new InvalidOperationException("JWT Key not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// HttpClient for Clinical Service
var clinicalServiceUrl = builder.Configuration["Services:ClinicalServiceUrl"] 
    ?? "http://clinical-service";

builder.Services.AddHttpClient<IClinicalServiceClient, ClinicalServiceClient>(client =>
{
    client.BaseAddress = new Uri(clinicalServiceUrl);
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Services Registration
builder.Services.AddScoped<IAuthService, AuthServiceImpl>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// Email Configuration
builder.Services.Configure<EmailSettings>(options =>
{
    options.SmtpHost = builder.Configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
    options.SmtpPort = int.Parse(builder.Configuration["Email:SmtpPort"] ?? "587");
    options.SenderName = builder.Configuration["Email:SenderName"] ?? "MindChat";
    options.SenderEmail = builder.Configuration["Email:SenderEmail"] ?? "";
    options.Password = builder.Configuration["Email:Password"] ?? "";
});

// API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "MindChat Auth Service", 
        Version = "v1",
        Description = "Servicio de autenticación y gestión de usuarios para MindChat"
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    dbContext.Database.EnsureCreated();
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

// Health Check Endpoint
app.MapGet("/health", () => Results.Ok(new { 
    status = "healthy", 
    service = "auth-service",
    timestamp = DateTime.UtcNow 
}))
.WithName("HealthCheck")
.WithTags("Health");

// ====================
// PATIENT ENDPOINTS
// ====================

app.MapPost("/api/auth/patient/register", async (
    RegisterPatientRequest request,
    IAuthService authService) =>
{
    var result = await authService.RegisterPatientAsync(request);
    return result.Success 
        ? Results.Ok(result) 
        : Results.BadRequest(result);
})
.WithName("RegisterPatient")
.WithTags("Patient Authentication")
.WithOpenApi();

app.MapPost("/api/auth/patient/login", async (
    LoginRequest request,
    IAuthService authService) =>
{
    var result = await authService.LoginAsync(request, "Patient");
    return result.Success 
        ? Results.Ok(result) 
        : Results.BadRequest(result);
})
.WithName("LoginPatient")
.WithTags("Patient Authentication")
.WithOpenApi();

// ====================
// PSYCHOLOGIST ENDPOINTS
// ====================

app.MapPost("/api/auth/psychologist/register", async (
    RegisterPsychologistRequest request,
    IAuthService authService) =>
{
    var result = await authService.RegisterPsychologistAsync(request);
    return result.Success 
        ? Results.Ok(result) 
        : Results.BadRequest(result);
})
.WithName("RegisterPsychologist")
.WithTags("Psychologist Authentication")
.WithOpenApi();

app.MapPost("/api/auth/psychologist/login", async (
    LoginRequest request,
    IAuthService authService) =>
{
    var result = await authService.LoginAsync(request, "Psychologist");
    return result.Success 
        ? Results.Ok(result) 
        : Results.BadRequest(result);
})
.WithName("LoginPsychologist")
.WithTags("Psychologist Authentication")
.WithOpenApi();

// ====================
// PASSWORD RECOVERY ENDPOINTS
// ====================

app.MapPost("/api/auth/forgot-password", async (
    ForgotPasswordRequest request,
    IAuthService authService) =>
{
    var result = await authService.ForgotPasswordAsync(request);
    return result.Success 
        ? Results.Ok(result) 
        : Results.BadRequest(result);
})
.WithName("ForgotPassword")
.WithTags("Password Recovery")
.WithOpenApi();

app.MapPost("/api/auth/reset-password", async (
    ResetPasswordRequest request,
    IAuthService authService) =>
{
    var result = await authService.ResetPasswordAsync(request);
    return result.Success 
        ? Results.Ok(result) 
        : Results.BadRequest(result);
})
.WithName("ResetPassword")
.WithTags("Password Recovery")
.WithOpenApi();

// ====================
// USER INFO ENDPOINTS
// ====================

app.MapGet("/api/auth/users/{userId}", async (
    Guid userId,
    AuthDbContext dbContext) =>
{
    var user = await dbContext.Users.FindAsync(userId);
    if (user == null)
        return Results.NotFound(new { message = "User not found" });
    
    return Results.Ok(new 
    {
        userId = user.Id,
        fullName = user.FullName,
        email = user.Email,
        profilePictureUrl = user.ProfilePictureUrl
    });
})
.RequireAuthorization()
.WithName("GetUserById")
.WithTags("User Info")
.WithOpenApi();

app.MapGet("/api/auth/users/batch", async (
    string userIds,
    AuthDbContext dbContext) =>
{
    var ids = userIds.Split(',')
        .Select(id => Guid.TryParse(id.Trim(), out var guid) ? guid : (Guid?)null)
        .Where(id => id.HasValue)
        .Select(id => id!.Value)
        .ToList();
    
    var users = await dbContext.Users
        .Where(u => ids.Contains(u.Id))
        .Select(u => new 
        {
            userId = u.Id,
            fullName = u.FullName,
            email = u.Email,
            profilePictureUrl = u.ProfilePictureUrl
        })
        .ToListAsync();
    
    return Results.Ok(users);
})
.RequireAuthorization()
.WithName("GetUsersByIds")
.WithTags("User Info")
.WithOpenApi();

app.Run();
