using System.Text;
using AuthService.Data;
using AuthService.Models;
using AuthService.Services;
using AuthService.Contracts;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Prometheus;

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

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Prometheus metrics middleware
app.UseHttpMetrics();

app.UseAuthentication();
app.UseAuthorization();

// Prometheus metrics endpoint
app.MapMetrics();

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

app.Run();
