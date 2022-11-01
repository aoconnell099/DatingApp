using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class UserConcert
    {
        public AppUser User { get; set; }
        public int UserId { get; set; }
        public Concert Concert { get; set; }
        public int ConcertId { get; set; }
    }
}