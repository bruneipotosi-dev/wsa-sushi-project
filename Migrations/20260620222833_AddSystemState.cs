using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BlueHarbor.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Berths",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 20, nullable: false),
                    Size = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Berths", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Ships",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", maxLength: 100, nullable: false),
                    Size = table.Column<string>(type: "TEXT", nullable: false),
                    ArrivalDay = table.Column<int>(type: "INTEGER", nullable: false),
                    OccupationDuration = table.Column<int>(type: "INTEGER", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false),
                    Notes = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ships", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemStates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    CurrentDay = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemStates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Assignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ShipId = table.Column<int>(type: "INTEGER", nullable: false),
                    BerthId = table.Column<int>(type: "INTEGER", nullable: false),
                    StartDay = table.Column<int>(type: "INTEGER", nullable: false),
                    EndDay = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Assignments_Berths_BerthId",
                        column: x => x.BerthId,
                        principalTable: "Berths",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Assignments_Ships_ShipId",
                        column: x => x.ShipId,
                        principalTable: "Ships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Berths",
                columns: new[] { "Id", "Name", "Size" },
                values: new object[,]
                {
                    { 1, "XL-1", "XL" },
                    { 2, "L-1", "L" },
                    { 3, "M-1", "M" },
                    { 4, "M-2", "M" },
                    { 5, "S-1", "S" },
                    { 6, "S-2", "S" },
                    { 7, "S-3", "S" },
                    { 8, "S-4", "S" }
                });

            migrationBuilder.InsertData(
                table: "SystemStates",
                columns: new[] { "Id", "CurrentDay" },
                values: new object[] { 1, 1 });

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_BerthId",
                table: "Assignments",
                column: "BerthId");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_ShipId",
                table: "Assignments",
                column: "ShipId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Assignments");

            migrationBuilder.DropTable(
                name: "SystemStates");

            migrationBuilder.DropTable(
                name: "Berths");

            migrationBuilder.DropTable(
                name: "Ships");
        }
    }
}
