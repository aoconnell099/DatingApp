using System.Collections;
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
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using SQLitePCL;
using API.Extensions;

namespace API.Data
{
    public class UserRepository : IUserRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public const double deg2rad = Math.PI/180;
        public const double rad2deg = Math.PI*180;
        
        public UserRepository(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<MemberDto> GetMemberAsync(string username, bool isCurrentUser)
        {
            var query = _context.Users
                .Where(x => x.UserName == username)
                .ProjectTo<MemberDto>(_mapper.ConfigurationProvider)
                .AsQueryable();

            //bool checkCurrentUser = isCurrentUser ?? false; // Sets checkCurrentUser equal to isCurrentUser unless isCurrentUser equals null, in which case it is set to false

            if (isCurrentUser) query = query.IgnoreQueryFilters();

            return await query.FirstOrDefaultAsync();
        }

        public async Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams)
        {
            var query = _context.Users.AsQueryable();

           // var user = query.Where(u => u.UserName == userParams.CurrentUsername);

            query = query.Where(u => u.UserName != userParams.CurrentUsername);
            // If gender isnt equal to both, than query the gender specified, else leave it and query all
            if (userParams.Gender != "both") {
                query = query.Where(u => u.Gender == userParams.Gender);
            }
             

            var minDob = DateTime.UtcNow.AddYears(-userParams.MaxAge-1); // How far you want to go back to check user's Dob preference. Eg. max age they want is 30 so minDob would be 30 years before current date
            var maxDob = DateTime.UtcNow.AddYears(-userParams.MinAge);
            // var minDob = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-userParams.MaxAge-1)); // How far you want to go back to check user's Dob preference. Eg. max age they want is 30 so minDob would be 30 years before current date
            // var maxDob = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-userParams.MinAge));

            query = query.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);

            

            query = userParams.OrderBy switch
            {
                "created" => query.OrderByDescending(u => u.Created),
                _ => query.OrderByDescending(u => u.LastActive) // Underscore is used to denote the default switch case
            };

