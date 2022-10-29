using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class VenueInfo
    {
        [JsonProperty("name")]
        public string Venue { get; set; }

        [JsonProperty("city")]
        public CityInfo CityInfo { get; set; }

    }
}