using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class Instagram
    {
        [JsonProperty("url")]
        public string InstagramUrl { get; set; }
    }
}