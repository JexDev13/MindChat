using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MindChat.Application.DTOs.Auth;
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
    private readonly IEmailService _emailService;

    public AuthController(
        IPatientService patientService, 
        ILogger<AuthController> logger, 
        IPsychologistService psychologistService,
        ITokenService tokenService,
        IAuthService authService,
        IEmailService emailService
        )
    {
        _patientService = patientService;
        _logger = logger;
        _psychologistService = psychologistService;
        _tokenService = tokenService;
        _authService = authService;
        _emailService = emailService;
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

    [HttpGet] public IActionResult ForgotPassword() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        if (!ModelState.IsValid)
            return View(dto);

        var user = await _authService.FindByUsernameAsync(dto.Email);
        if (user == null)
        {
            return RedirectToAction("ForgotPasswordConfirmation");
        }

        var token = await _authService.GeneratePasswordResetTokenAsync(user);

        var resetLink = Url.Action(
            "ResetPassword",
            "Auth",
            new { email = user.Email, token = token },
            Request.Scheme);

        var htmlMessage = $"<p>Hola, haz clic <a href='{resetLink}'>aquí</a> para restablecer tu contraseña.</p>";
        await _emailService.SendEmailAsync(user.Email, "Restablecer contraseña - MindChat", htmlMessage);

        _logger.LogInformation($"Password reset link: {resetLink}");

        return RedirectToAction("ForgotPasswordConfirmation");
    }

    [HttpGet] public IActionResult ForgotPasswordConfirmation() => View();

    [HttpGet]
    public IActionResult ResetPassword(string email, string token)
    {
        return View(new ResetPasswordDto
        {
            Email = email,
            Token = token
        });
    }

    [HttpGet] public IActionResult ResetPasswordConfirmation() => View();

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        if (!ModelState.IsValid)
            return View(dto);

        if (dto.Password != dto.ConfirmPassword)
        {
            ModelState.AddModelError("", "Las contraseñas no coinciden.");
            return View(dto);
        }

        var user = await _authService.FindByUsernameAsync(dto.Email);
        if (user == null)
        {
            return RedirectToAction("ResetPasswordConfirmation");
        }

        var result = await _authService.ResetPasswordAsync(user, dto.Token, dto.Password);

        if (!result.Succeeded)
        {
            foreach (var err in result.Errors)
                ModelState.AddModelError("", err.Description);

            return View(dto);
        }

        return RedirectToAction("ResetPasswordConfirmation");
    }
}
