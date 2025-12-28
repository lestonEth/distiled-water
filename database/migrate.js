const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  database: process.env.DATABASE_NAME || "distilled_water_db",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Migration utilities
class MigrationManager {
  constructor() {
    this.pool = null;
  }

  async init() {
    // First create pool without database to allow creating the database
    const tempConfig = { ...dbConfig };
    delete tempConfig.database;
    this.pool = mysql.createPool(tempConfig);
    console.log("🔌 Database connection pool initialized");
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log("🔌 Database connection pool closed");
    }
  }

  async readJsonFile(filename) {
    const filePath = path.join(process.cwd(), "data", filename);
    const data = await fs.promises.readFile(filePath, "utf-8");
    return JSON.parse(data);
  }

  async executeQuery(query, params = []) {
    try {
      const [rows] = await this.pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Query error:", error.message);
      throw error;
    }
  }

  async executeRawQuery(query) {
    try {
      const connection = await this.pool.getConnection();
      try {
        const [rows] = await connection.query(query);
        return rows;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Raw query error:", error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      console.log("✅ Database connection successful");
      return true;
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      return false;
    }
  }

  async initializeDatabase() {
    console.log("🔄 Initializing database schema...");

    try {
      // Create database if not exists using raw query
      await this.executeRawQuery(
        "CREATE DATABASE IF NOT EXISTS distilled_water_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
      );

      // Switch to the database
      await this.executeRawQuery("USE distilled_water_db");

      console.log("✅ Database created/verified");

      // Read and execute schema
      const schemaPath = path.join(__dirname, "schema.sql");
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }

      const schema = await fs.promises.readFile(schemaPath, "utf-8");

      // Split schema into individual statements
      const statements = schema
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      console.log(`Found ${statements.length} SQL statements to execute`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        console.log(`Executing statement ${i + 1}/${statements.length}...`);

        try {
          // Use raw query for DDL statements
          await this.executeRawQuery(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          // Ignore "table already exists" errors for idempotency
          if (!error.message.includes("already exists")) {
            console.error(`❌ Statement ${i + 1} failed:`, error.message);
            console.error("Failed SQL:", statement);
            throw error;
          } else {
            console.log(
              `⚠️  Statement ${i + 1}: Table already exists, skipping`
            );
          }
        }
      }

      console.log("✅ Database schema initialized successfully");
    } catch (error) {
      console.error("❌ Database initialization failed:", error.message);
      throw error;
    }
  }

  async migrateExistingData() {
    console.log("🔄 Migrating existing data from JSON files...");

    try {
      // Test connection first
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error("Database connection failed");
      }

      // Ensure we're using the right database
      await this.executeRawQuery("USE distilled_water_db");

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
      console.error("❌ Data migration failed:", error.message);
      throw error;
    }
  }

  async migrateUsers() {
    console.log("📦 Migrating users...");
    const users = await this.readJsonFile("users.json");

    let migratedCount = 0;
    for (const user of users) {
      try {
        const query = `
          INSERT IGNORE INTO users (id, name, email, password, phone, address, userType, vehicleId, vehicleName, vehicleSize)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          user.id,
          user.name,
          user.email,
          user.password,
          user.phone || null,
          user.address || null,
          user.userType,
          user.vehicleId || null,
          user.vehicleName || null,
          user.vehicleSize || null,
        ];

        await this.executeQuery(query, params);
        migratedCount++;
        console.log(`✅ User ${user.name} migrated`);
      } catch (error) {
        console.error(`❌ Failed to migrate user ${user.name}:`, error.message);
      }
    }
    console.log(`📊 Users migrated: ${migratedCount}/${users.length}`);
  }

  async migrateContainers() {
    console.log("📦 Migrating containers...");
    const containers = await this.readJsonFile("containers.json");

    let migratedCount = 0;
    for (const container of containers) {
      try {
        const query = `
          INSERT IGNORE INTO containers (id, weight, manufactureDate, expiryDate, approved, testerId, testNotes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          container.id,
          container.weight,
          container.manufactureDate,
          container.expiryDate,
          container.approved ?? null,
          container.testerId || null,
          container.testNotes || null,
        ];

        await this.executeQuery(query, params);
        migratedCount++;
        console.log(`✅ Container ${container.id} migrated`);
      } catch (error) {
        console.error(
          `❌ Failed to migrate container ${container.id}:`,
          error.message
        );
      }
    }
    console.log(
      `📊 Containers migrated: ${migratedCount}/${containers.length}`
    );
  }

  async migrateOrders() {
    console.log("📦 Migrating orders...");
    const orders = await this.readJsonFile("orders.json");

    let migratedCount = 0;
    for (const order of orders) {
      try {
        const query = `
        INSERT IGNORE INTO orders (id, userId, quantity, deliveryAddress, preferredDeliveryTime, specialInstructions, totalAmount, paymentMethod, paymentReference)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

        const params = [
          order.id,
          order.userId,
          order.quantity,
          order.deliveryAddress,
          order.preferredDeliveryTime,
          order.specialInstructions || null,
          order.totalAmount,
          order.paymentMethod || null,
          order.paymentReference || null,
        ];

        await this.executeQuery(query, params);

        // Update with additional fields if they exist
        const updates = [];
        const updateParams = [];

        if (order.status) {
          updates.push("status = ?");
          updateParams.push(order.status);
        }
        if (order.transporterId) {
          updates.push("transporterId = ?");
          updateParams.push(order.transporterId);
        }

        // Convert ISO timestamps to MySQL format
        if (order.startTime) {
          updates.push("startTime = ?");
          updateParams.push(this.formatTimestampForMySQL(order.startTime));
        }
        if (order.deliveredTime) {
          updates.push("deliveredTime = ?");
          updateParams.push(this.formatTimestampForMySQL(order.deliveredTime));
        }
        if (order.updatedAt) {
          updates.push("updatedAt = ?");
          updateParams.push(this.formatTimestampForMySQL(order.updatedAt));
        }

        if (updates.length > 0) {
          updateParams.push(order.id);
          const updateQuery = `UPDATE orders SET ${updates.join(
            ", "
          )} WHERE id = ?`;
          await this.executeQuery(updateQuery, updateParams);
        }

        migratedCount++;
        console.log(`✅ Order ${order.id} migrated`);
      } catch (error) {
        console.error(`❌ Failed to migrate order ${order.id}:`, error.message);
      }
    }
    console.log(`📊 Orders migrated: ${migratedCount}/${orders.length}`);
  }

  // Add this helper method to the MigrationManager class
  formatTimestampForMySQL(isoTimestamp) {
    if (!isoTimestamp) return null;

    // Remove the 'Z' and milliseconds if present
    return isoTimestamp.replace("Z", "").split(".")[0];
  }

  async migrateFeedback() {
    console.log("📦 Migrating feedback...");
    const feedback = await this.readJsonFile("feedback.json");

    let migratedCount = 0;
    for (const item of feedback) {
      try {
        const query = `
          INSERT IGNORE INTO feedback (id, userId, orderId, transporterId, rating, comment)
          VALUES (?, ?, ?, ?, ?, ?)
        `;

        const params = [
          item.id,
          item.userId,
          item.orderId,
          item.transporterId || null,
          item.rating,
          item.comment || null,
        ];

        await this.executeQuery(query, params);
        migratedCount++;
        console.log(`✅ Feedback ${item.id} migrated`);
      } catch (error) {
        console.error(
          `❌ Failed to migrate feedback ${item.id}:`,
          error.message
        );
      }
    }
    console.log(`📊 Feedback migrated: ${migratedCount}/${feedback.length}`);
  }

  async resetDatabase() {
    console.log("⚠️  Resetting database...");

    try {
      // Use raw queries for DDL operations
      await this.executeRawQuery("USE distilled_water_db");

      // Drop all tables in reverse order of dependencies
      const tables = [
        "order_containers",
        "feedback",
        "orders",
        "containers",
        "users",
      ];

      for (const table of tables) {
        try {
          await this.executeRawQuery(`DROP TABLE IF EXISTS ${table}`);
          console.log(`✅ Dropped table: ${table}`);
        } catch (error) {
          console.log(`⚠️  Could not drop table ${table}:`, error.message);
        }
      }

      console.log("✅ Database reset completed");
    } catch (error) {
      console.error("❌ Database reset failed:", error.message);
      throw error;
    }
  }

  async getDatabaseStatus() {
    try {
      const isConnected = await this.testConnection();

      if (!isConnected) {
        return {
          connected: false,
          tables: [],
          recordCounts: {},
        };
      }

      // Switch to our database
      await this.executeRawQuery("USE distilled_water_db");

      // Get table list
      const tables = await this.executeRawQuery("SHOW TABLES");

      const tableNames = tables.map((t) => Object.values(t)[0]);

      // Get record counts
      const recordCounts = {};
      for (const tableName of tableNames) {
        const [result] = await this.executeQuery(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        recordCounts[tableName] = result[0].count;
      }

      return {
        connected: true,
        tables: tableNames,
        recordCounts,
      };
    } catch (error) {
      console.error("Database status check failed:", error.message);
      return {
        connected: false,
        tables: [],
        recordCounts: {},
      };
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];
  const migrationManager = new MigrationManager();

  try {
    await migrationManager.init();

    switch (command) {
      case "init":
        await migrationManager.initializeDatabase();
        break;

      case "migrate":
        await migrationManager.initializeDatabase();
        await migrationManager.migrateExistingData();
        break;

      case "reset":
        const confirm = process.argv[3] === "--confirm";
        if (!confirm) {
          console.log(
            "⚠️  This will delete all data. Use: npm run db:reset -- --confirm"
          );
          process.exit(1);
        }
        await migrationManager.resetDatabase();
        break;

      case "status":
        const status = await migrationManager.getDatabaseStatus();
        console.log("📊 Database Status:");
        console.log(`Connected: ${status.connected ? "✅" : "❌"}`);
        if (status.connected) {
          console.log("Tables:", status.tables.join(", "));
          console.log("Record Counts:");
          for (const [table, count] of Object.entries(status.recordCounts)) {
            console.log(`  ${table}: ${count} records`);
          }
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
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await migrationManager.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = MigrationManager;
