using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MindChat.Application.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace MindChat.Web.Controllers
{
    public class SessionRequestController : Controller
    {
        private readonly ILogger<SessionRequestController> _logger;
        private readonly IPatientService _patientService;
        private readonly IPsychologistService _psychologistService;
        private readonly INotificationService _notificationService;
        private readonly IAuthService _authService;

        public SessionRequestController(
            ILogger<SessionRequestController> logger,
            IPatientService patientService,
            IPsychologistService psychologistService,
            INotificationService notificationService,
            IAuthService authService)
        {
            _logger = logger;
            _patientService = patientService;
            _psychologistService = psychologistService;
            _notificationService = notificationService;
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
        public async Task<IActionResult> Create(int psychologistId, string initialMessage = "Hola, me gustaría iniciar una sesión de chat.")
        {
            var (success, userId) = await GetUserIdFromJwtAsync();
            if (!success)
                return RedirectToAction("LoginPatient", "Auth");

            // Check for existing active chat between patient and psychologist
            var existingChatResult = await _patientService.CheckExistingChatAsync(userId, psychologistId);
            if (existingChatResult.Success && existingChatResult.HasActiveChat)
            {
                TempData["Info"] = "Ya tienes un chat activo con este psicólogo.";
                return RedirectToAction("Index", "Home");
            }

            var result = await _patientService.CreateChatRequestAsync(userId, psychologistId, initialMessage);
            
            if (!result.Success)
            {
                TempData["Error"] = result.Error;
                return RedirectToAction("Index", "Home");
            }

            // Obtener información del paciente y psicólogo para la notificación
            var patient = await _authService.FindByIdAsync(userId);
            var psychologist = await _psychologistService.GetPsychologistInfoAsync(psychologistId);

            if (patient != null && psychologist != null)
            {
                await _notificationService.SendChatRequestNotificationAsync(
                    psychologist.UserId, 
                    result.SessionRequestId, 
                    patient.FullName, 
                    initialMessage);
                
                _logger.LogInformation($"Chat request sent from patient {userId} to psychologist {psychologistId}");
            }

            TempData["Success"] = "Solicitud de chat enviada correctamente";
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Accept(int sessionRequestId)
        {
            var (success, userId) = await GetUserIdFromJwtAsync();
            if (!success)
                return RedirectToAction("LoginPatient", "Auth");

            var result = await _psychologistService.AcceptSessionRequestAsync(userId, sessionRequestId);
            
            if (!result.Success)
            {
                return Json(new { success = false, error = result.Error });
            }

            // Get session request info to notify patient
            var sessionRequestInfo = await _psychologistService.GetSessionRequestInfoAsync(sessionRequestId);
            var psychologist = await _authService.FindByIdAsync(userId);

            if (sessionRequestInfo != null && psychologist != null)
            {
                await _notificationService.SendChatRequestResponseNotificationAsync(
                    sessionRequestInfo.PatientUserId,
                    true,
                    psychologist.FullName);
                
                _logger.LogInformation($"Session request {sessionRequestId} accepted by psychologist {userId}");
            }

            return Json(new { success = true });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Reject(int sessionRequestId)
        {
            var (success, userId) = await GetUserIdFromJwtAsync();
            if (!success)
                return RedirectToAction("LoginPatient", "Auth");

            var result = await _psychologistService.RejectSessionRequestAsync(userId, sessionRequestId);
            
            if (!result.Success)
            {
                return Json(new { success = false, error = result.Error });
            }

            // Get session request info to notify patient
            var sessionRequestInfo = await _psychologistService.GetSessionRequestInfoAsync(sessionRequestId);
            var psychologist = await _authService.FindByIdAsync(userId);

            if (sessionRequestInfo != null && psychologist != null)
            {
                await _notificationService.SendChatRequestResponseNotificationAsync(
                    sessionRequestInfo.PatientUserId,
                    false,
                    psychologist.FullName);
                
                _logger.LogInformation($"Session request {sessionRequestId} rejected by psychologist {userId}");
            }

            return Json(new { success = true });
        }
    }
}