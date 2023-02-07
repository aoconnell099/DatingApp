using Newtonsoft.Json;

namespace API.TicketMaster
{
    public class Facebook
    {
        [JsonProperty("url")]
        public string FbUrl { get; set; }
    }
}