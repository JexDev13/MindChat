using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using MindChat.Domain.Entities;
using MindChat.Infrastructure.Data;
using MindChat.Web.Models.Auth;
using System.Threading.Tasks;
using System;

namespace MindChat.Web.Controllers
{
    public class AccountController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly ApplicationDbContext _context;

        public AccountController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            RoleManager<IdentityRole<int>> roleManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _context = context;
        }

        [HttpGet]
        public IActionResult Login(string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(LoginDto model, string returnUrl = null)
        {
            ViewData["ReturnUrl"] = returnUrl;
            if (!ModelState.IsValid) return View(model);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                ModelState.AddModelError(string.Empty, "Credenciales inválidas.");
                return View(model);
            }

            var result = await _signInManager.PasswordSignInAsync(user, model.Password, isPersistent: false, lockoutOnFailure: false);
            if (result.Succeeded)
            {
                if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
                    return Redirect(returnUrl);

                return RedirectToAction("Index", "Home");
            }

            ModelState.AddModelError(string.Empty, "Credenciales inválidas.");
            return View(model);
        }

        [HttpGet]
        public IActionResult RegisterPatient()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RegisterPatient(RegisterPatientDto model)
        {
            if (!ModelState.IsValid) return View(model);

            if (await _userManager.FindByEmailAsync(model.Email) != null)
            {
                ModelState.AddModelError("Email", "El email ya está en uso.");
                return View(model);
            }

            var user = new ApplicationUser
            {
                Email = model.Email,
                UserName = model.Email,
                FullName = model.FullName
            };

            var create = await _userManager.CreateAsync(user, model.Password);
            if (!create.Succeeded)
            {
                foreach (var err in create.Errors) ModelState.AddModelError(string.Empty, err.Description);
                return View(model);
            }

            if (!await _roleManager.RoleExistsAsync(UserRole.Patient.ToString()))
                await _roleManager.CreateAsync(new IdentityRole<int>(UserRole.Patient.ToString()));

            await _userManager.AddToRoleAsync(user, UserRole.Patient.ToString());

            var patient = new Patient
            {
                UserId = user.Id,
                EmotionalState = model.EmotionalState ?? string.Empty
            };
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            await _signInManager.SignInAsync(user, isPersistent: false);
            return RedirectToAction("Index", "Home");
        }

        [HttpGet]
        public IActionResult RegisterPsychologist()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RegisterPsychologist(RegisterPsychologistDto model)
        {
            if (!ModelState.IsValid) return View(model);

            if (await _userManager.FindByEmailAsync(model.Email) != null)
            {
                ModelState.AddModelError("Email", "El email ya está en uso.");
                return View(model);
            }

            var user = new ApplicationUser
            {
                Email = model.Email,
                UserName = model.Email,
                FullName = model.FullName
            };

            var create = await _userManager.CreateAsync(user, model.Password);
            if (!create.Succeeded)
            {
                foreach (var err in create.Errors) ModelState.AddModelError(string.Empty, err.Description);
                return View(model);
            }

            if (!await _roleManager.RoleExistsAsync(UserRole.Psychologist.ToString()))
                await _roleManager.CreateAsync(new IdentityRole<int>(UserRole.Psychologist.ToString()));

            await _userManager.AddToRoleAsync(user, UserRole.Psychologist.ToString());

            var psychologist = new Psychologist
            {
                UserId = user.Id,
                ProfessionalLicense = model.ProfessionalLicense ?? string.Empty,
                University = model.University ?? string.Empty,
                GraduationYear = model.GraduationYear ?? DateTime.MinValue,
                Bio = model.Bio ?? string.Empty,
                IsProfilePrivate = !model.IsProfileVisible
            };

            _context.Psychologists.Add(psychologist);
            await _context.SaveChangesAsync();

            await _signInManager.SignInAsync(user, isPersistent: false);
            return RedirectToAction("Index", "Home");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }
    }
}
