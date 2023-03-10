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
                    var ArtistImages = ArtistInfo != null ? concert.Embedded.ArtistInfo.FirstOrDefault().ArtistImages : null;

                    // var Twitter = concert.Embedded.ArtistInfo.ExternalLinks.Twitter;

                    //var ExternalLinks = concert.Embedded.ArtistInfo.ExternalLinks;
                    concert.EventDate = concert.DateTypes.Dates.EventDate;
                    // concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                    
                    
                    if (Venues == null) {
                        concert.City = "";
                        concert.Venue = "";
                        concert.VenueUrl = "";
                    }
                    else {
                        concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                        concert.Venue = concert.Embedded.Venues.FirstOrDefault().Venue != null ? concert.Embedded.Venues.FirstOrDefault().Venue : "";
                        concert.VenueUrl = concert.Embedded.Venues.FirstOrDefault().VenueUrl != null ? concert.Embedded.Venues.FirstOrDefault().VenueUrl : "";;
                    }
                    if (ArtistInfo == null) {
                        concert.ArtistName = "";
                        concert.YoutubeUrl = "";
                        concert.TwitterUrl = "";
                        concert.SpotifyUrl = "";
                        concert.FbUrl = "";
                        concert.InstagramUrl = "";
                        concert.HomepageUrl = "";
                    }
                    else {
                        concert.ArtistName = concert.Embedded.ArtistInfo.FirstOrDefault().ArtistName != null ? concert.ArtistName = concert.Embedded.ArtistInfo.FirstOrDefault().ArtistName : "";
                        if (concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks != null) {
                            // concert.YoutubeUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Youtube != null ? concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Youtube.YoutubeUrl : "";
                            
                            // concert.TwitterUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Twitter != null ? concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Twitter.TwitterUrl : "";
                            // concert.SpotifyUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Spotify != null ? concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Spotify.SpotifyUrl : "";
                            // concert.FbUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Facebook != null ? concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Facebook.FbUrl : "";
                            // concert.InstagramUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Instagram != null ? concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Instagram.InstagramUrl : "";
                            // concert.HomepageUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Homepage != null ? concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Homepage.HomepageUrl : "";
                            
                            if (concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Youtube != null) {
                                concert.YoutubeUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Youtube.FirstOrDefault().YoutubeUrl;
                            }
                            else{
                                concert.YoutubeUrl = "";
                            }
                            
                            if (concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Twitter != null) {
                                concert.TwitterUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Twitter.FirstOrDefault().TwitterUrl;
                            }
                            else{
                                concert.TwitterUrl = "";
                            }

                            if (concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Spotify != null) {
                                concert.SpotifyUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Spotify.FirstOrDefault().SpotifyUrl;
                            }
                            else{
                                concert.SpotifyUrl = "";
                            }

                            if (concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Facebook != null) {
                                concert.FbUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Facebook.FirstOrDefault().FbUrl;
                            }
                            else{
                                concert.FbUrl = "";
                            }

                            if (concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Instagram != null) {
                                concert.InstagramUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Instagram.FirstOrDefault().InstagramUrl;
                            }
                            else{
                                concert.InstagramUrl = "";
                            }

                            if (concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Homepage != null) {
                                concert.HomepageUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.Homepage.FirstOrDefault().HomepageUrl;
                            }
                            else{
                                concert.HomepageUrl = "";
                            }
                        }
                        else {
                            concert.YoutubeUrl = "";
                            concert.TwitterUrl = "";
                            concert.SpotifyUrl = "";
                            concert.FbUrl = "";
                            concert.InstagramUrl = "";
                            concert.HomepageUrl = "";
                        }
                        if (ArtistImages == null) {
                            concert.ImageUrl = "";
                        }
                        else {
                            concert.ImageUrl = concert.Embedded.ArtistInfo.FirstOrDefault().ArtistImages.FirstOrDefault().ImageUrl != null ? concert.Embedded.ArtistInfo.FirstOrDefault().ArtistImages.FirstOrDefault().ImageUrl : "";
                        }
                        
                        // if (concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks.keys(concert.Embedded.ArtistInfo.FirstOrDefault().ExternalLinks).length === 0){

                        // }
                    }

                    // concert.ConcertUrl = (concert.ConcertUrl != null) ? concert.ConcertUrl : "";
                    // concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                    // concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                    // concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                    // concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                    // concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                    // concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                    // concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                    // concert.City = (concert.Embedded.Venues.FirstOrDefault().CityInfo.City != null) ? concert.Embedded.Venues.FirstOrDefault().CityInfo.City : "";
                }
            }
            return concerts;
        }

    }
}