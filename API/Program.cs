using API.Data;
using API.Entities;
using API.Extensions;
using API.Middleware;
using API.SignalR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// services container

builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddControllers();
builder.Services.AddControllers().AddNewtonsoftJson();
builder.Services.AddCors();
builder.Services.AddIdentityServices(builder.Configuration);

var connStr = "";

// Depending on if in development or production, use either fly.io-provided
// connection string, or development connection string from env var.
if (builder.Environment.IsDevelopment())
{
    // Use connection string from file.
    connStr = builder.Configuration.GetConnectionString("DefaultConnection");
}
else
{
    // connStr = builder.Configuration.GetConnectionString("DefaultConnection");
    var connUrl = Environment.GetEnvironmentVariable("DATABASE_URL");

    // Parse connection URL to connection string for Npgsql
    connUrl = connUrl.Replace("postgres://", string.Empty);
    var pgUserPass = connUrl.Split("@")[0];
    var pgHostPortDb = connUrl.Split("@")[1];
    var pgHostPort = pgHostPortDb.Split("/")[0];
    var pgDb = pgHostPortDb.Split("/")[1];
    var pgUser = pgUserPass.Split(":")[0];
    var pgPass = pgUserPass.Split(":")[1];
    var pgHost = pgHostPort.Split(":")[0];
    var pgPort = pgHostPort.Split(":")[1];
    var updatedHost = pgHost.Replace("flycast", "internal");

    connStr = $"Server={updatedHost};Port={pgPort};User Id={pgUser};Password={pgPass};Database={pgDb};"; //SSL Mode=Require;TrustServerCertificate=True
}

builder.Services.AddDbContext<DataContext>(opt =>
{
    opt.UseNpgsql(connStr);
});


builder.Services.AddHttpClient(); // Register the IHttpClientFactory
var redisConn = "";
if (builder.Environment.IsDevelopment()) {
builder.Services.AddSignalR();
}
else {
 //redisConn = builder.Configuration.GetConnectionString("RedisConnection");
 redisConn = Environment.GetEnvironmentVariable("RedisConnection");
//  var config = ConfigurationOptions.Parse(redisConn, true);
// var conn = ConnectionMultiplexer.Connect(config);
// builder.Services.AddDataProtection().PersistKeysToStackExchangeRedis(conn); 
 builder.Services.AddSignalR().AddStackExchangeRedis(redisConn);//, options => {
      //options.Configuration.ChannelPrefix = RedisChannel.Literal("MyApp");
  //});
}
// Probably unnecessary..leave for now
builder.Services.AddSwaggerGen(c =>
{   
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "WebAPIv5", Version = "v1" });
});


// middleware

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors(policy => policy.AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()
    .WithOrigins("https://localhost:4200", "https://app.ticketmaster.com/discovery/v2/")); //UseCors must be between UseRouting and UseEndpoints. Must also be called before UseAuthorization

app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();
app.MapHub<PresenceHub>("hubs/presence");
app.MapHub<MessageHub>("hubs/message");
app.MapFallbackToController("Index", "Fallback");

// Fix date error for postgres and .net
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();
    await context.Database.MigrateAsync(); // Update database
    await Seed.ClearConnections(context);
    await Seed.SeedUsers(userManager, roleManager);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError(ex, "An error occurred during migration");
}

app.Run();
