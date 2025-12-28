import { type NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/database-service";
import { generateId } from "@/lib/fileUtils";

export async function GET() {
  try {
    const users = await UserService.getAllUsers();

    // Remove password from response
    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json(usersWithoutPassword);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Check if email already exists
    const existingUser = await UserService.getUserByEmail(userData.email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: generateId(),
      ...userData,
    };

    const createdUser = await UserService.createUser(newUser);

    // Return user without password
    const { password, ...userWithoutPassword } = createdUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
