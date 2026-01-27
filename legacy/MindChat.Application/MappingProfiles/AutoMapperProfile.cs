using AutoMapper;
using MindChat.Application.DTOs.Patients;
using MindChat.Application.DTOs.Psychologists;
using MindChat.Domain.Entities;

namespace MindChat.Application.MappingProfiles
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<RegisterPatientDto, ApplicationUser>().ReverseMap();
            CreateMap<RegisterPsychologistDto, ApplicationUser>().ReverseMap();
        }
    }
}
