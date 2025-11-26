using Microsoft.AspNetCore.Mvc;

namespace MindChat.Web.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        public IActionResult Index()
        {
            // Obtener perfil activo de la sesión
            var activeProfile = HttpContext.Session.GetString("ActiveProfile") ?? "Patient";

            _logger.LogInformation("=== INDEX ACTION ===");
            _logger.LogInformation($"Perfil obtenido de sesión: {activeProfile}");

            // Si no existe en sesión, establecerlo
            if (HttpContext.Session.GetString("ActiveProfile") == null)
            {
                HttpContext.Session.SetString("ActiveProfile", activeProfile);
                _logger.LogInformation($"Perfil establecido en sesión por primera vez: {activeProfile}");
            }

            var userName = activeProfile == "Patient" ? "Pedro Ramon" : "Lucia Fernanda";
            var participantName = activeProfile == "Patient" ? "Lucia Fernanda" : "Pedro Ramon";

            _logger.LogInformation($"UserName: {userName}");
            _logger.LogInformation($"ParticipantName: {participantName}");
            _logger.LogInformation($"ChatId: 1");
            _logger.LogInformation("===================");

            // Pasar datos a la vista
            ViewData["ActiveProfile"] = activeProfile;
            ViewData["UserName"] = userName;
            ViewData["ParticipantName"] = participantName;
            ViewData["ChatId"] = 1;

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult SwitchProfile()
        {
            _logger.LogInformation("=== SWITCH PROFILE ACTION ===");

            // Obtener perfil actual
            var currentProfile = HttpContext.Session.GetString("ActiveProfile") ?? "Patient";
            _logger.LogInformation($"Perfil actual antes del cambio: {currentProfile}");

            // Cambiar al otro perfil
            var newProfile = currentProfile == "Patient" ? "Psychologist" : "Patient";
            _logger.LogInformation($"Nuevo perfil a establecer: {newProfile}");

            // Guardar en sesión
            HttpContext.Session.SetString("ActiveProfile", newProfile);
            _logger.LogInformation($"Perfil guardado en sesión: {newProfile}");

            // Verificar que se guardó correctamente
            var verifyProfile = HttpContext.Session.GetString("ActiveProfile");
            _logger.LogInformation($"Verificación - Perfil en sesión después de guardar: {verifyProfile}");

            if (verifyProfile != newProfile)
            {
                _logger.LogError($"ERROR: El perfil no se guardó correctamente. Esperado: {newProfile}, Obtenido: {verifyProfile}");
            }

            _logger.LogInformation("Redirigiendo a Index...");
            _logger.LogInformation("=============================");

            return RedirectToAction("Index");
        }
    }
}