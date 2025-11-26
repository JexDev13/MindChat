using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MindChat.Domain.Enums.Extensions
{
    public static class PsychologyTagExtensions
    {
       public static string ToTagName(this PsychologyTag tag)
        {
            return tag.ToString();
        }
    }
}
