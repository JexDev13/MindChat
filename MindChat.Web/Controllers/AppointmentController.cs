using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MindChat.Application.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace MindChat.Web.Controllers
{
    public class AppointmentController : Controller
    {
        private readonly ILogger<AppointmentController> _logger;
        private readonly IPsychologistService _psychologistService;
        private readonly IAuthService _authService;

        public AppointmentController(
            ILogger<AppointmentController> logger,
            IPsychologistService psychologistService,
            IAuthService authService)
        {
            _logger = logger;
            _psychologistService = psychologistService;
            _authService = authService;
        }

        private async Task<(bool Success, int UserId)> GetUserIdFromJwtAsync()
        {
            var jwt = HttpContext.Session.GetString("JWT");
            if (string.IsNullOrEmpty(jwt))
                return (false, 0);

            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(jwt);
                var userId = jwtToken.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

                if (string.IsNullOrEmpty(userId) || !int.TryParse(userId, out var userIdInt))
                    return (false, 0);

                return (true, userIdInt);
            }
            catch
            {
                return (false, 0);
            }
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(int chatId, DateTime scheduledAt, string notes = "")
        {
            var (success, userId) = await GetUserIdFromJwtAsync();
            if (!success)
                return Json(new { success = false, error = "Usuario no autenticado" });

            var result = await _psychologistService.CreateAppointmentFromChatAsync(userId, chatId, scheduledAt, notes);
            
            if (!result.Success)
            {
                return Json(new { success = false, error = result.Error });
            }

            _logger.LogInformation($"Appointment created by psychologist {userId} for chat {chatId}");

            return Json(new { success = true, message = "Cita agendada exitosamente" });
        }
    }
}