import { type NextRequest, NextResponse } from "next/server";
import { ContainerService } from "@/lib/database-service";
import { generateId } from "@/lib/fileUtils";

export async function GET() {
  try {
    let containers = await ContainerService.getAllContainers();

    // Generate sample containers if none exist
    if (containers.length === 0) {
      const sampleContainers = Array.from({ length: 10 }, (_, i) => ({
        id: `CONT-${Date.now()}-${i + 1}`,
        weight: Math.floor(Math.random() * 10) + 15, // 15-25L
        manufactureDate: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        approved: undefined,
        testerId: undefined,
        testNotes: "",
        testedAt: undefined,
        createdAt: new Date(),
      }));

      // Save sample containers to database
      for (const container of sampleContainers) {
        await ContainerService.createContainer(container);
      }

      containers = await ContainerService.getAllContainers();
    }

    return NextResponse.json(containers);
  } catch (error) {
    console.error("Error fetching containers:", error);
    return NextResponse.json(
      { error: "Failed to fetch containers" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Container ID is required" },
        { status: 400 }
      );
    }

    const updatedContainer = await ContainerService.updateContainer(
      id,
      updateData
    );

    if (!updatedContainer) {
      return NextResponse.json(
        { error: "Container not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedContainer);
  } catch (error) {
    console.error("Error updating container:", error);
    return NextResponse.json(
      { error: "Failed to update container" },
      { status: 500 }
    );
  }
}
