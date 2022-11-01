using System;
using System.Linq;
using API.DTOs;
using API.Entities;
using API.TicketMaster;

namespace API.Extensions
{
    public static class QueryableExtensions
    {
        public static IQueryable<Message> MarkUnreadAsRead(this IQueryable<Message> query, string currentUsername)
        {
            var unreadMessages = query.Where(m => m.DateRead == null
                && m.RecipientUsername == currentUsername);
 
            if (unreadMessages.Any())
            {
                foreach (var message in unreadMessages)
                {
                    message.DateRead = DateTime.UtcNow;
                }
            }
 
            return query;
        }

        public static IQueryable<Events> ExtractConcertData(this IQueryable<Events> concerts)
        {
            if (concerts.Any())
            {
                foreach (var concert in concerts)
                {
                    var Venues = concert.Embedded.Venues;
                    var ArtistInfo = concert.Embedded.ArtistInfo;
                    concert.EventDate = concert.DateTypes.Dates.EventDate;
                    concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                    if (Venues == null) concert.Venue = "";
                    else concert.Venue = concert.Embedded.Venues.FirstOrDefault().Venue;
                    if (ArtistInfo == null) concert.ArtistName = "";
                    else concert.ArtistName = concert.Embedded.ArtistInfo.FirstOrDefault().ArtistName;
                }
            }
            return concerts;
        }

    }
}