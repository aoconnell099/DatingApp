using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs
{
    public class ConversationDto
    {
        public string OtherUser { get; set; }
        public string OtherUserPhotoUrl { get; set; }
        public bool IsSender { get; set; }
        public string Content { get; set; }
        public DateTime MessageSent { get; set; }  
        public DateTime? DateRead { get; set; }   
        
    }
}