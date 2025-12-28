import fs from "fs/promises";
import path from "path";
import { pool, testConnection, executeQuery } from "../lib/database";
import {
  UserService,
  OrderService,
  ContainerService,
  FeedbackService,
} from "../lib/database-service";

// Migration utilities
export class MigrationManager {
  private static async readJsonFile(filename: string): Promise<any[]> {
    const filePath = path.join(process.cwd(), "data", filename);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  private static generateId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  // Initialize database schema
  static async initializeDatabase(): Promise<void> {
    console.log("🔄 Initializing database schema...");

    try {
      // Check if database exists, create if not
      await executeQuery("CREATE DATABASE IF NOT EXISTS distilled_water_db");
      await executeQuery("USE distilled_water_db");

      // Read and execute schema
      const schemaPath = path.join(process.cwd(), "database", "schema.sql");
      const schema = await fs.readFile(schemaPath, "utf-8");

      // Split schema into individual statements
      const statements = schema
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      for (const statement of statements) {
        try {
          await executeQuery(statement);
        } catch (error) {
          // Ignore "table already exists" errors
          if (
            !error instanceof Error ||
            !error.message.includes("already exists")
          ) {
            console.error("Schema execution error:", error);
          }
        }
      }

      console.log("✅ Database schema initialized successfully");
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      throw error;
    }
  }

  // Migrate existing JSON data to database
  static async migrateExistingData(): Promise<void> {
    console.log("🔄 Migrating existing data from JSON files...");

    try {
      // Test connection first
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error("Database connection failed");
      }

      // Migrate users
      await this.migrateUsers();

      // Migrate containers
      await this.migrateContainers();

      // Migrate orders
      await this.migrateOrders();

      // Migrate feedback
      await this.migrateFeedback();

      console.log("✅ Data migration completed successfully");
    } catch (error) {
      console.error("❌ Data migration failed:", error);
      throw error;
    }
  }

  private static async migrateUsers(): Promise<void> {
    console.log("📦 Migrating users...");
    const users = await this.readJsonFile("users.json");

    for (const user of users) {
      try {
        await UserService.createUser({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          phone: user.phone,
          address: user.address,
          userType: user.userType,
          vehicleId: user.vehicleId,
          vehicleName: user.vehicleName,
          vehicleSize: user.vehicleSize,
        });
        console.log(`✅ User ${user.name} migrated`);
      } catch (error) {
        console.error(`❌ Failed to migrate user ${user.name}:`, error);
      }
    }
  }

  private static async migrateContainers(): Promise<void> {
    console.log("📦 Migrating containers...");
    const containers = await this.readJsonFile("containers.json");

    for (const container of containers) {
      try {
        await ContainerService.createContainer({
          id: container.id,
          weight: container.weight,
          manufactureDate: new Date(container.manufactureDate),
          expiryDate: new Date(container.expiryDate),
          approved: container.approved,
          testerId: container.testerId,
          testNotes: container.testNotes,
          testedAt: container.testedAt
            ? new Date(container.testedAt)
            : undefined,
        });
        console.log(`✅ Container ${container.id} migrated`);
      } catch (error) {
        console.error(`❌ Failed to migrate container ${container.id}:`, error);
      }
    }
  }

  private static async migrateOrders(): Promise<void> {
    console.log("📦 Migrating orders...");
    const orders = await this.readJsonFile("orders.json");

    for (const order of orders) {
      try {
        await OrderService.createOrder({
          id: order.id,
          userId: order.userId,
          quantity: order.quantity,
          deliveryAddress: order.deliveryAddress,
          preferredDeliveryTime: order.preferredDeliveryTime,
          specialInstructions: order.specialInstructions,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          paymentReference: order.paymentReference,
        });

        // Update with additional fields if they exist
        const updates: any = {};
        if (order.status) updates.status = order.status;
        if (order.transporterId) updates.transporterId = order.transporterId;
        if (order.startTime) updates.startTime = new Date(order.startTime);
        if (order.deliveredTime)
          updates.deliveredTime = new Date(order.deliveredTime);
        if (order.updatedAt) updates.updatedAt = new Date(order.updatedAt);

        if (Object.keys(updates).length > 0) {
          await OrderService.updateOrder(order.id, updates);
        }

        console.log(`✅ Order ${order.id} migrated`);
      } catch (error) {
        console.error(`❌ Failed to migrate order ${order.id}:`, error);
      }
    }
  }

