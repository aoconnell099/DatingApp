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
        public string ArtistName { get; set; }
        public string EventName { get; set; } 
        public DateTime EventDate { get; set; }
        public string City { get; set; }
        public string Venue { get; set; }
        public string ConcertUrl { get; set; }
        public string VenueUrl { get; set; }
        public string YoutubeUrl { get; set; }
        public string TwitterUrl { get; set; }
        public string SpotifyUrl { get; set; }
        public string FbUrl { get; set; }
        public string InstagramUrl { get; set; }
        public string HomepageUrl { get; set; }
        public string ImageUrl { get; set; }
    }
}