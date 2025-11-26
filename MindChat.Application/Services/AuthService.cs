using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MindChat.Application.DTOs.Patients;
using MindChat.Application.Helpers;
using MindChat.Application.Interfaces;
using MindChat.Domain.Entities;
using MindChat.Domain.Enums;
using MindChat.Infrastructure.Data;

namespace MindChat.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PatientService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public AuthService(
            UserManager<ApplicationUser> userManager,
            ApplicationDbContext context,
            ILogger<PatientService> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;
        }

        public async Task<ApplicationUser?> FindByUsernameAsync(string userEmail)
        {
            return await _userManager.Users.FirstOrDefaultAsync(u => u.Email == userEmail);
        }

        public async Task<ApplicationUser?> FindByIdAsync(int userId)
        {
            return await _userManager.Users.FirstOrDefaultAsync(u => u.Id == userId);
        }

        public async Task<bool> CheckPasswordAsync(ApplicationUser user, string password)
        {
            return await _userManager.CheckPasswordAsync(user, password);
        }

        public async Task<IList<string>> GetRolesAsync(ApplicationUser user)
        {
            return await _userManager.GetRolesAsync(user);
        }

        public async Task<string?> GeneratePasswordResetTokenAsync(ApplicationUser user)
        {
            return await _userManager.GeneratePasswordResetTokenAsync(user);
        }

        public async Task<IdentityResult> ResetPasswordAsync(ApplicationUser user, string token, string newPassword)
        {
            return await _userManager.ResetPasswordAsync(user, token, newPassword);
        }
    }
}