  private static async migrateFeedback(): Promise<void> {
    console.log("📦 Migrating feedback...");
    const feedback = await this.readJsonFile("feedback.json");

    for (const item of feedback) {
      try {
        await FeedbackService.createFeedback({
          id: item.id,
          userId: item.userId,
          orderId: item.orderId,
          transporterId: item.transporterId,
          rating: item.rating,
          comment: item.comment,
        });
        console.log(`✅ Feedback ${item.id} migrated`);
      } catch (error) {
        console.error(`❌ Failed to migrate feedback ${item.id}:`, error);
      }
    }
  }

  // Reset database (use with caution)
  static async resetDatabase(): Promise<void> {
    console.log("⚠️  Resetting database...");

    try {
      await executeQuery("USE distilled_water_db");

      // Drop all tables in reverse order of dependencies
      const tables = [
        "order_containers",
        "feedback",
        "orders",
        "containers",
        "users",
      ];

      for (const table of tables) {
        await executeQuery(`DROP TABLE IF EXISTS ${table}`);
      }

      console.log("✅ Database reset completed");
    } catch (error) {
      console.error("❌ Database reset failed:", error);
      throw error;
    }
  }

  // Check database status
  static async getDatabaseStatus(): Promise<{
    connected: boolean;
    tables: string[];
    recordCounts: Record<string, number>;
  }> {
    try {
      const isConnected = await testConnection();

      if (!isConnected) {
        return {
          connected: false,
          tables: [],
          recordCounts: {},
        };
      }

      // Get table list
      const tables = await executeQuery<{
        Tables_in_distilled_water_db: string;
      }>("SHOW TABLES");

      const tableNames = tables.map((t) => t.Tables_in_distilled_water_db);

      // Get record counts
      const recordCounts: Record<string, number> = {};
      for (const tableName of tableNames) {
        const [result] = await executeQuery<{ count: number }>(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        recordCounts[tableName] = result.count;
      }

      return {
        connected: true,
        tables: tableNames,
        recordCounts,
      };
    } catch (error) {
      console.error("Database status check failed:", error);
      return {
        connected: false,
        tables: [],
        recordCounts: {},
      };
    }
  }

  // Close database connections
  static async closeConnections(): Promise<void> {
    try {
      await pool.end();
      console.log("🔌 Database connections closed");
    } catch (error) {
      console.error("Error closing connections:", error);
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case "init":
        await MigrationManager.initializeDatabase();
        break;

      case "migrate":
        await MigrationManager.initializeDatabase();
        await MigrationManager.migrateExistingData();
        break;

      case "reset":
        const confirm = process.argv[3] === "--confirm";
        if (!confirm) {
          console.log(
            "⚠️  This will delete all data. Use: npm run db:reset -- --confirm"
          );
          process.exit(1);
        }
        await MigrationManager.resetDatabase();
        break;

      case "status":
        const status = await MigrationManager.getDatabaseStatus();
        console.log("📊 Database Status:");
        console.log(`Connected: ${status.connected ? "✅" : "❌"}`);
        if (status.connected) {
          console.log("Tables:", status.tables.join(", "));
          console.log("Record Counts:", status.recordCounts);
        }
        break;

      default:
        console.log(`
🗄️  Database Migration Tool

Usage:
  npm run db:init        - Initialize database schema
  npm run db:migrate     - Initialize schema and migrate data
  npm run db:reset       - Reset database (requires --confirm flag)
  npm run db:status      - Check database status

Examples:
  npm run db:init
  npm run db:migrate
  npm run db:reset -- --confirm
  npm run db:status
        `);
        process.exit(0);
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await MigrationManager.closeConnections();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
