import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile, generateId } from "@/lib/fileUtils"

export async function GET() {
  try {
    const users = await readJsonFile("users.json")
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()
    const users = await readJsonFile("users.json")

    // Check if email already exists
    const existingUser = users.find((user: any) => user.email === userData.email)
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Create new user
    const newUser = {
      id: generateId(),
      ...userData,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    await writeJsonFile("users.json", users)

    // Return user without password
    const { password, ...userWithoutPassword } = newUser
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
