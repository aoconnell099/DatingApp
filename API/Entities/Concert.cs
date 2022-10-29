using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.Entities
{
    public class Concert
    {
        public int Id { get; set; } // Potentially unnecessary -- current thinking is to use a provided id from ticketmaster to compare against for matching
        public string EventId { get; set; }
        public string EventName { get; set; } 
        public DateTime EventDate { get; set; }
        public string City { get; set; }
        public string Venue { get; set; }
        public ICollection<int> UserIdList { get; set; }

        public class RootObject
        {
            [JsonProperty("_embedded")]
            public MainEmbedded MainEmbedded { get; set; }
        }

        public class MainEmbedded
        {
            [JsonProperty("events")]
            public List<Events> Events { get; set; }
        }

        public class Events
        {
            [JsonProperty("id")]
            public string EventId { get; set; }
            
            [JsonProperty("name")]
            public string EventName { get; set; } 

            [JsonProperty("dates")]
            public DateTypes DateTypes { get; set; }

            [JsonProperty("_embedded")]
            public Embedded Embedded { get; set; }

            public DateTime EventDate { get; set; }
            public string City { get; set; }
            public string Venue { get; set; }
        }

        public class DateTypes 
        {
            [JsonProperty("start")]
            public StartDates Dates { get; set; }
        }

        public class StartDates
        {
            [JsonProperty("dateTime")]
            public DateTime EventDate { get; set; }
        }

        public class Embedded
        {
            [JsonProperty("venues")]
            public List<VenueInfo> Venues { get; set; }
        }

        public class VenueInfo
        {
            [JsonProperty("name")]
            public string Venue { get; set; }

            [JsonProperty("city")]
            public CityInfo CityInfo { get; set; }

        }

        public class CityInfo
        {
            [JsonProperty("name")]
            public string City { get; set; }
        }
    }
}