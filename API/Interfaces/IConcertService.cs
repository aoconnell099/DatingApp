using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;
using API.Helpers;
using Microsoft.AspNetCore.Mvc;

namespace API.Interfaces
{
    public interface IConcertService
    {
        Task<IEnumerable<Concert>> SearchConcerts([FromQuery]TicketMasterParams ticketMasterParams);
    }
}