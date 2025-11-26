using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MindChat.Application.DTOs.Patients;
using MindChat.Application.DTOs.Psychologists;
using MindChat.Application.Interfaces;
using MindChat.Application.Services;
using MindChat.Domain.Enums;

public class AuthController : Controller
{
    private readonly IPatientService _patientService;
    private readonly IPsychologistService _psychologistService;
    private readonly ILogger<AuthController> _logger;
    private readonly ITokenService _tokenService;
    private readonly IAuthService _authService;

    public AuthController(
        IPatientService patientService, 
        ILogger<AuthController> logger, 
        IPsychologistService psychologistService,
        ITokenService tokenService,
        IAuthService authService
        )
    {
        _patientService = patientService;
        _logger = logger;
        _psychologistService = psychologistService;
        _tokenService = tokenService;
        _authService = authService;
    }

    [HttpGet] public IActionResult LoginPatient() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> LoginPatient(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            ModelState.AddModelError("", "Usuario y contraseña son requeridos.");
            return View();
        }

        var user = await _authService.FindByUsernameAsync(username);
        if (user == null)
        {
            ModelState.AddModelError("", "Usuario o contraseña inválidos.");
            return View();
        }

        var passwordValid = await _authService.CheckPasswordAsync(user, password);
        if (!passwordValid)
        {
            ModelState.AddModelError("", "Usuario o contraseña inválidos.");
            return View();
        }

        var roles = await _authService.GetRolesAsync(user);
        var token = _tokenService.GenerateToken(user, UserRole.Patient.ToString(), roles);

        HttpContext.Session.SetString("JWT", token);

        return RedirectToAction("Index", "Home");
    }

    [HttpGet] public IActionResult ForgotPassword() => View(); 
    [HttpGet] public IActionResult LoginPsychologist() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> LoginPsychologist(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        {
            ModelState.AddModelError("", "Usuario y contraseña son requeridos.");
            return View();
        }

        var user = await _authService.FindByUsernameAsync(username);
        if (user == null)
        {
            ModelState.AddModelError("", "Usuario o contraseña inválidos.");
            return View();
        }

        var passwordValid = await _authService.CheckPasswordAsync(user, password);
        if (!passwordValid)
        {
            ModelState.AddModelError("", "Usuario o contraseña inválidos.");
            return View();
        }

        var roles = await _authService.GetRolesAsync(user);
        var token = _tokenService.GenerateToken(user, UserRole.Patient.ToString(), roles);

        HttpContext.Session.SetString("JWT", token);

        return RedirectToAction("Index", "Home");
    }

    [HttpGet]
    public IActionResult RegisterPatient() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RegisterPatient([FromForm] RegisterPatientDto dto)
    {
        if (!ModelState.IsValid)
            return View(dto);

        var (success, errors) = await _patientService.RegisterAsync(dto);
        if (!success)
        {
            foreach (var error in errors)
                ModelState.AddModelError("", error);

            return View(dto);
        }

        return RedirectToAction("LoginPatient");
    }

    [HttpGet]
    public IActionResult RegisterPsychologist() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RegisterPsychologist(RegisterPsychologistDto dto)
    {
        if (!ModelState.IsValid) return View(dto);

        var (success, errors) = await _psychologistService.RegisterAsync(dto);
        if (!success)
        {
            foreach (var err in errors) ModelState.AddModelError("", err);
            return View(dto);
        }

        return RedirectToAction("LoginPsychologist");
    }
}
