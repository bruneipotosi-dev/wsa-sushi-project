using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlueHarbor.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPortLogTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PortLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShipName = table.Column<string>(type: "TEXT", nullable: false),
                    ArrivalDay = table.Column<int>(type: "INTEGER", nullable: false),
                    DepartureDay = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortLogs", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PortLogs");
        }
    }
}
