using System.Xml.Serialization;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel;
using System.Security.Claims;
using API.Extensions;
using API.Services;
using API.Helpers;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;
        private readonly IUnitOfWork _unitOfWork;

        public UsersController(IUnitOfWork unitOfWork, IMapper mapper, 
            IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _photoService = photoService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery]UserParams userParams)
        {
            var gender = await _unitOfWork.UserRepository.GetUserGender(User.GetUsername());
            userParams.CurrentUsername = User.GetUsername();

            if (string.IsNullOrEmpty(userParams.Gender))
                userParams.Gender = gender == "male" ? "female" : "male";

            var users = await _unitOfWork.UserRepository.GetMembersAsync(userParams);

            Response.AddPaginationHeader(users.CurrentPage, users.PageSize, users.TotalCount, users.TotalPages);

            return Ok(users);
        }

        [HttpGet("{username}", Name = "GetUser")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            var currentUsername = User.GetUsername();
            return await _unitOfWork.UserRepository.GetMemberAsync(username,
                isCurrentUser: currentUsername == username
            );
        }

        [HttpPut] // Used to update a resource on a server
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto) 
        { // Don't need to return any objects because the client already has all of the data related to the entity being updated 
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername()); // Gets the user's username from the token that the api uses to authenticate the user

            _mapper.Map(memberUpdateDto, user);

            _unitOfWork.UserRepository.Update(user);

            if (await _unitOfWork.Complete()) return NoContent(); // Content is saved. Don't need to return any data for a put request

            return BadRequest("Failed to update user");
        } 

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername()); // Get the user. GetUserByUsernameAsync includes the photos in the return object

            var result = await _photoService.AddPhotoAsync(file); // Get the result back from the photo service/cloudinary. This service method is where the photo is added to cloudinary

            if (result.Error != null) return BadRequest(result.Error.Message); // The result object will have an error property if there is an error. If no error then result.Error will be null

            var photo = new Photo // If you make it here then there was no error so create a new photo to be added
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };

            // Commented out for now. Checks if its their first photo and sets it to main if true.
            // Current logig for photo mod requires approval before setting it as the main photo
            // if (user.Photos.Count == 0) // Check to see if the user has any photos in their collection. If not then set it to the main photo
            // {
            //     photo.IsMain = true;
            // }

            user.Photos.Add(photo);

            if (await _unitOfWork.Complete()) // Return the photo and map it to a dto to be saved in the db
            {
                return CreatedAtRoute("GetUser", new {username = user.UserName}, _mapper.Map<PhotoDto>(photo)); // Return a 201 with the route of how to get the user which contains the photos and the photo object
            }
                
        
            return BadRequest("Problem adding photo");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername()); // When you get the username from the token, you are validating that the user is who they say they are

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);  // This is not async because the photos are already in memory instead of the database because of the previous function
                                                                            // GetUserByUsername has an eager loading property for the user's photo collection, so you have access to the user's photos inside of here
            if (photo.IsMain) return BadRequest("This is already your main photo");

            var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
            if (currentMain != null) currentMain.IsMain = false;
            photo.IsMain = true;

            if (await _unitOfWork.Complete()) return NoContent();

            return BadRequest("Failed to set main photo");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<ActionResult> DeletePhoto(int photoId)
        {
            var user = await _unitOfWork.UserRepository.GetUserByUsernameAsync(User.GetUsername());

            //var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            var photo = await _unitOfWork.PhotoRepository.GetPhotoById(photoId);

            if (photo == null) return NotFound();

            if (photo.IsMain) return BadRequest("You cannot delete your main photo");

            if (photo.PublicId != null)
            {
                var results = await _photoService.DeletePhotoAsync(photo.PublicId);
                if (results.Error != null) return BadRequest(results.Error.Message); // If you can't remove the photo from cloudinary, then back out of the function with the error message before deleting it from the database
            }

            user.Photos.Remove(photo);

            if (await _unitOfWork.Complete()) return Ok();

            return BadRequest("Failed to delete the photo");
        }
    }
}