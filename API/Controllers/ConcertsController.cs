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

        // [HttpPost("add-concert")]
        // public async Task<ActionResult<ConcertDto>> AddConcert([FromQuery]ConcertParams concertParams, ConcertDto concertDto) //prob change to a dto
        // {
        //     concertParams.UserId = User.GetUserId();
        //     var userConcerts = await _unitOfWork.ConcertsRepository.GetUserConcerts(concertParams);
        //     var concerts = await _unitOfWork.ConcertsRepository.GetConcertsAsync

        //     if (userConcerts.Contains(concertDto)) return BadRequest("You have already liked that concert.");

        //     if ()
        //     //if (await user.Concerts.Contains(concert.EventId))
                
        //     return BadRequest("Problem adding the concert");
        // }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> SearchConcerts([FromQuery]TicketMasterParams ticketMasterParams)
        {
            var keyword = ticketMasterParams.Keyword.Replace(' ', '+');
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
            
            if (concerts == null) return null;

            var concertsToReturn = concerts.MainEmbedded
                .Events.AsQueryable()
                .ExtractConcertData()
                .ProjectTo<ConcertDto>(_mapper.ConfigurationProvider)
                .AsEnumerable();

            //var concertsToReturn = _mapper.Map<ConcertDto>(concerts);

            return Ok(concertsToReturn); 
        }

        [HttpGet("user-concerts")]
        public async Task<ActionResult<IEnumerable<ConcertDto>>> GetUserConcerts([FromQuery]ConcertParams concertParams)
        {
            //userid, concertid, OrderBy
            concertParams.UserId = User.GetUserId();
            var concerts = await _unitOfWork.ConcertsRepository.GetUserConcerts(concertParams);

            Response.AddPaginationHeader(concerts.CurrentPage, concerts.PageSize, 
                concerts.TotalCount, concerts.TotalPages);

            return Ok(concerts);
        }

    }
}