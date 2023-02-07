using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class Twitter
    {
        [JsonProperty("url")]
        public string TwitterUrl { get; set; }
    }
}