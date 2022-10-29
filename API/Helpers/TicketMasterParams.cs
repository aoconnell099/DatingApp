using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Helpers
{
    public class TicketMasterParams : PaginationParams
    {
        public string ClassificationName {get; set; } = "music";
        public string Keyword { get; set; }
        
    }
}