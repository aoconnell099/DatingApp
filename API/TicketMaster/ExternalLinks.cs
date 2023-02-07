using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class ExternalLinks
    {
        [JsonProperty("youtube")]
        public List<Youtube> Youtube { get; set; }
        [JsonProperty("twitter")]
        public List<Twitter> Twitter { get; set; }
        [JsonProperty("facebook")]
        public List<Facebook> Facebook { get; set; }
        
        [JsonProperty("spotify")]
        public List<Spotify> Spotify { get; set; }
        
        [JsonProperty("instagram")]
        public List<Instagram> Instagram { get; set; }
        
        [JsonProperty("homepage")]
        public List<Homepage> Homepage { get; set; }
    }
}