using System.Text;
using ClinicalService.Contracts;
using ClinicalService.Data;
using ClinicalService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Database Configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ClinicalDbContext>(options =>
    options.UseSqlServer(connectionString));

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] 
    ?? throw new InvalidOperationException("JWT Key not configured");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
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

// Services Registration
builder.Services.AddScoped<IPatientService, PatientService>();
builder.Services.AddScoped<IPsychologistService, PsychologistService>();

// API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "MindChat Clinical Service", 
        Version = "v1",
        Description = "Servicio de gestión de perfiles clínicos para MindChat"
    });
    
    // JWT Authorization in Swagger
    c.AddSecurityDefinition("Bearer", new()
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
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
app.UseAuthentication();
app.UseAuthorization();

// Health Check Endpoint
app.MapGet("/health", () => Results.Ok(new { 
    status = "healthy", 
    service = "clinical-service",
    timestamp = DateTime.UtcNow 
}))
.WithName("HealthCheck")
.WithTags("Health");

// ====================
// PATIENT ENDPOINTS
// ====================

app.MapPost("/api/patients", async (
    CreatePatientProfileRequest request,
    IPatientService patientService) =>
{
    var result = await patientService.CreateProfileAsync(request);
    return result != null 
        ? Results.Ok(new ProfileCreatedResponse { ProfileId = result.ProfileId }) 
        : Results.BadRequest(new ErrorResponse { Errors = new[] { "Error al crear perfil de paciente" } });
})
.WithName("CreatePatientProfile")
.WithTags("Patients")
.WithOpenApi();

app.MapGet("/api/patients/user/{userId:guid}", async (
    Guid userId,
    IPatientService patientService) =>
{
    var result = await patientService.GetProfileByUserIdAsync(userId);
    return result != null ? Results.Ok(result) : Results.NotFound();
})
.RequireAuthorization()
.WithName("GetPatientByUserId")
.WithTags("Patients")
.WithOpenApi();

app.MapGet("/api/patients/{profileId:guid}", async (
    Guid profileId,
    IPatientService patientService) =>
{
    var result = await patientService.GetProfileByIdAsync(profileId);
    return result != null ? Results.Ok(result) : Results.NotFound();
})
.RequireAuthorization()
.WithName("GetPatientById")
.WithTags("Patients")
.WithOpenApi();

app.MapPut("/api/patients/user/{userId:guid}", async (
    Guid userId,
    UpdatePatientProfileRequest request,
    IPatientService patientService) =>
{
    var success = await patientService.UpdateProfileAsync(userId, request);
    return success ? Results.Ok() : Results.NotFound();
})
.RequireAuthorization()
.WithName("UpdatePatientProfile")
.WithTags("Patients")
.WithOpenApi();

app.MapDelete("/api/patients/user/{userId:guid}", async (
    Guid userId,
    IPatientService patientService) =>
{
    var success = await patientService.DeleteProfileAsync(userId);
    return success ? Results.NoContent() : Results.NotFound();
})
.RequireAuthorization()
.WithName("DeletePatientProfile")
.WithTags("Patients")
.WithOpenApi();

// ====================
// PSYCHOLOGIST ENDPOINTS
// ====================

app.MapPost("/api/psychologists", async (
    CreatePsychologistProfileRequest request,
    IPsychologistService psychologistService) =>
{
    var result = await psychologistService.CreateProfileAsync(request);
    return result != null 
        ? Results.Ok(new ProfileCreatedResponse { ProfileId = result.ProfileId }) 
        : Results.BadRequest(new ErrorResponse { Errors = new[] { "Error al crear perfil de psicólogo" } });
})
.WithName("CreatePsychologistProfile")
.WithTags("Psychologists")
.WithOpenApi();

app.MapGet("/api/psychologists/user/{userId:guid}", async (
    Guid userId,
    IPsychologistService psychologistService) =>
{
    var result = await psychologistService.GetProfileByUserIdAsync(userId);
    return result != null ? Results.Ok(result) : Results.NotFound();
})
.RequireAuthorization()
.WithName("GetPsychologistByUserId")
.WithTags("Psychologists")
.WithOpenApi();

app.MapGet("/api/psychologists/{profileId:guid}", async (
    Guid profileId,
    IPsychologistService psychologistService) =>
{
    var result = await psychologistService.GetProfileByIdAsync(profileId);
    return result != null ? Results.Ok(result) : Results.NotFound();
})
.RequireAuthorization()
.WithName("GetPsychologistById")
.WithTags("Psychologists")
.WithOpenApi();

app.MapGet("/api/psychologists", async (
    IPsychologistService psychologistService) =>
{
    var result = await psychologistService.GetAllVisibleProfilesAsync();
    return Results.Ok(result);
})
.RequireAuthorization()
.WithName("GetAllPsychologists")
.WithTags("Psychologists")
.WithOpenApi();

app.MapGet("/api/psychologists/search/tags", async (
    [Microsoft.AspNetCore.Mvc.FromQuery] string tags,
    IPsychologistService psychologistService) =>
{
    var tagList = tags.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
    var result = await psychologistService.SearchByTagsAsync(tagList);
    return Results.Ok(result);
})
.RequireAuthorization()
.WithName("SearchPsychologistsByTags")
.WithTags("Psychologists")
.WithOpenApi();

app.MapPut("/api/psychologists/user/{userId:guid}", async (
    Guid userId,
    UpdatePsychologistProfileRequest request,
    IPsychologistService psychologistService) =>
{
    var success = await psychologistService.UpdateProfileAsync(userId, request);
    return success ? Results.Ok() : Results.NotFound();
})
.RequireAuthorization()
.WithName("UpdatePsychologistProfile")
.WithTags("Psychologists")
.WithOpenApi();

app.MapDelete("/api/psychologists/user/{userId:guid}", async (
    Guid userId,
    IPsychologistService psychologistService) =>
{
    var success = await psychologistService.DeleteProfileAsync(userId);
    return success ? Results.NoContent() : Results.NotFound();
})
.RequireAuthorization()
.WithName("DeletePsychologistProfile")
.WithTags("Psychologists")
.WithOpenApi();

app.Run();
