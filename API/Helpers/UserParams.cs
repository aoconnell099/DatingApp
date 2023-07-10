using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Helpers
{
    public class UserParams : PaginationParams
    {

        public string CurrentUsername  { get; set; }
        public string Gender { get; set; }
        public int MinAge { get; set; } = 18;
        public int MaxAge { get; set; } = 99;
        public string OrderBy { get; set; } = "lastActive";
        public bool ConcertFilter { get; set; }
        public int Distance { get; set; } = 10; // Distances range: 5, 10, 15, 25, 50, anywhere(100)
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}