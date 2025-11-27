using MindChat.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateToken(ApplicationUser user, string activeProfile, IList<string> roles);
    }
}
