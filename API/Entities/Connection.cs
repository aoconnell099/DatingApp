namespace API.Entities
{
    public class Connection
    {
        public Connection()
        {
        }

        public Connection(string connectionId, string username)
        {
            ConnectionId = connectionId;
            Username = username;
        }

        public string ConnectionId { get; set; } // By convention, naming this "Class name" and then "Id" 
                                                 // causes EntityFramework to automatically consider this the primary key
        public string Username { get; set; }
    }
}