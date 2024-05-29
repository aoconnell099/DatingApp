using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using API.DTOs;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class LikesController : BaseApiController
    {
        private readonly IUnitOfWork _unitOfWork;
        
        public LikesController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        } 
        
        [HttpPost("{username}")]
        public async Task<ActionResult> AddLike(string username)
        {
            var sourceUserId = User.GetUserId();
            var likedUser = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username);
            var sourceUser = await _unitOfWork.LikesRepository.GetUserWithLikes(sourceUserId);

            if (likedUser == null) return NotFound();

            if (sourceUser.UserName == username) return BadRequest("You cannot like yourself");

            var userLike = await _unitOfWork.LikesRepository.GetUserLike(sourceUserId, likedUser.Id);

            if (userLike != null) return BadRequest("You already like this user"); // Can add a toggle here to remove the like if pressed again. Implement later

            userLike = new Entities.UserLike
            {
                SourceUserId = sourceUserId,
                LikedUserId = likedUser.Id
            };

            sourceUser.LikedUsers.Add(userLike);

            // Check if the user has been liked by the user they just liked and return the userLike if true to trigger the match modal
            var checkMatch = await _unitOfWork.LikesRepository.GetUserLike(likedUser.Id, sourceUserId) == null ? false : true;

            if (await _unitOfWork.Complete()) return Ok(checkMatch);

            return BadRequest("Failed to like user");

        }
        
        [HttpPost("dislike/{username}")]
        public async Task<ActionResult> AddDislike(string username)
        {
            var sourceUserId = User.GetUserId();
            var dislikedUser = await _unitOfWork.UserRepository.GetUserByUsernameAsync(username);
            var sourceUser = await _unitOfWork.LikesRepository.GetUserWithDislikes(sourceUserId);

            if (dislikedUser == null) return NotFound();

            if (sourceUser.UserName == username) return BadRequest("You cannot dislike yourself");

            var userDislike = await _unitOfWork.LikesRepository.GetUserDislike(sourceUserId, dislikedUser.Id);

            if (userDislike != null) return BadRequest("You already dislike this user"); // Can add a toggle here to remove the like if pressed again. Implement later

            userDislike = new Entities.UserDislike
            {
                SourceUserId = sourceUserId,
                DislikedUserId = dislikedUser.Id
            };

            sourceUser.DislikedUsers.Add(userDislike);

            if (await _unitOfWork.Complete()) return Ok();

            return BadRequest("Failed to dislike user");

        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LikeDto>>> GetUserLikes([FromQuery]LikesParams likesParams)
        {
            likesParams.UserId = User.GetUserId();
            var users = await _unitOfWork.LikesRepository.GetUserLikes(likesParams);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, 
                users.TotalCount, users.TotalPages);

            return Ok(users);
        }
        
        [HttpGet("dislikes")]
        public async Task<ActionResult<IEnumerable<DislikeDto>>> GetUserDislikes([FromQuery]DislikesParams dislikesParams)
        {
            dislikesParams.UserId = User.GetUserId();
            var users = await _unitOfWork.LikesRepository.GetUserDislikes(dislikesParams);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, 
                users.TotalCount, users.TotalPages);

            return Ok(users);
        }
    }
}