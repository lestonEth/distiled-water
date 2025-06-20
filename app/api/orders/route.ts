import { type NextRequest, NextResponse } from "next/server"
import { readJsonFile, writeJsonFile, generateId } from "@/lib/fileUtils"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const transporterId = searchParams.get("transporterId")

    const orders = await readJsonFile("orders.json")

    let filteredOrders = orders
    if (userId) {
      filteredOrders = orders.filter((order: any) => order.userId === userId)
    } else if (transporterId) {
      filteredOrders = orders.filter((order: any) => order.transporterId === transporterId)
    }

    return NextResponse.json(filteredOrders)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    const orders = await readJsonFile("orders.json")

    const newOrder = {
      id: generateId(),
      ...orderData,
      status: "pending",
      transporterId: null,
      createdAt: new Date().toISOString(),
    }

    orders.push(newOrder)
    await writeJsonFile("orders.json", orders)

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json()
    const orders = await readJsonFile("orders.json")

    const orderIndex = orders.findIndex((order: any) => order.id === id)
    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    }

    await writeJsonFile("orders.json", orders)
    return NextResponse.json(orders[orderIndex])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
