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

        Task<Concert> GetConcertByIdAsync(string eventId);

        Task<PagedList<ConcertDto>> GetConcertsAsync(ConcertParams concertParams);

        Task<PagedList<ConcertDto>> GetConcertsForUser(ConcertParams concertParams);

        Task<UserConcert> GetUserConcertById(int userId, int concertId);
    }
}