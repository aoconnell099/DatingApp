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

        [HttpPost("add-concert")]
        public async Task<ActionResult<ConcertDto>> AddConcert(ConcertDto concertDto)
        {
            var userConcert = await _unitOfWork.ConcertsRepository.GetUserConcertById(User.GetUserId(), concertDto.Id);

            // UserConcert exists in this concert's collection of UserConcert corresponding with the user id.
            if (userConcert != null) return BadRequest("You already like this concert.");
            
            var concert = await _unitOfWork.ConcertsRepository.GetConcertByIdAsync(concertDto.EventId);
            var user = await _unitOfWork.UserRepository.GetUserByIdAsync(User.GetUserId());
            
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

                if (await _unitOfWork.Complete()) return Ok();
            }
                       
            // Concert is not in the db yet.
            if (concert == null)
            {
                var newConcert = new Concert
                {
                    EventId = concertDto.EventId,
                    ArtistName = concertDto.ArtistName,
                    EventName = concertDto.EventName,
                    EventDate = concertDto.EventDate,
                    City = concertDto.City,
                    Venue = concertDto.Venue,
                    UserConcert = new List<UserConcert>()
                };
                var newUserConcert = new UserConcert
                {
                    UserId = user.Id,
                    User = user,
                    ConcertId = newConcert.Id,
                    Concert = newConcert
                };

                if (user.UserConcert == null) user.UserConcert = new List<UserConcert>();
                // Add the concert to the user's list of concerts
                user.UserConcert.Add(newUserConcert);
                newConcert.UserConcert.Add(newUserConcert);
                _unitOfWork.ConcertsRepository.AddConcert(newConcert);

                if (await _unitOfWork.Complete()) return Ok(_mapper.Map<ConcertDto>(newConcert));
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
            
            if (concerts == null) return BadRequest("There was a problem searching for concerts");

            var concertsToReturn = concerts.MainEmbedded
                .Events.AsQueryable()
                .ExtractConcertData()
                .ProjectTo<ConcertDto>(_mapper.ConfigurationProvider)
                .AsEnumerable();

            //var concertsToReturn = _mapper.Map<ConcertDto>(concerts);

            return Ok(concertsToReturn);
        }



    }
}