import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
export const plannerState = sqliteTable("planner_state", {
  userId: text("user_id").notNull(),
  key: text("state_key").notNull(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
}, table => [primaryKey({columns:[table.userId,table.key]})]);
