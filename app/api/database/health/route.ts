import { NextResponse } from "next/server";
import { healthCheck } from "@/lib/database";

export async function GET() {
  try {
    const status = await healthCheck();

    return NextResponse.json(status, {
      status: status.status === "healthy" ? 200 : 503,
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        message: "Database health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
