using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class StartDates
    {
        [JsonProperty("dateTime")]
        public DateTime EventDate { get; set; }
    }
}