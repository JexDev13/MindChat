using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ChatService.Contracts;
using ChatService.Data;
using ChatService.Services;
using ChatService.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Database Configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ChatDbContext>(options =>
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
    
    // Configurar JWT para SignalR
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            
            // Si la petición es para el hub de SignalR y hay un token
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR();

// Services Registration
builder.Services.AddScoped<ISessionRequestService, SessionRequestService>();
builder.Services.AddScoped<IChatService, ChatServiceImpl>();
builder.Services.AddScoped<IMessageService, MessageService>();

// API Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "MindChat Chat Service", 
        Version = "v1",
        Description = "Servicio de gestión de chats, mensajes y solicitudes de sesión para MindChat"
    });
});

// CORS (configurado para SignalR)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", // Next.js dev
                "http://localhost:8080"  // API Gateway
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Necesario para SignalR
    });
});

var app = builder.Build();

// Auto-create database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ChatDbContext>();
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

// ============================================================================
// SESSION REQUEST ENDPOINTS
// ============================================================================
var sessionRequestsGroup = app.MapGroup("/api/session-requests")
    .WithTags("Session Requests");

// GET: Obtener todas las solicitudes de sesión
sessionRequestsGroup.MapGet("/", async (ISessionRequestService service) =>
{
    var requests = await service.GetAllAsync();
    return Results.Ok(requests);
})
.WithName("GetAllSessionRequests")
.Produces<IEnumerable<SessionRequestResponse>>(200);

// GET: Obtener solicitudes pendientes
sessionRequestsGroup.MapGet("/pending", async (ISessionRequestService service) =>
{
    var requests = await service.GetPendingRequestsAsync();
    return Results.Ok(requests);
})
.WithName("GetPendingSessionRequests")
.Produces<IEnumerable<SessionRequestResponse>>(200);

// GET: Obtener solicitud por ID
sessionRequestsGroup.MapGet("/{id:guid}", async (Guid id, ISessionRequestService service) =>
{
    var request = await service.GetByIdAsync(id);
    return request == null 
        ? Results.NotFound(new ErrorResponse("Solicitud no encontrada", 404, DateTime.UtcNow))
        : Results.Ok(request);
})
.WithName("GetSessionRequestById")
.Produces<SessionRequestResponse>(200)
.Produces<ErrorResponse>(404);

// GET: Obtener solicitudes por paciente
sessionRequestsGroup.MapGet("/patient/{patientId:guid}", async (Guid patientId, ISessionRequestService service) =>
{
    var requests = await service.GetByPatientIdAsync(patientId);
    return Results.Ok(requests);
})
.WithName("GetSessionRequestsByPatient")
.Produces<IEnumerable<SessionRequestResponse>>(200);

// GET: Obtener solicitudes por psicólogo
sessionRequestsGroup.MapGet("/psychologist/{psychologistId:guid}", async (Guid psychologistId, ISessionRequestService service) =>
{
    var requests = await service.GetByPsychologistIdAsync(psychologistId);
    return Results.Ok(requests);
})
.WithName("GetSessionRequestsByPsychologist")
.Produces<IEnumerable<SessionRequestResponse>>(200);

// POST: Crear nueva solicitud de sesión
sessionRequestsGroup.MapPost("/", async (CreateSessionRequestRequest request, ISessionRequestService service) =>
{
    var sessionRequest = await service.CreateAsync(request);
    return Results.Created($"/api/session-requests/{sessionRequest.Id}", sessionRequest);
})
.WithName("CreateSessionRequest")
.Produces<SessionRequestResponse>(201);

// PUT: Asignar psicólogo a solicitud
sessionRequestsGroup.MapPut("/{id:guid}/assign-psychologist", 
    async (Guid id, AssignPsychologistRequest request, ISessionRequestService service) =>
{
    var sessionRequest = await service.AssignPsychologistAsync(id, request.PsychologistId);
    return sessionRequest == null 
        ? Results.NotFound(new ErrorResponse("Solicitud no encontrada", 404, DateTime.UtcNow))
        : Results.Ok(sessionRequest);
})
.WithName("AssignPsychologist")
.Produces<SessionRequestResponse>(200)
.Produces<ErrorResponse>(404);

// PATCH: Actualizar estado de solicitud
sessionRequestsGroup.MapPatch("/{id:guid}/status", 
    async (Guid id, UpdateSessionStatusRequest request, ISessionRequestService service) =>
{
    if (request.Status != "Pending" && request.Status != "Accepted" && request.Status != "Rejected")
    {
        return Results.BadRequest(new ErrorResponse(
            "Estado inválido. Debe ser: Pending, Accepted o Rejected", 400, DateTime.UtcNow));
    }

    var sessionRequest = await service.UpdateStatusAsync(id, request.Status);
    return sessionRequest == null 
        ? Results.NotFound(new ErrorResponse("Solicitud no encontrada", 404, DateTime.UtcNow))
        : Results.Ok(sessionRequest);
})
.WithName("UpdateSessionRequestStatus")
.Produces<SessionRequestResponse>(200)
.Produces<ErrorResponse>(400)
.Produces<ErrorResponse>(404);

