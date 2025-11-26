using MindChat.Application.DTOs.Patients;
using MindChat.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Application.Interfaces
{
    public interface IPatientService
    {
        Task<(bool Success, IEnumerable<string> Errors)> RegisterAsync(RegisterPatientDto dto);
    }
}
