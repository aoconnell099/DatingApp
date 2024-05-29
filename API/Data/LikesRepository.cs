using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;

namespace API.Data
{
    public class LikesRepository : ILikesRepository
    {
        private readonly DataContext _context;
        public LikesRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<UserLike> GetUserLike(int sourceUserId, int likedUserId)
        {
            return await _context.Likes.FindAsync(sourceUserId, likedUserId);
        }

        public async Task<UserDislike> GetUserDislike(int sourceUserId, int dislikedUserId)
        {
            return await _context.Dislikes.FindAsync(sourceUserId, dislikedUserId);
        }

        public async Task<PagedList<LikeDto>> GetUserLikes(LikesParams likesParams)
        {
            var users = _context.Users.OrderBy(u => u.UserName).AsQueryable();
            var likes = _context.Likes.AsQueryable();

            if (likesParams.Predicate == "liked")
            {
                likes = likes.Where(like => like.SourceUserId == likesParams.UserId);
                users = likes.Select(like => like.LikedUser);
            }

            if (likesParams.Predicate == "likedBy")
            {
                likes = likes.Where(like => like.LikedUserId == likesParams.UserId);
                users = likes.Select(like => like.SourceUser);
            }

            var likedUsers = users.Select(user => new LikeDto
            {
                Username = user.UserName, 
                KnownAs = user.KnownAs,
                Age = user.DateOfBirth.CalculateAge(),
                PhotoUrl = user.Photos.FirstOrDefault(p => p.IsMain).Url,
                City = user.City,
                Id = user.Id
            });

            return await PagedList<LikeDto>.CreateAsync(likedUsers, likesParams.PageNumber, likesParams.PageSize);
        }
        
        public async Task<PagedList<DislikeDto>> GetUserDislikes(DislikesParams dislikesParams)
        {
            var users = _context.Users.AsQueryable(); //.OrderBy(u => u.UserName)
            var dislikes = _context.Dislikes.AsQueryable();

            if (dislikesParams.Predicate == "liked")
            {
                dislikes = dislikes.Where(dislike => dislike.SourceUserId == dislikesParams.UserId);
                users = dislikes.Select(dislike => dislike.DislikedUser);
            }

            if (dislikesParams.Predicate == "likedBy")
            {
                dislikes = dislikes.Where(dislike => dislike.DislikedUserId == dislikesParams.UserId);
                users = dislikes.Select(dislike => dislike.SourceUser);
            }

            var dislikedUsers = users.Select(user => new DislikeDto
            {
                Username = user.UserName, 
                KnownAs = user.KnownAs,
                Age = user.DateOfBirth.CalculateAge(),
                PhotoUrl = user.Photos.FirstOrDefault(p => p.IsMain).Url,
                City = user.City,
                Id = user.Id
            });

            return await PagedList<DislikeDto>.CreateAsync(dislikedUsers, dislikesParams.PageNumber, dislikesParams.PageSize);
        }

        public async Task<AppUser> GetUserWithLikes(int userId)
        {
            return await _context.Users
                .Include(x => x.LikedUsers)
                .FirstOrDefaultAsync(x => x.Id == userId);
        }
        
        public async Task<AppUser> GetUserWithDislikes(int userId)
        {
            return await _context.Users
                .Include(x => x.DislikedUsers)
                .FirstOrDefaultAsync(x => x.Id == userId);
        }
    }
}