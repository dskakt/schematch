import { db } from "./db";
import { events } from "../shared/schema";
import { lt } from "drizzle-orm";

/**
 * Delete events older than 1 year
 * This function is called periodically to clean up old data
 */
export async function cleanupOldEvents(): Promise<number> {
  try {
    // Calculate date 1 year ago from now
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Delete events created before this date
    // Cascade delete will automatically remove related timeSlots and responses
    const result = await db
      .delete(events)
      .where(lt(events.createdAt, oneYearAgo))
      .returning({ id: events.id });

    const deletedCount = result.length;
    
    if (deletedCount > 0) {
      console.log(`[cleanup] Deleted ${deletedCount} events older than 1 year`);
    }

    return deletedCount;
  } catch (error) {
    console.error("[cleanup] Error cleaning up old events:", error);
    return 0;
  }
}

/**
 * Start periodic cleanup task
 * Runs cleanup every 24 hours
 */
export function startPeriodicCleanup(): void {
  // Run cleanup immediately on startup
  console.log("[cleanup] Running initial cleanup...");
  cleanupOldEvents();

  // Then run cleanup every 24 hours
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    console.log("[cleanup] Running scheduled cleanup...");
    cleanupOldEvents();
  }, TWENTY_FOUR_HOURS);

  console.log("[cleanup] Periodic cleanup task started (runs every 24 hours)");
}
