using System;
using System.Collections.Generic;

namespace MindChat.Web.Models.Auth
{
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public DateTime ExpiresAt { get; set; }
        public IEnumerable<string> Roles { get; set; }
        public string ActiveProfile { get; set; }
        public string Email { get; set; }
    }
}
