using Ocelot.DependencyInjection;
using Ocelot.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Prometheus;

var builder = WebApplication.CreateBuilder(args);

// Add Ocelot configuration
builder.Configuration.AddJsonFile("ocelot.json", optional: false, reloadOnChange: true);

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "SuperSecretKeyForDevelopmentPurposesOnly123456789";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer("Bearer", options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "MindChat",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "MindChat",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// Add Ocelot
builder.Services.AddOcelot();

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

app.UseCors("AllowAll");

// Prometheus metrics middleware
app.UseHttpMetrics();

// Prometheus metrics endpoint - DEBE ir antes de Ocelot
// Usamos MapWhen para interceptar /metrics antes de que Ocelot tome control
app.MapWhen(
    context => context.Request.Path.StartsWithSegments("/metrics"),
    appBranch => appBranch.UseRouting().UseEndpoints(endpoints => endpoints.MapMetrics())
);

// Use Ocelot (captura todas las demás rutas)
await app.UseOcelot();

app.Run();
