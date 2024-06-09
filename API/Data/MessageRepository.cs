using System.IO;
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
using SQLitePCL;
using API.Extensions;
using Microsoft.AspNetCore.Routing.Tree;

namespace API.Data.Migrations
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public MessageRepository(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public void AddGroup(Group group)
        {
            _context.Groups.Add(group);
        }

        public void AddMessage(Message message)
        {
            _context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Connection> GetConnection(string connectionId)
        {
            return await _context.Connections.FindAsync(connectionId);
        }

        public async Task<Group> GetGroupForConnection(string connectionId)
        {
            return await _context.Groups
                .Include(c => c.Connections)
                .Where(c => c.Connections.Any(x => x.ConnectionId == connectionId))
                .FirstOrDefaultAsync();
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages
                .Include(u => u.Sender)
                .Include(u => u.Recipient)
                .SingleOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Group> GetMessageGroup(string groupName)
        {
            return await _context.Groups
                .Include(x => x.Connections)
                .FirstOrDefaultAsync(x => x.Name == groupName);
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var query = _context.Messages
                .OrderByDescending(m =>m.MessageSent)
                .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                .AsQueryable();
                
            query = messageParams.Container switch
            {
                "Inbox" => query.Where(u => u.RecipientUsername == messageParams.Username 
                    && u.RecipientDeleted == false),
                "Outbox" => query.Where(u => u.SenderUsername == messageParams.Username
                    && u.SenderDeleted == false),
                _ => query.Where(u => u.RecipientUsername == 
                    messageParams.Username && u.RecipientDeleted == false && u.DateRead == null) // Default case of unread messages
            };

            return await PagedList<MessageDto>.CreateAsync(query, messageParams.PageNumber, messageParams.PageSize);

        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, 
            string recipientUsername)
        {
            using StreamWriter file = new("./Data/unread.txt", append: true);
            var messages = await _context.Messages
                //.Include(u => u.Sender).ThenInclude(p => p.Photos) // Eagerly load photos to display user photo in the thread
                //.Include(u => u.Recipient).ThenInclude(p => p.Photos)
                .Where(m => m.Recipient.UserName == currentUsername && m.RecipientDeleted == false
                        && m.Sender.UserName == recipientUsername
                        || m.Recipient.UserName == recipientUsername
                        && m.Sender.UserName == currentUsername && m.SenderDeleted == false
                )
                .MarkUnreadAsRead(currentUsername) // Use the extension method here to prevent EF change tracking not tracking the changes set in the unread messages. Previous method set the unread status after the projection
                .OrderBy(m => m.MessageSent)
                .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            // var unreadMessages = messages.Where(m => m.DateRead == null 
            //     && m.RecipientUsername == currentUsername).ToList();

            // unreadMessages.ForEach(async m => {
            //     await file.WriteLineAsync("All unread messages\n================\n" + "Current Username: " + currentUsername + "\n" + "Sender Username: " + m.SenderUsername + " -- Recipient Username: " + m.RecipientUsername + "\n ==================================================");
            // });

            // if (unreadMessages.Any())
            // {
            //     foreach (var message in unreadMessages)
            //     {
            //         message.DateRead = DateTime.UtcNow;
            //         await file.WriteLineAsync("Inside of for each message in unread\n===================\n" + "Current Username: " + currentUsername + "\n" + "Sender Username: " + message.SenderUsername + " -- Recipient Username: " + message.RecipientUsername + " -- New dateRead :" + message.DateRead + "\n ==================================================");
            //     }

            //     //await _context.SaveChangesAsync();
            // }

            return messages;
        }

        public async Task<IEnumerable<ConversationDto>> GetConversationsForUser(MessageParams messageParams) {
            //var messages = _context.Messages.AsQueryable();
            var userMessages = await _context.Messages
                .Where(u => u.RecipientUsername == messageParams.Username 
                    && u.RecipientDeleted == false || u.SenderUsername == messageParams.Username
                    && u.SenderDeleted == false)
                .Select(m => 
                    new ConversationDto {
                        OtherUser = m.SenderUsername == messageParams.Username ? m.RecipientUsername : m.SenderUsername,
                        OtherUserPhotoUrl = m.SenderUsername == messageParams.Username ? m.Recipient.Photos.FirstOrDefault(x => x.IsMain).Url : m.Sender.Photos.FirstOrDefault(x => x.IsMain).Url,
                        IsSender = m.SenderUsername == messageParams.Username ? true : false,
                        Content = m.Content,
                        MessageSent = m.MessageSent,
                        DateRead = m.DateRead,
                    })
                .OrderByDescending(m => m.MessageSent)
                .ToListAsync();

            var conversations = userMessages.DistinctBy(m => m.OtherUser);

            return conversations;

        }
        // public async Task<PagedList<ConversationDto>> GetConversationsForUser(MessageParams messageParams) {
        //     //var messages = _context.Messages.AsQueryable();
        //     var userMessages = _context.Messages
        //         .Where(u => u.RecipientUsername == messageParams.Username 
        //             && u.RecipientDeleted == false || u.SenderUsername == messageParams.Username
        //             && u.SenderDeleted == false)
        //         .Select(m => 
        //             new ConversationDto {
        //                 OtherUser = m.SenderUsername == messageParams.Username ? m.RecipientUsername : m.SenderUsername,
        //                 OtherUserPhotoUrl = m.SenderUsername == messageParams.Username ? m.Recipient.Photos.FirstOrDefault(x => x.IsMain).Url : m.Sender.Photos.FirstOrDefault(x => x.IsMain).Url,
        //                 IsSender = m.SenderUsername == messageParams.Username ? true : false,
        //                 Content = m.Content,
        //                 MessageSent = m.MessageSent,
        //                 DateRead = m.DateRead,
        //             })
        //         .OrderByDescending(m => m.MessageSent).AsEnumerable().DistinctBy(m => m.OtherUser);

        //     var conversations = userMessages.AsQueryable().Select(c => c);
        //     var conversations2 = userMessages.Select(c => c);

        //     return await PagedList<ConversationDto>.CreateAsync(conversations, messageParams.PageNumber, messageParams.PageSize); 
            

        // }

        public void RemoveConnection(Connection connection)
        {
            _context.Connections.Remove(connection);
        }

    }
}