using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CloudinaryDotNet.Actions;

namespace API.Helpers
{
    public class ConcertParams : PaginationParams
    {
        public int UserId { get; set; }
        public string ConcertId { get; set; }
        public string OrderBy { get; set; } = "Upcoming";
    }
}