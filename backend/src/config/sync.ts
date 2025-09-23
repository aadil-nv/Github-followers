import { sequelize } from "./db";

export async function syncDatabase(): Promise<void> {
  try {
    await sequelize.sync({ alter: true }); // sync models with DB
    console.log("✅ Database synced successfully");
  } catch (err) {
    console.error("❌ Database sync error:", err);
    throw err;
  }
}
