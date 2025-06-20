import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile, generateId } from "@/lib/fileUtils"

export async function GET() {
  try {
    const feedback = await readJsonFile("feedback.json")
    return NextResponse.json(feedback)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const feedbackData = await request.json()
    const feedback = await readJsonFile("feedback.json")

    const newFeedback = {
      id: generateId(),
      ...feedbackData,
      createdAt: new Date().toISOString(),
    }

    feedback.push(newFeedback)
    await writeJsonFile("feedback.json", feedback)

    return NextResponse.json(newFeedback, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create feedback" }, { status: 500 })
  }
}
