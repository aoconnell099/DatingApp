using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using API.TicketMaster;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace API.Controllers
{
    [Authorize]
    public class ConcertsController : BaseApiController
    {
        private readonly IMapper _mapper;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConcertService _concertService;
        private readonly IOptions<TicketMasterSettings> _config;
        private readonly IHttpClientFactory _httpClientFactory;
        
        public ConcertsController(IUnitOfWork unitOfWork, IMapper mapper, 
                    IOptions<TicketMasterSettings> config, IHttpClientFactory httpClientFactory)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConcertDto>>> GetConcertsForUser([FromQuery] 
            ConcertParams concertParams)
        {
            concertParams.UserId = User.GetUserId();
            var concerts = await _unitOfWork.ConcertsRepository.GetConcertsForUser(concertParams);

            Response.AddPaginationHeader(concerts.CurrentPage, concerts.PageSize, 
                concerts.TotalCount, concerts.TotalPages);

            return concerts;
        }

        [HttpPost("add-concert")]
        public async Task<ActionResult<ConcertDto>> AddConcert(ConcertDto concertDto)
        {
            // If the concert already exists in the db, then use that concertId
            // If it doesn't exist, then the Id will be created further down when it's added to the db
            // so pass in the concertDto.Id (0).
            var concert = await _unitOfWork.ConcertsRepository.GetConcertByIdAsync(concertDto.EventId);
            var concertId = concert == null ? concertDto.Id : concert.Id; 
            var userConcert = await _unitOfWork.ConcertsRepository.GetUserConcertById(User.GetUserId(), concertId);

            // UserConcert exists in this concert's collection of UserConcert corresponding with the user id.
            if (userConcert != null) return BadRequest("You already like this concert.");

            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(User.GetUserId());
            
            // If the user's UserConcert list doesn't exist, then this is their first liked concert,
            // so make a new List to avoid null reference exceptions
            if (user.UserConcert == null) user.UserConcert = new List<UserConcert>();

            // Concert is in the db but has not been liked by the user yet
            if (concert != null && userConcert == null)
            {
                var newUserConcert = new UserConcert
                {
                    UserId = user.Id,
                    User = user,
                    ConcertId = concert.Id,
                    Concert = concert
                };
                // Add the UserConcert to the user and concert's list of UserConcert
                user.UserConcert.Add(newUserConcert);
                concert.UserConcert.Add(newUserConcert);

                if (await _unitOfWork.Complete()) return Ok("Successfully added concert");
            }
                       
            // Concert is not in the db yet.
            if (concert == null)
            {
                var newConcert = new Concert
                {
                    //Id = concertDto.Id,
                    EventId = concertDto.EventId,
                    ArtistName = concertDto.ArtistName,
                    EventName = concertDto.EventName,
                    EventDate = concertDto.EventDate,
                    City = concertDto.City,
                    Venue = concertDto.Venue,
                    UserConcert = new List<UserConcert>()
                };
                // Add the Concert to the db before creating the 
                // UserConcert so there is an Id assigned for a primary 
                // key to join with the users table
                // TODO: Find a better implementation to avoid an extra api call
                _unitOfWork.ConcertsRepository.AddConcert(newConcert);
                await _unitOfWork.Complete();
                // Get the newly added Concert from the db to ensure that's what's modified
                // when adding the new UserConcert to it instead of modifying the Concert created above
                var newlyAddedConcert = await _unitOfWork.ConcertsRepository.GetConcertByIdAsync(concertDto.EventId);
                //await _unitOfWork.Complete();
                var newUserConcert = new UserConcert
                {
                    UserId = user.Id,
                    User = user,
                    ConcertId = newlyAddedConcert.Id,
                    Concert = newlyAddedConcert
                };

                
                // Add the concert to the user's list of concerts
                user.UserConcert.Add(newUserConcert);
                
                
                newlyAddedConcert.UserConcert.Add(newUserConcert);

                if (await _unitOfWork.Complete()) return Ok(_mapper.Map<ConcertDto>(newlyAddedConcert));
            }
                
            return BadRequest("Problem adding the concert");
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ConcertDto>>> SearchConcerts([FromQuery]TicketMasterParams ticketMasterParams) 
        {
            var keyword = ticketMasterParams.Keyword.Replace(' ', '+'); // keyword = keyword.Replace(' ', '+');
            var uri = new Uri(_config.Value.RootUrl + "keyword=" + keyword
                                                + "&classificationName=" + ticketMasterParams.ClassificationName 
                                                + "&apikey=" + _config.Value.ApiKey);

            var httpClient = _httpClientFactory.CreateClient();
            using var httpResponse = await httpClient.GetAsync(uri); //, HttpCompletionOption.ResponseHeadersRead

            httpResponse.EnsureSuccessStatusCode(); // throws if not 200-299

            var concertData =  await httpResponse.Content.ReadAsStreamAsync();

            using var streamReader = new StreamReader(concertData);
            using var jsonReader = new JsonTextReader(streamReader);

            JsonSerializer serializer = new JsonSerializer();

            var concerts = serializer.Deserialize<RootObject>(jsonReader);
            
            if (concerts == null || concerts.MainEmbedded == null || concerts.MainEmbedded.Events == null) return BadRequest("There was a problem searching for concerts");

            var concertsToReturn = concerts.MainEmbedded
                .Events.AsQueryable()
                .ExtractConcertData()
                .ProjectTo<ConcertDto>(_mapper.ConfigurationProvider)
                .AsEnumerable();

            return Ok(concertsToReturn);
        }



    }
}