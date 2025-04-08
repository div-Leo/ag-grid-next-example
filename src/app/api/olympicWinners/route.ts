import { NextRequest, NextResponse } from "next/server";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { executeQuery } from "../../utils/database";

/**
 * Class to handle Olympic Winners data retrieval
 */
class OlympicWinnersService {
  /**
   * Get data from the database based on request parameters
   * @param request The AG Grid server request
   * @returns Promise with results and row count
   */
  static async getData(request: any) {
    try {
      // Generate SQL using QueryBuilder
      const SQL = QueryBuilder.getRowsSql(request);
      console.log("Generated SQL:", SQL);

      // Execute the query using our database utility
      const results = await executeQuery(SQL) as any[];

      // Get total row count (for pagination)
      const rowCount = results.length;

      // Return the results
      return {
        rows: results,
        lastRow: rowCount,
        success: true
      };
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }
}

// POST handler for Olympic winners data
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();

    try {
      // Try to get data from database
      const result = await OlympicWinnersService.getData(requestData);
      return NextResponse.json(result);
    } catch (dbError) {
      console.error("Database error:", dbError);

      // Fallback: Just return the SQL query for debugging if DB connection fails
      const sqlQuery = QueryBuilder.getRowsSql(requestData);
      return NextResponse.json({
        rows: [],
        lastRow: 0,
        success: true,
        sqlQuery: sqlQuery,
        notice: "Using fallback mode - database connection failed"
      });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
} 