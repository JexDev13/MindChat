using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MindChat.Domain.Entities;
using MindChat.Infrastructure.Data;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using MindChat.Web.Services;
var builder = WebApplication.CreateBuilder(args);

Env.Load();

var dbServer = Environment.GetEnvironmentVariable("DB_SERVER");
var dbName = Environment.GetEnvironmentVariable("DB_NAME");
var dbUser = Environment.GetEnvironmentVariable("DB_USER");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

var connectionString =
    $"Server={dbServer};Database={dbName};User Id={dbUser};Password={dbPassword};Encrypt=True;TrustServerCertificate=False;";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        connectionString,
        b => b.MigrationsAssembly("MindChat.Infrastructure")
    )
);

builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;

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

// JWT Authentication
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey = jwtSection["Key"];
if (string.IsNullOrEmpty(jwtKey))
{
    // If no key set, try environment variable
    jwtKey = Environment.GetEnvironmentVariable("JWT_KEY");
}

builder.Services.AddSingleton<IJwtService, JwtService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = true;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey ?? string.Empty))
    };
});

// 4. Configurar AutoMapper
//builder.Services.AddAutoMapper(typeof(MindChat.Application.MappingProfiles.AutoMapperProfile));

// 5. Agregar servicios de aplicaci�n (descomentar cuando los crees)
// builder.Services.AddScoped<IPatientService, PatientService>();
// builder.Services.AddScoped<IPsychologistService, PsychologistService>();
// builder.Services.AddScoped<IAppointmentService, AppointmentService>();

builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole<int>>>();

        var skipMigrations = Environment.GetEnvironmentVariable("SKIP_MIGRATIONS");
        if (string.IsNullOrEmpty(skipMigrations) || skipMigrations != "1")
        {
            try
            {
                context.Database.Migrate();
            }
            catch (Exception migEx)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogWarning(migEx, "Se produjo un error al aplicar migraciones automáticas. Saltando migraciones automáticas.");
            }

            try
            {
                await SeedRoles(roleManager);
            }
            catch (Exception seedEx)
            {
                var logger = services.GetRequiredService<ILogger<Program>>();
                logger.LogWarning(seedEx, "Se produjo un error al ejecutar el seed de roles.");
            }
        }
        else
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("SKIP_MIGRATIONS=1 detectado: se omiten migraciones automáticas en el arranque.");
        }

    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Ocurri� un error durante la migraci�n o seed de datos.");
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapRazorPages();

app.Run();

static async Task SeedRoles(RoleManager<IdentityRole<int>> roleManager)
{
    string[] roleNames = { "Psychologist", "Patient" };

    foreach (var roleName in roleNames)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole<int>(roleName));
        }
    }
}