using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using MindChat.Domain.Entities;
using MindChat.Infrastructure.Data;
using MindChat.Web.Models.Auth;
using MindChat.Web.Services;
using System.Threading.Tasks;
using System.Linq;
using System;

namespace MindChat.Web.Controllers.Api
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<int>> roleManager,
            ApplicationDbContext context,
            IJwtService jwtService)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register/patient")]
        public async Task<IActionResult> RegisterPatient([FromBody] RegisterPatientDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await _userManager.FindByEmailAsync(model.Email) != null)
                return Conflict(new { message = "Email already in use." });

            var user = new ApplicationUser
            {
                Email = model.Email,
                UserName = model.Email,
                FullName = model.FullName
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (!await _roleManager.RoleExistsAsync(UserRole.Patient.ToString()))
            {
                await _roleManager.CreateAsync(new IdentityRole<int>(UserRole.Patient.ToString()));
            }

            await _userManager.AddToRoleAsync(user, UserRole.Patient.ToString());

            var patient = new Patient
            {
                UserId = user.Id,
                EmotionalState = model.EmotionalState ?? string.Empty
            };

            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();

            return CreatedAtAction(null, new { id = user.Id });
        }

        [HttpPost("register/psychologist")]
        public async Task<IActionResult> RegisterPsychologist([FromBody] RegisterPsychologistDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await _userManager.FindByEmailAsync(model.Email) != null)
                return Conflict(new { message = "Email already in use." });

            var user = new ApplicationUser
            {
                Email = model.Email,
                UserName = model.Email,
                FullName = model.FullName
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            if (!await _roleManager.RoleExistsAsync(UserRole.Psychologist.ToString()))
            {
                await _roleManager.CreateAsync(new IdentityRole<int>(UserRole.Psychologist.ToString()));
            }

            await _userManager.AddToRoleAsync(user, UserRole.Psychologist.ToString());

            var psychologist = new Psychologist
            {
                UserId = user.Id,
                ProfessionalLicense = model.ProfessionalLicense ?? string.Empty,
                University = model.University ?? string.Empty,
                GraduationYear = model.GraduationYear ?? DateTime.MinValue,
                Bio = model.Bio,
                IsProfileVisible = model.IsProfileVisible
            };

            _context.Psychologists.Add(psychologist);
            await _context.SaveChangesAsync();

            return CreatedAtAction(null, new { id = user.Id });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized(new { message = "Invalid credentials." });

            if (!await _userManager.CheckPasswordAsync(user, model.Password))
                return Unauthorized(new { message = "Invalid credentials." });

            var roles = await _userManager.GetRolesAsync(user);

            if (roles == null || roles.Count == 0)
                return Forbid();

            string activeProfile = model.ActiveProfile;
            if (string.IsNullOrEmpty(activeProfile) || !roles.Contains(activeProfile))
            {
                activeProfile = roles.First();
            }

            var token = _jwtService.GenerateToken(user, roles, activeProfile, out var expiresAt);

            var response = new AuthResponseDto
            {
                Token = token,
                ExpiresAt = expiresAt,
                Roles = roles,
                ActiveProfile = activeProfile,
                Email = user.Email
            };

            return Ok(response);
        }
    }
}
