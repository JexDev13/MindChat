using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MindChat.Application.Interfaces;
using MindChat.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace MindChat.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IPatientService _patientService;
        private readonly IPsychologistService _psychologistService;
        private readonly IAuthService _authService;
        private readonly ITokenService _tokenService;

        public HomeController(
            ILogger<HomeController> logger,
            IPatientService patientService,
            IPsychologistService psychologistService,
            IAuthService authService,
            ITokenService tokenService
        )
        {
            _logger = logger;
            _authService = authService;
            _psychologistService = psychologistService;
            _patientService = patientService;
            _tokenService = tokenService;
        }

        public async Task<IActionResult> Index()
        {
            var jwt = HttpContext.Session.GetString("JWT");
            if (string.IsNullOrEmpty(jwt))
            {
                _logger.LogWarning("No hay sesión activa. Redirigiendo a login.");
                return RedirectToAction("LoginPatient", "Auth");
            }
            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
                    ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY")!))
                };

                var jwtToken = tokenHandler.ReadJwtToken(jwt);
                var principal = tokenHandler.ValidateToken(jwt, validationParameters, out var validatedToken);

                var userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
                var email = jwtToken.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
                var activeProfile = jwtToken.Claims.FirstOrDefault(c => c.Type == "activeProfile")?.Value;

                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var userIdInt))
                {
                    _logger.LogWarning("UserId inválido en el token.");
                    return RedirectToAction("LoginPatient", "Auth");
                }

                _logger.LogInformation($"Token válido. UserId: {userIdInt}, Email: {email}, Profile: {activeProfile}");

                var user = await _authService.FindByIdAsync(userIdInt);
                if (user == null)
                    return NotFound("No existe el usuario");

                IEnumerable<Chat> chats = Enumerable.Empty<Chat>();
                IEnumerable<Psychologist> visiblePsychologists = Enumerable.Empty<Psychologist>();
                IEnumerable<Appointment> appointments = Enumerable.Empty<Appointment>();

                if (string.Equals(activeProfile, "Patient", StringComparison.OrdinalIgnoreCase))
                {
                    chats = await _patientService.GetChatsAsync(userIdInt);
                    visiblePsychologists = await _patientService.GetVisiblePsychologistsAsync();
                    ViewData["Psychologists"] = visiblePsychologists;
                }
                else if (string.Equals(activeProfile, "Psychologist", StringComparison.OrdinalIgnoreCase))
                {
                    chats = await _psychologistService.GetChatsAsync(userIdInt);
                    appointments = await _psychologistService.GetAppointmentsAsync(userIdInt);
                    ViewData["Appointments"] = appointments;
                }

                ViewData["UserName"] = user.FullName;
                ViewData["ActiveProfile"] = activeProfile;
                ViewData["Chats"] = chats;

                return View();
            }
            catch (SecurityTokenException ex)
            {
                _logger.LogWarning($"Token inválido: {ex.Message}");
                return RedirectToAction("LoginPatient", "Auth");
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SwitchProfile()
        {
            var currentProfile = HttpContext.Session.GetString("ActiveProfile") ?? "Patient";
            var newProfile = currentProfile == "Patient" ? "Psychologist" : "Patient";
            HttpContext.Session.SetString("ActiveProfile", newProfile);
            return RedirectToAction("Index");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            try
            {
                await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                HttpContext.Session.Clear();
                if (Request.Cookies.ContainsKey("JWT"))
                {
                    Response.Cookies.Delete("JWT");
                }

                _logger.LogInformation("Usuario desconectado correctamente.");

                return RedirectToAction("LoginPatient", "Auth");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cerrar sesión.");
                return RedirectToAction("LoginPatient", "Auth");
            }
        }
    }
}