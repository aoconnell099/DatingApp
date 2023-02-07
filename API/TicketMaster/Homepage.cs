using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class Homepage
    {
        [JsonProperty("url")]
        public string HomepageUrl { get; set; }
    }
}