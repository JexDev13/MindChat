using Microsoft.AspNetCore.Mvc;
using MindChat.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;


namespace MindChat.Web.Controllers
{
    public class TestController : Controller
    {
        private readonly ApplicationDbContext _context;

        public TestController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IActionResult> Index()
        {
            try
            {
                var patientCount = await _context.Patients.CountAsync();

                ViewBag.PatientCount = patientCount;
            }
            catch (Exception ex)
            {
                ViewBag.Error = ex.Message;
            }

            return View();
        }
    }
}
