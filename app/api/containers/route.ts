import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/fileUtils"

export async function GET() {
  try {
    let containers = await readJsonFile("containers.json")

    // Generate sample containers if none exist
    if (containers.length === 0) {
      const sampleContainers = Array.from({ length: 10 }, (_, i) => ({
        id: `CONT-${Date.now()}-${i + 1}`,
        weight: Math.floor(Math.random() * 10) + 15, // 15-25L
        manufactureDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        approved: null,
        testerId: null,
        testNotes: "",
        createdAt: new Date().toISOString(),
      }))

      containers = sampleContainers
      await writeJsonFile("containers.json", containers)
    }

    return NextResponse.json(containers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch containers" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    const containers = await readJsonFile("containers.json")

    const containerIndex = containers.findIndex((container: any) => container.id === id)
    if (containerIndex === -1) {
      return NextResponse.json({ error: "Container not found" }, { status: 404 })
    }

    containers[containerIndex] = {
      ...containers[containerIndex],
      ...updateData,
      testedAt: new Date().toISOString(),
    }

    await writeJsonFile("containers.json", containers)
    return NextResponse.json(containers[containerIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update container" }, { status: 500 })
  }
}
