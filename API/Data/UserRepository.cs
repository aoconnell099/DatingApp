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
using Microsoft.EntityFrameworkCore.Query.Internal;
using Microsoft.AspNetCore.JsonPatch.Helpers;

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
                .Include(p => p.Photos)
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
                First grab the table of users and select the current user's UserConcert column.
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
            // Query gender first because, for the time being, if a gender is selected, then it will reduce
            // the table size by ~50% reducing time spent on later operations
            if (userParams.Gender != "both") {
                users = users.Where(u => u.Gender == userParams.Gender);
            }

            // Filter the users by age
            var minDob = DateTime.UtcNow.AddYears(-userParams.MaxAge-1); // How far you want to go back to check user's Dob preference. Eg. max age they want is 30 so minDob would be 30 years before current date
            var maxDob = DateTime.UtcNow.AddYears(-userParams.MinAge);

            users = users.Where(u => u.DateOfBirth >= minDob && u.DateOfBirth <= maxDob);



            // Filter out users who are have not liked the same concert
            /*
            Check to filter by concert before distance. Need to check but distance seems like an expensive operation
            so filtering out by concert first should reduce the list by a decent amount.
            This is done by inner joining the user's list of userConcerts with a list of all userConcerts
            on matching concert Id's and then selecting the distinct appUsers from the returned list  
            */           
            if (userParams.ConcertFilter) {
                // Get the list of user concerts for everyone except the current user
                var allUserConcerts = _context.Users
                    .Include(uc => uc.UserConcert)
                    .Where(u => u.UserName != userParams.CurrentUsername)
                    .SelectMany(u => u.UserConcert); // A list of all userConcerts where sourceUserID != currentUserID
                
                // Get the list of user concerts for the current user
                var currentUserConcerts = _context.Users
                    .Include(uc => uc.UserConcert)
                    .Where(u => u.UserName == userParams.CurrentUsername)
                    .SelectMany(u => u.UserConcert);
                    
                /*  
                    Inner join allUserConcerts(not including current user(1)) with currentUserConcerts on matching concert Id's

                    User 1 UserConcert          User 2 UserConcert         User 3 UserConcert           User 4 UserConcert          AllUserConcerts
                    ========================    ========================   ========================     ========================    ========================
                    UserUd: 1 - ConcertId: 2    UserUd: 2 - ConcertId: 2   UserUd: 3 - ConcertId: 1     UserUd: 4 - ConcertId: 1    UserUd: 2 - ConcertId: 2
                    UserUd: 1 - ConcertId: 3    UserUd: 2 - ConcertId: 4   UserUd: 3 - ConcertId: 4     UserUd: 4 - ConcertId: 2    UserUd: 2 - ConcertId: 4
                    UserUd: 1 - ConcertId: 5    UserUd: 2 - ConcertId: 5   UserUd: 3 - ConcertId: 7     UserUd: 4 - ConcertId: 8    UserUd: 2 - ConcertId: 5
                    UserUd: 1 - ConcertId: 8                                                                                        UserUd: 3 - ConcertId: 1
                                                                                                                                    UserUd: 3 - ConcertId: 4
                                                                                                                                    UserUd: 3 - ConcertId: 7
                                                                                                                                    UserUd: 4 - ConcertId: 1
                                                                                                                                    UserUd: 4 - ConcertId: 2
                                                                                                                                    UserUd: 4 - ConcertId: 8

                    AllUserConcerts                     currentUserConcerts                     userConcerts
                    ========================    join    ========================    equals      ========================    
                    UserUd: 2 - ConcertId: 2            UserUd: 1 - ConcertId: 2                UserUd: 2 - ConcertId: 2    
                    UserUd: 2 - ConcertId: 4            UserUd: 1 - ConcertId: 3                UserUd: 4 - ConcertId: 2    
                    UserUd: 2 - ConcertId: 5            UserUd: 1 - ConcertId: 5                UserUd: 2 - ConcertId: 5    
                    UserUd: 3 - ConcertId: 1            UserUd: 1 - ConcertId: 8                UserUd: 4 - ConcertId: 8    
                    UserUd: 3 - ConcertId: 4
                    UserUd: 3 - ConcertId: 7
                    UserUd: 4 - ConcertId: 1
                    UserUd: 4 - ConcertId: 2
                    UserUd: 4 - ConcertId: 8          

                    Then select the resulting list of userConcerts' AppUsers and call Distinct() to remove any duplicates
                    Returns [ AppUser<Id=2>, AppUser<Id=4> ]                     
                */
                users = allUserConcerts // Outer - The first sequence to join
                    .Join(currentUserConcerts, // Inner - The sequence to join to the first sequence
                        uc => uc.ConcertId, // Outer key selector - A function to extract the join key from each element of the first sequence
                        c => c.ConcertId, // Inner key selector - A function to extract the join key from each element of the second sequence
                        (uc, c) => uc.User) // Result selector - A function to create a result element from two matching elements
                        .Distinct(); // Stops duplicate users returned if they like more than one of the same concert

            }

            // Filter by distance
            // Formula for distance using latitude and longitude
            // =acos(sin(lat1)*sin(lat2)+cos(lat1)*cos(lat2)*cos(lon2-lon1))*3,958.8 mi
            if (userParams.Distance != 100) { // 100 is the value set for the search radius to extend to anywhere
                
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

            // Filter out the current user. Done at the end because it's guarunteed that every user will pass except for one
            users = users.Where(u => u.UserName != userParams.CurrentUsername);

            /*
            // Get the current userLikes to join to the list of users
            var currentUserLikes = _context.Users
                .Include(ul => ul.LikedUsers)
                .Where(u => u.UserName == userParams.CurrentUsername)
                .SelectMany(u => u.LikedUsers);

            // Get the current userDislikes to join to the list of users
            var currentUserDislikes = _context.Users
                .Include(ul => ul.DislikedUsers)
                .Where(u => u.UserName == userParams.CurrentUsername)
                .SelectMany(u => u.DislikedUsers);
            */
            // Get the current users likedUserIds
            var userLikes = _context.Users
                .Include(ul => ul.LikedUsers)
                .Where(u => u.UserName == userParams.CurrentUsername)
                .SelectMany(u => u.LikedUsers)
                .Select(u => u.LikedUserId);
            // Get the current current users dislikedUserIds
            var userDislikes = _context.Users
                .Include(ul => ul.DislikedUsers)
                .Where(u => u.UserName == userParams.CurrentUsername)
                .SelectMany(u => u.DislikedUsers)
                .Select(u => u.DislikedUserId);

            // Merge the two lists
            var likesDislikes = userLikes.Union(userDislikes);

            
            // Filter out the liked and disliked users
            /*
            Filter out all of the users the current user has already liked and disliked.
            This is done using a left exclusionary join. Perform a left join of
            the list of users on the current user's userLikes and dislikes based on matching user
            Id with the target userId. Then call selectMany to project each 
            element of the sequence to an IEnumerable<T>, flatten the resulting sequences 
            into one sequence, and invoke a result selector function on each element therein.
            Calling DefaultIfEmpty() in the resulting function performs the left join and 
            projects the result onto a new object containing the appUser and associated userId even if null.
            Then filter out all instances where the userId is not equal to null (if userId is not null
            then the user has already liked or disliked them) and select the appUsers to return
            */
            users = users
                .GroupJoin(likesDislikes,
                    u => u.Id,
                    uldl => uldl,
                    (u, uldl) => new { u, uldl}) // GroupJoin returns new list containing AppUser u and an IEnumerable<UserLike> ul
                .SelectMany( // Projects each element of the list into an IEnumerable so you have an IEnumerable<AppUser>
                             // and IEnumerable<IEnumerable<UserLike>> for each element 
                    left => left.uldl.DefaultIfEmpty(), // Calling defaultIfEmpty performs the left join. Then filter out the results the have an associated userLike
                    (u, ul) => new { u.u, ul })
                .Where(newList => newList.ul.Equals(null))
                .Select(newList => newList.u);  
            
            /* Filtering out the liked and diskliked users seperately */
            /*********************************************************
            users = users
                .GroupJoin(currentUserLikes,
                    u => u.Id, 
                    ul => ul.LikedUserId,
                    (u, ul) => new { u, ul}) // GroupJoin returns new list containing AppUser u and an IEnumerable<UserLike> ul
                .SelectMany( // Projects each element of the list into an IEnumerable so you have an IEnumerable<AppUser>
                             // and IEnumerable<IEnumerable<UserLike>> for each element 
                    left => left.ul.DefaultIfEmpty(), // Calling defaultIfEmpty performs the left join. Then filter out the results the have an associated userLike
                    (u, ul) => new { u.u, ul })
                .Where(newList => newList.ul == null)
                .Select(newList => newList.u);  

            users = users
                .GroupJoin(currentUserDislikes,
                    u => u.Id, 
                    ul => ul.DislikedUserId,
                    (u, ul) => new { u, ul}) // GroupJoin returns new list containing AppUser u and an IEnumerable<UserLike> ul
                .SelectMany( // Projects each element of the list into an IEnumerable so you have an IEnumerable<AppUser>
                             // and IEnumerable<IEnumerable<UserLike>> for each element 
                    left => left.ul.DefaultIfEmpty(), // Calling defaultIfEmpty performs the left join. Then filter out the results the have an associated userLike
                    (u, ul) => new { u.u, ul })
                .Where(newList => newList.ul == null)
                .Select(newList => newList.u);  
            ***********************************************************/

            /* Alternate method of filtering out liked users using .Except() */
            /***************************************
            var innerJoin = users
                .Join(currentUserLikes,
                        u => u.Id,
                        ul => ul.LikedUserId,
                        (u, ul) => new { u, ul });

            var altFilt = users
                .GroupJoin(currentUserLikes,
                    u => u.Id, 
                    ul => ul.LikedUserId,
                    (u, ul) => new { u, ul})
                .SelectMany(
                    left => left.ul.DefaultIfEmpty(),
                    (u, ul) => new { u.u, ul });
                
            var altResults = altFilt.Except(innerJoin)
                .Select(results => results.u);
            ****************************************/

            // Use orderBy after everything has been filtered so time isn't wasted sorting a large collection
            // before throwing out items in the filtering process
            users = userParams.OrderBy switch
            {
                "created" => users.OrderByDescending(u => u.Created),
                _ => users.OrderByDescending(u => u.LastActive) // Underscore is used to denote the default switch case
            };
            
            return await PagedList<MemberDto>.CreateAsync(users.ProjectTo<MemberDto>(_mapper
                .ConfigurationProvider).AsNoTracking(), 
                    userParams.PageNumber, userParams.PageSize);

            /* Testing include statements to see what is included with liked and likedBy */
            /**************************************************************
            var test1 = _context.Users
                    .Include(ul => ul.LikedByUsers)
                    .Where(u => u.UserName == userParams.CurrentUsername)
                    .SelectMany(u => u.LikedByUsers);
            var test2 = _context.Users // IQueryable with likedBy
                    .Include(ul => ul.LikedByUsers)
                    .Where(u => u.UserName == userParams.CurrentUsername);

            // 3 doesn't include the app users for liked user on 2 out of 3
            var test3 = _context.Users // IIncludableQueryable with both liked and liked by
                    .Where(u => u.UserName == userParams.CurrentUsername)
                    .Include(ul => ul.LikedUsers);
                    
            // 4 and 5 both have the app user objects for source and liked user in liked users
            var test4 = _context.Users
                    .Where(u => u.UserName == userParams.CurrentUsername)
                    .Include(ul => ul.LikedUsers);
            var test5 = _context.Users
                    .Where(u => u.UserName == userParams.CurrentUsername);
            ****************************************************************/
        }
        // public async Task<MemberDto> CheckMatch(UserParams userParams, int likedUserId)
        // {
        //     var users = _context.Users.AsQueryable();

        //     // Get the current users likedUserIds
        //     var userLikes = users
        //         .Include(ul => ul.LikedUsers)
        //         .Where(u => u.UserName == userParams.CurrentUsername)
        //         .SelectMany(u => u.LikedUsers);
            
        //     var likedUser = userLikes
        //         .Where(ul => ul.LikedUserId == likedUserId)
        //         .Select(ul => ul.LikedUser)
        //         .ProjectTo<MemberDto>(_mapper.ConfigurationProvider);

        //     if (likedUser != null) {
        //         return await likedUser.FirstOrDefaultAsync();
        //     }
        //     else {
        //         return null;
        //     }
        // }
    }
}