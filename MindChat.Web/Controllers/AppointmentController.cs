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

        [HttpGet]
        public async Task<IActionResult> Search(string? patientName, DateTime? fromDate, DateTime? toDate)
        {
            var (success, userId) = await GetUserIdFromJwtAsync();
            if (!success)
                return Json(new { success = false, error = "Usuario no autenticado" });

            var appointments = await _psychologistService.SearchAppointmentsAsync(userId, patientName, fromDate, toDate);
            
            var appointmentData = appointments.Select(a => new
            {
                id = a.Id,
                patientName = a.Patient.User.FullName,
                scheduledAt = a.ScheduledAt.ToString("yyyy-MM-ddTHH:mm"),
                notes = a.Notes,
                scheduledAtFormatted = a.ScheduledAt.ToString("g")
            });

            return Json(new { success = true, appointments = appointmentData });
        }

        [HttpGet]
        public async Task<IActionResult> Get(int appointmentId)
        {
            var (success, userId) = await GetUserIdFromJwtAsync();
            if (!success)
                return Json(new { success = false, error = "Usuario no autenticado" });

            var appointment = await _psychologistService.GetAppointmentAsync(userId, appointmentId);
            
            if (appointment == null)
                return Json(new { success = false, error = "Cita no encontrada" });

            var appointmentData = new
            {
                id = appointment.Id,
                patientName = appointment.Patient.User.FullName,
                scheduledAt = appointment.ScheduledAt.ToString("yyyy-MM-ddTHH:mm"),
                notes = appointment.Notes
            };

            return Json(new { success = true, appointment = appointmentData });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Update(int appointmentId, DateTime scheduledAt, string notes = "")
        {
            var (success, userId) = await GetUserIdFromJwtAsync();
            if (!success)
                return Json(new { success = false, error = "Usuario no autenticado" });

            var result = await _psychologistService.UpdateAppointmentAsync(userId, appointmentId, scheduledAt, notes);
            
            if (!result.Success)
            {
                return Json(new { success = false, error = result.Error });
            }

            _logger.LogInformation($"Appointment {appointmentId} updated by psychologist {userId}");

            return Json(new { success = true, message = "Cita actualizada exitosamente" });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int appointmentId)
        {
            var (success, userId) = await GetUserIdFromJwtAsync();
            if (!success)
                return Json(new { success = false, error = "Usuario no autenticado" });

            var result = await _psychologistService.DeleteAppointmentAsync(userId, appointmentId);
            
            if (!result.Success)
            {
                return Json(new { success = false, error = result.Error });
            }

            _logger.LogInformation($"Appointment {appointmentId} deleted by psychologist {userId}");

            return Json(new { success = true, message = "Cita eliminada exitosamente" });
        }
    }
}