using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace MindChat.Web.Controllers
{
    [ApiController]
    [Route("api/profile")]
    public class ProfileController : ControllerBase
    {
        private const string SecretKey = "T8bq9WmX4ZsP37Kj2LrN8vG0QwYhF5UxA1dC9lS7";

        [HttpGet("mock-patient")]
        public IActionResult GetMockPatient()
        {
            var token = GenerateJwt(1, "pedro.ramon@example.com", "Patient");
            return Ok(new { Token = token, ActiveProfile = "Patient", Name = "Pedro Ramon" });
        }

        [HttpGet("mock-psychologist")]
        public IActionResult GetMockPsychologist()
        {
            var token = GenerateJwt(2, "lucia.fernanda@example.com", "Psychologist");
            return Ok(new { Token = token, ActiveProfile = "Psychologist", Name = "Lucia Fernanda" });
        }

        private string GenerateJwt(int userId, string email, string role)
        {
            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("activeProfile", role),
                new Claim("role", role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
