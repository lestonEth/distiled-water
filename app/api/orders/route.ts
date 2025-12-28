import { type NextRequest, NextResponse } from "next/server";
import { OrderService } from "@/lib/database-service";
import { generateId } from "@/lib/fileUtils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const transporterId = searchParams.get("transporterId");

    let orders;

    if (userId) {
      orders = await OrderService.getOrdersByUserId(userId);
    } else if (transporterId) {
      orders = await OrderService.getOrdersByTransporterId(transporterId);
    } else {
      orders = await OrderService.getAllOrders();
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

    const newOrder = {
      id: generateId(),
      ...orderData,
    };

    const createdOrder = await OrderService.createOrder(newOrder);

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const updatedOrder = await OrderService.updateOrder(id, updateData);

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
