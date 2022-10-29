using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.DTOs
{
    public class ConcertDto
    {
        public int Id { get; set; } // Potentially unnecessary -- current thinking is to use a provided id from ticketmaster to compare against for matching
        public string EventId { get; set; }
        public string EventName { get; set; } 
        public DateTime EventDate { get; set; }
        public string City { get; set; }
        public string Venue { get; set; }
    }
}