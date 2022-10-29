using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface IConcertsRepository
    {
        void AddConcert(Concert concert);

        void RemoveConcert(Concert concert);

        Task<ConcertDto> GetConcertAsync(string eventId);

        Task<PagedList<ConcertDto>> GetConcertsAsync(ConcertParams concertParams);

        Task<PagedList<ConcertDto>> GetUserConcerts(ConcertParams concertParams);
        
    }
}