// DELETE: Eliminar solicitud
sessionRequestsGroup.MapDelete("/{id:guid}", async (Guid id, ISessionRequestService service) =>
{
    var result = await service.DeleteAsync(id);
    return result 
        ? Results.NoContent()
        : Results.NotFound(new ErrorResponse("Solicitud no encontrada", 404, DateTime.UtcNow));
})
.WithName("DeleteSessionRequest")
.Produces(204)
.Produces<ErrorResponse>(404);

// ============================================================================
// CHAT ENDPOINTS
// ============================================================================
var chatsGroup = app.MapGroup("/api/chats")
    .WithTags("Chats");

// GET: Obtener chat por ID
chatsGroup.MapGet("/{id:guid}", async (Guid id, IChatService service) =>
{
    var chat = await service.GetByIdAsync(id);
    return chat == null 
        ? Results.NotFound(new ErrorResponse("Chat no encontrado", 404, DateTime.UtcNow))
        : Results.Ok(chat);
})
.WithName("GetChatById")
.Produces<ChatResponse>(200)
.Produces<ErrorResponse>(404);

// GET: Obtener chat con mensajes
chatsGroup.MapGet("/{id:guid}/with-messages", async (Guid id, IChatService service) =>
{
    var chat = await service.GetWithMessagesAsync(id);
    return chat == null 
        ? Results.NotFound(new ErrorResponse("Chat no encontrado", 404, DateTime.UtcNow))
        : Results.Ok(chat);
})
.WithName("GetChatWithMessages")
.Produces<ChatDetailResponse>(200)
.Produces<ErrorResponse>(404);

// GET: Obtener chat por solicitud de sesión
chatsGroup.MapGet("/session-request/{sessionRequestId:guid}", async (Guid sessionRequestId, IChatService service) =>
{
    var chat = await service.GetBySessionRequestIdAsync(sessionRequestId);
    return chat == null 
        ? Results.NotFound(new ErrorResponse("Chat no encontrado", 404, DateTime.UtcNow))
        : Results.Ok(chat);
})
.WithName("GetChatBySessionRequest")
.Produces<ChatResponse>(200)
.Produces<ErrorResponse>(404);

// POST: Crear nuevo chat
chatsGroup.MapPost("/", async (CreateChatRequest request, IChatService service) =>
{
    try
    {
        var chat = await service.CreateAsync(request.SessionRequestId);
        return Results.Created($"/api/chats/{chat.Id}", chat);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new ErrorResponse(ex.Message, 400, DateTime.UtcNow));
    }
})
.WithName("CreateChat")
.Produces<ChatResponse>(201)
.Produces<ErrorResponse>(400);

// PATCH: Cerrar chat
chatsGroup.MapPatch("/{id:guid}/close", async (Guid id, IChatService service) =>
{
    var result = await service.CloseAsync(id);
    return result 
        ? Results.Ok(new { Message = "Chat cerrado exitosamente" })
        : Results.NotFound(new ErrorResponse("Chat no encontrado", 404, DateTime.UtcNow));
})
.WithName("CloseChat")
.Produces(200)
.Produces<ErrorResponse>(404);

// DELETE: Eliminar chat
chatsGroup.MapDelete("/{id:guid}", async (Guid id, IChatService service) =>
{
    var result = await service.DeleteAsync(id);
    return result 
        ? Results.NoContent()
        : Results.NotFound(new ErrorResponse("Chat no encontrado", 404, DateTime.UtcNow));
})
.WithName("DeleteChat")
.Produces(204)
.Produces<ErrorResponse>(404);

// ============================================================================
// MESSAGE ENDPOINTS
// ============================================================================
var messagesGroup = app.MapGroup("/api/messages")
    .WithTags("Messages");

// GET: Obtener mensajes de un chat
messagesGroup.MapGet("/chat/{chatId:guid}", async (Guid chatId, IMessageService service) =>
{
    var messages = await service.GetChatMessagesAsync(chatId);
    return Results.Ok(messages);
})
.WithName("GetChatMessages")
.Produces<IEnumerable<ChatMessageResponse>>(200);

// POST: Enviar mensaje
messagesGroup.MapPost("/", async (SendMessageRequest request, IMessageService service) =>
{
    try
    {
        var message = await service.SendMessageAsync(request);
        return Results.Created($"/api/messages/{message.Id}", message);
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new ErrorResponse(ex.Message, 400, DateTime.UtcNow));
    }
})
.WithName("SendMessage")
.Produces<ChatMessageResponse>(201)
.Produces<ErrorResponse>(400);

// DELETE: Eliminar mensaje
messagesGroup.MapDelete("/{id:guid}", async (Guid id, IMessageService service) =>
{
    var result = await service.DeleteMessageAsync(id);
    return result 
        ? Results.NoContent()
        : Results.NotFound(new ErrorResponse("Mensaje no encontrado", 404, DateTime.UtcNow));
})
.WithName("DeleteMessage")
.Produces(204)
.Produces<ErrorResponse>(404);

// ============================================================================
// HEALTH CHECK
// ============================================================================
app.MapGet("/health", () => Results.Ok(new { 
    Status = "Healthy", 
    Service = "Chat Service",
    Timestamp = DateTime.UtcNow 
}))
.WithName("HealthCheck")
.WithTags("Health");

// SignalR Hub
app.MapHub<ChatHub>("/chatHub");

app.Run();
