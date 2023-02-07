using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class ConcertsRepository : IConcertsRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;

        public ConcertsRepository(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public void AddConcert(Concert concert)
        {
            _context.Concerts.Add(concert);
        }

        // This needs to have a check to see if anyone is going to the concert anymore
        public void RemoveConcert(Concert concert)
        {
            _context.Concerts.Remove(concert);
        }

        public async Task<Concert> GetConcertByIdAsync(string eventId)
        {
            return await _context.Concerts
                .Include(uc => uc.UserConcert)
                .Where(x => x.EventId == eventId)
                .AsQueryable().FirstOrDefaultAsync();
        }

        public async Task<PagedList<ConcertDto>> GetConcertsAsync(ConcertParams concertParams)
        {
            var query = _context.Concerts
                .Include(uc => uc.UserConcert)
                .AsQueryable();

            // Use params to alter the returned list -- will need to add later when situation calls

            query = concertParams.OrderBy switch
            {
                "Upcoming" => query.OrderBy(c => c.EventDate),
                _ => query.OrderBy(c => c.EventDate) // Underscore is used to denote the default switch case
            };

            return await PagedList<ConcertDto>.CreateAsync(query.ProjectTo<ConcertDto>(_mapper
                .ConfigurationProvider).AsNoTracking(),
                concertParams.PageNumber, concertParams.PageSize);
        }

        public async Task<PagedList<ConcertDto>> GetConcertsForUser(ConcertParams concertParams)
        {

            // First grab a list of all of the concerts from the concert repo and map them to a dto
            var concerts = _context.Concerts 
                .Include(uc => uc.UserConcert)
                .OrderBy(c => c.Id)
                .AsQueryable();
            /* 
                Get the user's list of UserConcert and select many to 
                extract the actual list of UserConcerts to be queried.
                Then join the table of UserConcerts with the table of 
                concerts on the UserConcert ConcertId being equal to 
                the Concert Id. Returns a table of concerts whose Id 
                is equal to any UserConcert with the same ConcertId 
                and a UserId equal to the UserId passed in with the params.
            */
            var concertsForUser = _context.Users
                .Include(uc => uc.UserConcert)
                .Where(u => u.Id == concertParams.UserId) 
                .Select(uc => uc.UserConcert) 
                .SelectMany(uc => uc
                    .Join(concerts,
                    uc => uc.ConcertId,
                    c => c.Id,
                    (uc, c) => new ConcertDto
                {
                    Id = c.Id,
                    EventId = c.EventId,
                    ArtistName = c.ArtistName,
                    EventName = c.EventName,
                    EventDate = c.EventDate,
                    City = c.City,
                    Venue = c.Venue,
                    ConcertUrl = c.ConcertUrl,
                    VenueUrl = c.VenueUrl,
                    YoutubeUrl = c.YoutubeUrl,
                    TwitterUrl = c.TwitterUrl,
                    SpotifyUrl = c.SpotifyUrl,
                    FbUrl = c.FbUrl,
                    InstagramUrl = c.InstagramUrl,
                    HomepageUrl = c.HomepageUrl,
                    ImageUrl = c.ImageUrl
                }));

            return await PagedList<ConcertDto>.CreateAsync(concertsForUser, concertParams.PageNumber, concertParams.PageSize);
        }

        public async Task<ICollection<UserConcert>> GetConcertUserConcerts(string eventId)
        {
            return await _context.Concerts
                .Include(uc => uc.UserConcert)
                .Where(c => c.EventId == eventId)
                .Select(c => c.UserConcert)
                .FirstOrDefaultAsync();
        }

        public async Task<UserConcert> GetUserConcertById(int userId, int concertId)
        {
            /*
                First grab the table of concerts and select the UserConcert column.
                You need to use the where filter within the select clause to stay in scope
                and grab the first element in the table if it exists. Should be only one
                element in the table if it exists.
            */
            return await _context.Concerts
                .Include(uc => uc.UserConcert)
                .Select(uc => 
                    uc.UserConcert
                    .Select(uc => uc)
                    .Where(c => c.UserId == userId && c.ConcertId == concertId)
                    .FirstOrDefault()
                    ).FirstOrDefaultAsync();
        }

    }
}