using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class Embedded
    {
        [JsonProperty("venues")]
        public List<VenueInfo> Venues { get; set; }

        [JsonProperty("attractions")]
        public List<ArtistInfo> ArtistInfo { get; set; }
    }
}