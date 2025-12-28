// Database service layer for Distilled Water System
import { executeQuery, executeTransaction } from "./database";

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  userType: "user" | "admin" | "transporter";
  vehicleId?: string;
  vehicleName?: string;
  vehicleSize?: "small" | "medium" | "large";
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  quantity: number;
  deliveryAddress: string;
  preferredDeliveryTime: "morning" | "afternoon" | "evening";
  specialInstructions?: string;
  totalAmount: number;
  status: "pending" | "assigned" | "in_transit" | "delivered" | "cancelled";
  transporterId?: string;
  paymentMethod?: "cash" | "mpesa";
  paymentReference?: string;
  startTime?: Date;
  deliveredTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Container {
  id: string;
  weight: number;
  manufactureDate: Date;
  expiryDate: Date;
  approved?: boolean;
  testerId?: string;
  testNotes?: string;
  testedAt?: Date;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  userId: string;
  orderId: string;
  transporterId?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

// User Service
export class UserService {
  static async getAllUsers(): Promise<User[]> {
    const query = "SELECT * FROM users ORDER BY createdAt DESC";
    return executeQuery<User>(query);
  }

  static async getUserById(id: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE id = ?";
    const results = await executeQuery<User>(query, [id]);
    return results[0] || null;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE email = ?";
    const results = await executeQuery<User>(query, [email]);
    return results[0] || null;
  }

  static async createUser(
    userData: Omit<User, "createdAt" | "updatedAt">
  ): Promise<User> {
    const query = `
      INSERT INTO users (id, name, email, password, phone, address, userType, vehicleId, vehicleName, vehicleSize)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userData.id,
      userData.name,
      userData.email,
      userData.password,
      userData.phone || null,
      userData.address || null,
      userData.userType,
      userData.vehicleId || null,
      userData.vehicleName || null,
      userData.vehicleSize || null,
    ];

    await executeQuery(query, params);
    return this.getUserById(userData.id) as Promise<User>;
  }

  static async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | null> {
    const allowedFields = [
      "name",
      "email",
      "phone",
      "address",
      "userType",
      "vehicleId",
      "vehicleName",
      "vehicleSize",
    ];
    const updateFields = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update");
    }

    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const params = updateFields.map((field) => (updates as any)[field]);
    params.push(id);

    const query = `UPDATE users SET ${setClause} WHERE id = ?`;
    await executeQuery(query, params);

    return this.getUserById(id);
  }

  static async getTransporters(): Promise<User[]> {
    const query =
      'SELECT * FROM users WHERE userType = "transporter" ORDER BY createdAt DESC';
    return executeQuery<User>(query);
  }
}

// Order Service
export class OrderService {
  static async getAllOrders(): Promise<Order[]> {
    const query = "SELECT * FROM orders ORDER BY createdAt DESC";
    return executeQuery<Order>(query);
  }

  static async getOrderById(id: string): Promise<Order | null> {
    const query = "SELECT * FROM orders WHERE id = ?";
    const results = await executeQuery<Order>(query, [id]);
    return results[0] || null;
  }

  static async getOrdersByUserId(userId: string): Promise<Order[]> {
    const query =
      "SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC";
    return executeQuery<Order>(query, [userId]);
  }

  static async getOrdersByTransporterId(
    transporterId: string
  ): Promise<Order[]> {
    const query =
      "SELECT * FROM orders WHERE transporterId = ? ORDER BY createdAt DESC";
    return executeQuery<Order>(query, [transporterId]);
  }

  static async createOrder(
    orderData: Omit<
      Order,
      "createdAt" | "updatedAt" | "status" | "transporterId"
    >
  ): Promise<Order> {
    const query = `
      INSERT INTO orders (id, userId, quantity, deliveryAddress, preferredDeliveryTime, specialInstructions, totalAmount, paymentMethod, paymentReference)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      orderData.id,
      orderData.userId,
      orderData.quantity,
      orderData.deliveryAddress,
      orderData.preferredDeliveryTime,
      orderData.specialInstructions || null,
      orderData.totalAmount,
      orderData.paymentMethod || null,
      orderData.paymentReference || null,
    ];

    await executeQuery(query, params);
    return this.getOrderById(orderData.id) as Promise<Order>;
  }

  static async updateOrder(
    id: string,
    updates: Partial<Order>
  ): Promise<Order | null> {
    const allowedFields = [
      "quantity",
      "deliveryAddress",
      "preferredDeliveryTime",
      "specialInstructions",
      "totalAmount",
      "status",
      "transporterId",
      "paymentMethod",
      "paymentReference",
      "startTime",
      "deliveredTime",
    ];
    const updateFields = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update");
    }

    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const params = updateFields.map((field) => (updates as any)[field]);
    params.push(id);

    const query = `UPDATE orders SET ${setClause} WHERE id = ?`;
    await executeQuery(query, params);

    return this.getOrderById(id);
  }

  static async assignTransporter(
    orderId: string,
    transporterId: string
  ): Promise<Order | null> {
    return this.updateOrder(orderId, { transporterId, status: "assigned" });
  }

  static async updateOrderStatus(
    orderId: string,
    status: Order["status"]
  ): Promise<Order | null> {
    const updates: Partial<Order> = { status };

    if (status === "in_transit") {
      updates.startTime = new Date();
    } else if (status === "delivered") {
      updates.deliveredTime = new Date();
    }

    return this.updateOrder(orderId, updates);
  }
}

