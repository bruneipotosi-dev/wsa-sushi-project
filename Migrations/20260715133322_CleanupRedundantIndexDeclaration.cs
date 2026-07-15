using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BlueHarbor.API.Migrations
{
    /// <inheritdoc />
    public partial class CleanupRedundantIndexDeclaration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Assignments_BerthId",
                table: "Assignments");

            migrationBuilder.DeleteData(
                table: "SystemStates",
                keyColumn: "Id",
                keyValue: 1);

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
                name: "UX_Assignments_BerthId_StartDay_EndDay",
                table: "Assignments");

            migrationBuilder.InsertData(
                table: "SystemStates",
                columns: new[] { "Id", "CurrentDay" },
                values: new object[] { 1, 1 });

            migrationBuilder.CreateIndex(
                name: "IX_Assignments_BerthId",
                table: "Assignments",
                column: "BerthId");
        }
    }
}
