using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Text.Json;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using API.Entities;

namespace API.Services
{
    public class ConcertService : IConcertService
    {
        private readonly IOptions<TicketMasterSettings> _config;
        private static readonly HttpClient httpClient;
        public ConcertService(IOptions<TicketMasterSettings> config)
        {
            _config = config;
        }
        //prob change to return ienumerable of concert/dto
//http://app.ticketmaster.com/discovery/v1/events.json?keyword=Madonna&apikey=4dsfsf94tyghf85jdhshwge334&callback=myFunction
        [HttpGet]
        public async Task<IEnumerable<Concert>> SearchConcerts([FromQuery]TicketMasterParams ticketMasterParams)
        {
            var uri = _config.Value.RootUrl + "keyword=" + ticketMasterParams.Keyword 
                                                + "&classificationName=" + ticketMasterParams.ClassificationName 
                                                + "&apikey=" + _config.Value.ApiKey;

            using var httpResponse = await httpClient.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead);

            httpResponse.EnsureSuccessStatusCode(); // throws if not 200-299

            var concertData =  await httpResponse.Content.ReadAsStreamAsync();
            var concerts = await System.Text.Json.JsonSerializer.DeserializeAsync<IEnumerable<Concert>>(concertData);
            
            if (concerts == null) return null;

            return concerts;
        }
    }
}