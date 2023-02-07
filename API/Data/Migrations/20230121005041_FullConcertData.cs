using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class FullConcertData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ConcertUrl",
                table: "Concerts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FbUrl",
                table: "Concerts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HomepageUrl",
                table: "Concerts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Concerts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstagramUrl",
                table: "Concerts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpotifyUrl",
                table: "Concerts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwitterUrl",
                table: "Concerts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VenueUrl",
                table: "Concerts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YoutubeUrl",
                table: "Concerts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConcertUrl",
                table: "Concerts");

            migrationBuilder.DropColumn(
                name: "FbUrl",
                table: "Concerts");

            migrationBuilder.DropColumn(
                name: "HomepageUrl",
                table: "Concerts");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Concerts");

            migrationBuilder.DropColumn(
                name: "InstagramUrl",
                table: "Concerts");

            migrationBuilder.DropColumn(
                name: "SpotifyUrl",
                table: "Concerts");

            migrationBuilder.DropColumn(
                name: "TwitterUrl",
                table: "Concerts");

            migrationBuilder.DropColumn(
                name: "VenueUrl",
                table: "Concerts");

            migrationBuilder.DropColumn(
                name: "YoutubeUrl",
                table: "Concerts");
        }
    }
}
