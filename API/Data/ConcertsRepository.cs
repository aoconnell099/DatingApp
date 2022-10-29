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

        public async Task<ConcertDto> GetConcertAsync(string eventId)
        {
            return await _context.Concerts
                .Where(x => x.EventId == eventId)
                .ProjectTo<ConcertDto>(_mapper.ConfigurationProvider)
                .AsQueryable().FirstOrDefaultAsync();
        }

        public async Task<PagedList<ConcertDto>> GetConcertsAsync(ConcertParams concertParams)
        {
            var query = _context.Concerts.AsQueryable();

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

        public async Task<PagedList<ConcertDto>> GetUserConcerts(ConcertParams concertParams)
        {
            // First grab a list of all of the concerts from the concert repo and map them to a dto
            var concerts = _context.Concerts 
                .OrderByDescending(c => c.Id)
                .ProjectTo<ConcertDto>(_mapper.ConfigurationProvider)
                .AsQueryable();

            // Then get the user requesting their list of concerts, and select their list and project them to dto's
            var userConcerts = _context.Users 
                .Include(c => c.Concerts)
                .Where(x => x.Id == concertParams.UserId)
                .SelectMany(c => c.Concerts)
                .ProjectTo<ConcertDto>(_mapper.ConfigurationProvider);
            
            // Join the two tables based on the matching Id numbers (different from the event id, which is provided by ticketmaster)
            var query = 
                from concert in concerts
                join userConcert in userConcerts on concert.Id equals userConcert.Id
                select new ConcertDto
            {
                Id = concert.Id,
                EventId = concert.EventId,
                ArtistName = concert.ArtistName,
                EventName = concert.EventName,
                EventDate = concert.EventDate,
                City = concert.City,
                Venue = concert.Venue
            };

            return await PagedList<ConcertDto>.CreateAsync(query, concertParams.PageNumber, concertParams.PageSize);
        }

    }
}