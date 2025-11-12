import { db } from "./db";
import { events } from "@shared/schema";
import { eq, isNull } from "drizzle-orm";

// Generate a random 6-character alphanumeric short ID
function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function migrateShortIds() {
  console.log("Starting short ID migration...");
  
  // Get all events without a short_id
  const eventsWithoutShortId = await db.select().from(events).where(isNull(events.shortId));
  
  console.log(`Found ${eventsWithoutShortId.length} events without short IDs`);
  
  const usedShortIds = new Set<string>();
  
  for (const event of eventsWithoutShortId) {
    let shortId = generateShortId();
    
    // Ensure uniqueness
    while (usedShortIds.has(shortId)) {
      shortId = generateShortId();
    }
    
    usedShortIds.add(shortId);
    
    // Update the event with the new short ID
    await db.update(events)
      .set({ shortId })
      .where(eq(events.id, event.id));
    
    console.log(`Updated event ${event.id} with short ID: ${shortId}`);
  }
  
  console.log("Migration complete!");
  process.exit(0);
}

migrateShortIds().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
