using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveEmailAddEmploymentTypeToFarmerOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailAddress",
                table: "FarmerOffers");

            migrationBuilder.AddColumn<int>(
                name: "EmploymentType",
                table: "FarmerOffers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmploymentType",
                table: "FarmerOffers");

            migrationBuilder.AddColumn<string>(
                name: "EmailAddress",
                table: "FarmerOffers",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