// Container Service
export class ContainerService {
  static async getAllContainers(): Promise<Container[]> {
    const query = "SELECT * FROM containers ORDER BY createdAt DESC";
    return executeQuery<Container>(query);
  }

  static async getContainerById(id: string): Promise<Container | null> {
    const query = "SELECT * FROM containers WHERE id = ?";
    const results = await executeQuery<Container>(query, [id]);
    return results[0] || null;
  }

  static async getContainersByStatus(approved?: boolean): Promise<Container[]> {
    let query = "SELECT * FROM containers";
    const params: any[] = [];

    if (approved !== undefined) {
      query += " WHERE approved = ?";
      params.push(approved);
    }

    query += " ORDER BY createdAt DESC";
    return executeQuery<Container>(query, params);
  }

  static async createContainer(
    containerData: Omit<Container, "createdAt">
  ): Promise<Container> {
    const query = `
      INSERT INTO containers (id, weight, manufactureDate, expiryDate, approved, testerId, testNotes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      containerData.id,
      containerData.weight,
      containerData.manufactureDate,
      containerData.expiryDate,
      containerData.approved ?? null,
      containerData.testerId || null,
      containerData.testNotes || null,
    ];

    await executeQuery(query, params);
    return this.getContainerById(containerData.id) as Promise<Container>;
  }

  static async updateContainer(
    id: string,
    updates: Partial<Container>
  ): Promise<Container | null> {
    const allowedFields = [
      "weight",
      "manufactureDate",
      "expiryDate",
      "approved",
      "testerId",
      "testNotes",
    ];
    const updateFields = Object.keys(updates).filter((key) =>
      allowedFields.includes(key)
    );

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update");
    }

    // Add testedAt if approval status is being updated
    if (updates.approved !== undefined) {
      updateFields.push("testedAt");
      (updates as any).testedAt = new Date();
    }

    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const params = updateFields.map((field) => (updates as any)[field]);
    params.push(id);

    const query = `UPDATE containers SET ${setClause} WHERE id = ?`;
    await executeQuery(query, params);

    return this.getContainerById(id);
  }

  static async approveContainer(
    id: string,
    testerId: string,
    testNotes?: string
  ): Promise<Container | null> {
    return this.updateContainer(id, {
      approved: true,
      testerId,
      testNotes: testNotes || undefined,
      testedAt: new Date(),
    });
  }

  static async rejectContainer(
    id: string,
    testerId: string,
    testNotes?: string
  ): Promise<Container | null> {
    return this.updateContainer(id, {
      approved: false,
      testerId,
      testNotes: testNotes || undefined,
      testedAt: new Date(),
    });
  }
}

// Feedback Service
export class FeedbackService {
  static async getAllFeedback(): Promise<Feedback[]> {
    const query = "SELECT * FROM feedback ORDER BY createdAt DESC";
    return executeQuery<Feedback>(query);
  }

  static async getFeedbackById(id: string): Promise<Feedback | null> {
    const query = "SELECT * FROM feedback WHERE id = ?";
    const results = await executeQuery<Feedback>(query, [id]);
    return results[0] || null;
  }

  static async getFeedbackByOrderId(orderId: string): Promise<Feedback[]> {
    const query =
      "SELECT * FROM feedback WHERE orderId = ? ORDER BY createdAt DESC";
    return executeQuery<Feedback>(query, [orderId]);
  }

  static async getFeedbackByUserId(userId: string): Promise<Feedback[]> {
    const query =
      "SELECT * FROM feedback WHERE userId = ? ORDER BY createdAt DESC";
    return executeQuery<Feedback>(query, [userId]);
  }

  static async getFeedbackByTransporterId(
    transporterId: string
  ): Promise<Feedback[]> {
    const query =
      "SELECT * FROM feedback WHERE transporterId = ? ORDER BY createdAt DESC";
    return executeQuery<Feedback>(query, [transporterId]);
  }

  static async createFeedback(
    feedbackData: Omit<Feedback, "createdAt">
  ): Promise<Feedback> {
    const query = `
      INSERT INTO feedback (id, userId, orderId, transporterId, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const params = [
      feedbackData.id,
      feedbackData.userId,
      feedbackData.orderId,
      feedbackData.transporterId || null,
      feedbackData.rating,
      feedbackData.comment || null,
    ];

    await executeQuery(query, params);
    return this.getFeedbackById(feedbackData.id) as Promise<Feedback>;
  }

  static async getAverageRatingByTransporter(
    transporterId: string
  ): Promise<number> {
    const query =
      "SELECT AVG(rating) as averageRating FROM feedback WHERE transporterId = ?";
    const results = await executeQuery<{ averageRating: number }>(query, [
      transporterId,
    ]);
    return results[0]?.averageRating || 0;
  }
}

// Dashboard/Analytics Service
export class AnalyticsService {
  static async getDashboardStats() {
    const queries = [
      {
        name: "totalUsers",
        query: 'SELECT COUNT(*) as count FROM users WHERE userType = "user"',
      },
      {
        name: "totalTransporters",
        query:
          'SELECT COUNT(*) as count FROM users WHERE userType = "transporter"',
      },
      {
        name: "totalOrders",
        query: "SELECT COUNT(*) as count FROM orders",
      },
      {
        name: "pendingOrders",
        query: 'SELECT COUNT(*) as count FROM orders WHERE status = "pending"',
      },
      {
        name: "deliveredOrders",
        query:
          'SELECT COUNT(*) as count FROM orders WHERE status = "delivered"',
      },
      {
        name: "totalRevenue",
        query:
          'SELECT SUM(totalAmount) as total FROM orders WHERE status = "delivered"',
      },
      {
        name: "totalContainers",
        query: "SELECT COUNT(*) as count FROM containers",
      },
      {
        name: "approvedContainers",
        query: "SELECT COUNT(*) as count FROM containers WHERE approved = 1",
      },
    ];

    const results: any = {};

    for (const { name, query } of queries) {
      const [result] = await executeQuery<{ count?: number; total?: number }>(
        query
      );
      results[name] = result.count || result.total || 0;
    }

    return results;
  }

  static async getOrderTrends(days: number = 30) {
    const query = `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as orderCount,
        SUM(totalAmount) as revenue
      FROM orders 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `;

    return executeQuery<{
      date: string;
      orderCount: number;
      revenue: number;
    }>(query, [days]);
  }

  static async getTopTransporters(limit: number = 5) {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(o.id) as completedOrders,
        AVG(f.rating) as averageRating,
        SUM(o.totalAmount) as totalRevenue
      FROM users u
      LEFT JOIN orders o ON u.id = o.transporterId AND o.status = 'delivered'
      LEFT JOIN feedback f ON u.id = f.transporterId
      WHERE u.userType = 'transporter'
      GROUP BY u.id, u.name, u.email
      ORDER BY completedOrders DESC, averageRating DESC
      LIMIT ?
    `;

    return executeQuery<{
      id: string;
      name: string;
      email: string;
      completedOrders: number;
      averageRating: number;
      totalRevenue: number;
    }>(query, [limit]);
  }
}
