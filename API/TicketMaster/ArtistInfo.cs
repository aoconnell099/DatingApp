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
    }
}