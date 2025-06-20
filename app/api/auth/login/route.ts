import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile } from "@/lib/fileUtils"

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json()
    const users = await readJsonFile("users.json")

    // Find user with matching email and userType
    const user = users.find((u: any) => u.email === email && u.userType === userType)

    if (!user) {
      return NextResponse.json({ error: "User not found or incorrect user type" }, { status: 401 })
    }

    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
