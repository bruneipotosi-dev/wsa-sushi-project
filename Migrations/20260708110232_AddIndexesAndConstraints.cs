using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlueHarbor.API.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexesAndConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Assignments_BerthId",
                table: "Assignments");

            migrationBuilder.RenameColumn(
                name: "ShipName",
                table: "PortLogs",
                newName: "Timestamp");

            migrationBuilder.AddColumn<string>(
                name: "Action",
                table: "PortLogs",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Details",
                table: "PortLogs",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "PortLogs",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Ships_ArrivalDay",
                table: "Ships",
                column: "ArrivalDay");

            migrationBuilder.CreateIndex(
                name: "IX_Ships_Status",
                table: "Ships",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "UX_Assignments_BerthId_StartDay_EndDay",
                table: "Assignments",
                columns: new[] { "BerthId", "StartDay", "EndDay" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ships_ArrivalDay",
                table: "Ships");

            migrationBuilder.DropIndex(
                name: "IX_Ships_Status",
                table: "Ships");

            migrationBuilder.DropIndex(
                name: "UX_Assignments_BerthId_StartDay_EndDay",
                table: "Assignments");

            migrationBuilder.DropColumn(
                name: "Action",
                table: "PortLogs");

            migrationBuilder.DropColumn(
                name: "Details",
                table: "PortLogs");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "PortLogs");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "PortLogs",
                newName: "ShipName");

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_BerthId",
                table: "Assignments",
                column: "BerthId");
        }
    }
}
