import { type NextRequest, NextResponse } from "next/server";
import { FeedbackService } from "@/lib/database-service";
import { generateId } from "@/lib/fileUtils";

export async function GET() {
  try {
    const feedback = await FeedbackService.getAllFeedback();
    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json();

    const newFeedback = {
      id: generateId(),
      ...feedbackData,
    };

    const createdFeedback = await FeedbackService.createFeedback(newFeedback);

    return NextResponse.json(createdFeedback, { status: 201 });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json(
      { error: "Failed to create feedback" },
      { status: 500 }
    );
  }
}
