using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class MainEmbedded
    {
        [JsonProperty("events")]
        public List<Events> Events { get; set; }
    }
    
}