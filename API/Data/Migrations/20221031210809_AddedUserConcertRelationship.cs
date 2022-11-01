using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    public partial class AddedUserConcertRelationship : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Concerts_AspNetUsers_AppUserId",
                table: "Concerts");

            migrationBuilder.DropIndex(
                name: "IX_Concerts_AppUserId",
                table: "Concerts");

            migrationBuilder.DropColumn(
                name: "AppUserId",
                table: "Concerts");

            migrationBuilder.CreateTable(
                name: "UserConcert",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ConcertId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserConcert", x => new { x.UserId, x.ConcertId });
                    table.ForeignKey(
                        name: "FK_UserConcert_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserConcert_Concerts_ConcertId",
                        column: x => x.ConcertId,
                        principalTable: "Concerts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserConcert_ConcertId",
                table: "UserConcert",
                column: "ConcertId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserConcert");

            migrationBuilder.AddColumn<int>(
                name: "AppUserId",
                table: "Concerts",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Concerts_AppUserId",
                table: "Concerts",
                column: "AppUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Concerts_AspNetUsers_AppUserId",
                table: "Concerts",
                column: "AppUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
