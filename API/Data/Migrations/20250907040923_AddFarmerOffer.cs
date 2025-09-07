using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddFarmerOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FarmerOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    OwnerId = table.Column<string>(type: "TEXT", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", nullable: false),
                    ContactNumber = table.Column<string>(type: "TEXT", nullable: false),
                    EmailAddress = table.Column<string>(type: "TEXT", nullable: false),
                    CurrentAddress = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Age = table.Column<int>(type: "INTEGER", nullable: true),
                    IsAvailable = table.Column<bool>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FarmerOffers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FarmerOffers_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FarmerOfferPhotos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Url = table.Column<string>(type: "TEXT", nullable: false),
                    IsMain = table.Column<bool>(type: "INTEGER", nullable: false),
                    FarmerOfferId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FarmerOfferPhotos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FarmerOfferPhotos_FarmerOffers_FarmerOfferId",
                        column: x => x.FarmerOfferId,
                        principalTable: "FarmerOffers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FarmerOfferPhotos_FarmerOfferId",
                table: "FarmerOfferPhotos",
                column: "FarmerOfferId");

            migrationBuilder.CreateIndex(
                name: "IX_FarmerOffers_OwnerId",
                table: "FarmerOffers",
                column: "OwnerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FarmerOfferPhotos");

            migrationBuilder.DropTable(
                name: "FarmerOffers");
        }
    }
}
