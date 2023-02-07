using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class ArtistInfo
    {
        [JsonProperty("name")]
        public string ArtistName { get; set; }
        
        [JsonProperty("url")]
        public string VenueUrl { get; set; }
        
        [JsonProperty("externalLinks")]
        public ExternalLinks ExternalLinks { get; set; }

        [JsonProperty("images")]
        public List<ArtistImages> ArtistImages { get; set; }


    }
}