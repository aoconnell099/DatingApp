using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class Events
        {
            [JsonProperty("id")]
            public string EventId { get; set; }

            public string ArtistName { get; set; } 
            
            [JsonProperty("name")]
            public string EventName { get; set; } 

            [JsonProperty("dates")]
            public DateTypes DateTypes { get; set; }

            [JsonProperty("_embedded")]
            public Embedded Embedded { get; set; }

            public DateTime EventDate { get; set; }
            public string City { get; set; }
            public string Venue { get; set; }

            [JsonProperty("url")]
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