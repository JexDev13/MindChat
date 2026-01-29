using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ServicioCitas.Contracts;
using ServicioCitas.Data;
using ServicioCitas.Services;

var builder = WebApplication.CreateBuilder(args);

// Database Configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppointmentDbContext>(options =>
    options.UseSqlServer(connectionString));

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

// Services Registration
builder.Services.AddScoped<IAppointmentService, AppointmentService>();

// API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "MindChat Appointment Service", 
        Version = "v1",
        Description = "Servicio de gestión de citas para MindChat"
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

// Auto-create database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppointmentDbContext>();
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

// Endpoints
var appointmentsGroup = app.MapGroup("/api/appointments")
    .WithTags("Appointments");

// GET: Obtener todas las citas
appointmentsGroup.MapGet("/", async (IAppointmentService service) =>
{
    var appointments = await service.GetAllAsync();
    return Results.Ok(appointments);
})
.WithName("GetAllAppointments")
.Produces<IEnumerable<AppointmentResponse>>(200);

// GET: Obtener cita por ID
appointmentsGroup.MapGet("/{id:guid}", async (Guid id, IAppointmentService service) =>
{
    var appointment = await service.GetByIdAsync(id);
    return appointment == null 
        ? Results.NotFound(new ErrorResponse("Cita no encontrada", 404, DateTime.UtcNow))
        : Results.Ok(appointment);
})
.WithName("GetAppointmentById")
.Produces<AppointmentResponse>(200)
.Produces<ErrorResponse>(404);

// GET: Obtener citas por psicólogo
appointmentsGroup.MapGet("/psychologist/{psychologistId:guid}", async (Guid psychologistId, IAppointmentService service) =>
{
    var appointments = await service.GetByPsychologistIdAsync(psychologistId);
    return Results.Ok(appointments);
})
.WithName("GetAppointmentsByPsychologist")
.Produces<IEnumerable<AppointmentResponse>>(200);

// GET: Obtener citas por paciente
appointmentsGroup.MapGet("/patient/{patientId:guid}", async (Guid patientId, IAppointmentService service) =>
{
    var appointments = await service.GetByPatientIdAsync(patientId);
    return Results.Ok(appointments);
})
.WithName("GetAppointmentsByPatient")
.Produces<IEnumerable<AppointmentResponse>>(200);

// POST: Crear nueva cita
appointmentsGroup.MapPost("/", async (CreateAppointmentRequest request, IAppointmentService service) =>
{
    if (request.ScheduledAt < DateTime.UtcNow)
    {
        return Results.BadRequest(new ErrorResponse(
            "La fecha de la cita debe ser en el futuro", 400, DateTime.UtcNow));
    }

    var appointment = await service.CreateAsync(request);
    return Results.Created($"/api/appointments/{appointment.Id}", appointment);
})
.WithName("CreateAppointment")
.Produces<AppointmentResponse>(201)
.Produces<ErrorResponse>(400);

// PUT: Actualizar cita
appointmentsGroup.MapPut("/{id:guid}", async (Guid id, UpdateAppointmentRequest request, IAppointmentService service) =>
{
    var appointment = await service.UpdateAsync(id, request);
    return appointment == null 
        ? Results.NotFound(new ErrorResponse("Cita no encontrada o cancelada", 404, DateTime.UtcNow))
        : Results.Ok(appointment);
})
.WithName("UpdateAppointment")
.Produces<AppointmentResponse>(200)
.Produces<ErrorResponse>(404);

// PATCH: Cancelar cita
appointmentsGroup.MapPatch("/{id:guid}/cancel", async (Guid id, IAppointmentService service) =>
{
    var result = await service.CancelAsync(id);
    return result 
        ? Results.Ok(new { Message = "Cita cancelada exitosamente" })
        : Results.NotFound(new ErrorResponse("Cita no encontrada", 404, DateTime.UtcNow));
})
.WithName("CancelAppointment")
.Produces(200)
.Produces<ErrorResponse>(404);

// DELETE: Eliminar cita
appointmentsGroup.MapDelete("/{id:guid}", async (Guid id, IAppointmentService service) =>
{
    var result = await service.DeleteAsync(id);
    return result 
        ? Results.NoContent()
        : Results.NotFound(new ErrorResponse("Cita no encontrada", 404, DateTime.UtcNow));
})
.WithName("DeleteAppointment")
.Produces(204)
.Produces<ErrorResponse>(404);

// Health Check
app.MapGet("/health", () => Results.Ok(new { 
    Status = "Healthy", 
    Service = "Appointment Service",
    Timestamp = DateTime.UtcNow 
}))
.WithName("HealthCheck")
.WithTags("Health");

app.Run();