            return await PagedList<MemberDto>.CreateAsync(query.ProjectTo<MemberDto>(_mapper
                .ConfigurationProvider).AsNoTracking(), 
                    userParams.PageNumber, userParams.PageSize);
        }

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<AppUser> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
            .Include(p => p.Photos)
            .SingleOrDefaultAsync(x => x.UserName == username);
        }

        public async Task<AppUser> GetUserByPhotoId(int photoId)
        {
            return await _context.Users
                .Include(p => p.Photos)
                .IgnoreQueryFilters()
                .Where(p => p.Photos.Any(p => p.Id == photoId))
                .FirstOrDefaultAsync();
        }

        public async Task<string> GetUserGender(string username)
        {
            return await _context.Users
                .Where(x => x.UserName == username)
                .Select(x => x.Gender).FirstOrDefaultAsync();
        }

        public async Task<UserConcert> GetUserConcertById(int userId, int concertId)
        {
            /*
                First grab the table of concerts and select the UserConcert column.
                You need to use the where filter within the select clause to stay in scope
                and grab the first element in the table if it exists. Should be only one
                element in the table if it exists.
            */
            // return await _context.Users
            //     .Include(uc => uc.UserConcert)
            //     .Select(uc => 
            //         uc.UserConcert
            //         .Where(c => c.UserId == userId && c.ConcertId == concertId)
            //         .FirstOrDefault()
            //         ).FirstOrDefaultAsync();
            return await _context.Users
                .Include(uc => uc.UserConcert)
                .Where(u => u.Id == userId)
                .Select(u => u.UserConcert
                    .Where(uc => uc.UserId == userId && uc.ConcertId == concertId)
                    .FirstOrDefault()
                ).FirstOrDefaultAsync();
            
        }

        public async Task<IEnumerable<AppUser>> GetUsersAsync()
        {
            return await _context.Users
                .Include(p => p.Photos)
                .ToListAsync();
        }

        public void Update(AppUser user)
        {
            _context.Entry(user).State = EntityState.Modified;
        }

        public async Task<PagedList<MemberDto>> GetMatchesAsync(UserParams userParams)
        {
            var users = _context.Users.AsQueryable();

            // If gender isnt equal to both, than query the gender specified, else leave it and query all
            if (userParams.Gender != "both") {
                users = users.Where(u => u.Gender == userParams.Gender);
            }

            if (userParams.ConcertFilter) {
                // Get the list of user concerts for everyone except the current user
                var allUserConcerts = _context.Users
                    .Include(uc => uc.UserConcert)
                    .Where(u => u.UserName != userParams.CurrentUsername)
                    .SelectMany(u => u.UserConcert);
                    //.ToListAsync();
                
                // Get the list of user concerts for the current user
                var currentUserConcerts = _context.Users
                    .Include(uc => uc.UserConcert)
                    .Where(u => u.UserName == userParams.CurrentUsername)
                    .SelectMany(u => u.UserConcert);
                    
                var userConcerts = allUserConcerts
                    .Join(currentUserConcerts,
                        uc => uc.ConcertId,
                        c => c.ConcertId,
                        (uc, c) => uc.UserId);

                users = users
                    .Join(userConcerts,
                        u => u.Id,
                        uid => uid,
                        (u, uid) => u)
                    .Distinct();
            }
            else {
                users = users
                    .Where(u => u.UserName != userParams.CurrentUsername);
                
            }
            

            // foreach (AppUser u in users) {
            //     // var distance = (Math.Acos(Math.Sin(userParams.Latitude) * Math.Sin(u.Latitude) + Math.Cos(userParams.Latitude) 
            //     //             * Math.Cos(u.Latitude) * Math.Cos(u.Longitude - userParams.Longitude)) * 6371);
            //     // distance = distance * 0.621371;

            //     var distance = (Math.Acos(Math.Sin(userParams.Latitude*deg2rad) 
            //                         * Math.Sin(u.Latitude*deg2rad)
            //                         + Math.Cos(userParams.Longitude*deg2rad)
            //                         * Math.Cos(u.Longitude*deg2rad)
            //                         * Math.Cos((userParams.Longitude-u.Longitude)*deg2rad))
            //                         / rad2deg
            //                         *60*1.1515);
            // }
            

            if (userParams.Distance != 100) { // 100 is the value set for the search radius to extend to anywhere
                // Formula for distance using latitude and longitude=acos(sin(lat1)*sin(lat2)+cos(lat1)*cos(lat2)*cos(lon2-lon1))*3,958.8 mi
                // users = _context.Users
                //     .AsQueryable()
                //     .Where(u => (LocationExtensions.distance(userParams.Latitude, userParams.Longitude, u.Latitude, u.Longitude) < userParams.Distance));
                
                // users = (IQueryable<AppUser>)await users.ToListAsync();

                //users = users.Where(u => (LocationExtensions.distance(userParams.Latitude, userParams.Longitude, u.Latitude, u.Longitude) < userParams.Distance));
                
                users = users
                    .Where(u => (Math.Acos(Math.Sin(userParams.Latitude*deg2rad) 
                                    * Math.Sin(u.Latitude*deg2rad)
                                    + Math.Cos(userParams.Longitude*deg2rad)
                                    * Math.Cos(u.Longitude*deg2rad)
                                    * Math.Cos((userParams.Longitude-u.Longitude)*deg2rad))
                                    / rad2deg
                                    *60*1.1515) < userParams.Distance);
            
            }
            
            
            
             

            var minDob = DateTime.UtcNow.AddYears(-userParams.MaxAge-1); // How far you want to go back to check user's Dob preference. Eg. max age they want is 30 so minDob would be 30 years before current date
            var maxDob = DateTime.UtcNow.AddYears(-userParams.MinAge);
            // var minDob = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-userParams.MaxAge-1)); // How far you want to go back to check user's Dob preference. Eg. max age they want is 30 so minDob would be 30 years before current date
            // var maxDob = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-userParams.MinAge));

            users = users.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);

            

            users = userParams.OrderBy switch
            {
                "created" => users.OrderByDescending(u => u.Created),
                _ => users.OrderByDescending(u => u.LastActive) // Underscore is used to denote the default switch case
            };

            return await PagedList<MemberDto>.CreateAsync(users.ProjectTo<MemberDto>(_mapper
                .ConfigurationProvider).AsNoTracking(), 
                    userParams.PageNumber, userParams.PageSize);
            
            // return await users.ProjectTo<MemberDto>(_mapper
            //     .ConfigurationProvider).AsNoTracking()
            //     .ToListAsync();

            // return await _context.Users
            //     .Include(uc => uc.UserConcert)
            //     .Where(u => u.Id != userId)
            //     .ToListAsync();
            
            
            // var query = _context.Users.AsQueryable();

            // query = query.Where(u => u.UserName != userParams.CurrentUsername);
            // query = query.Where(u => u.Gender == userParams.Gender);

            // var minDob = DateTime.UtcNow.AddYears(-userParams.MaxAge-1); // How far you want to go back to check user's Dob preference. Eg. max age they want is 30 so minDob would be 30 years before current date
            // var maxDob = DateTime.UtcNow.AddYears(-userParams.MinAge);
            // // var minDob = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-userParams.MaxAge-1)); // How far you want to go back to check user's Dob preference. Eg. max age they want is 30 so minDob would be 30 years before current date
            // // var maxDob = DateOnly.FromDateTime(DateTime.UtcNow.AddYears(-userParams.MinAge));

            // query = query.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);

            // query = userParams.OrderBy switch
            // {
            //     "created" => query.OrderByDescending(u => u.Created),
            //     _ => query.OrderByDescending(u => u.LastActive) // Underscore is used to denote the default switch case
            // };

            // return await query.ToListAsync();
        }
    }
}