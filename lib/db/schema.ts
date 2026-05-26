import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  bigint,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Teams ────────────────────────────────────────────────────────────────────

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  iconId: text("icon_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role").default("user"),
  avatarIcon: text("avatar_icon"),
  teamId: integer("team_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ── Tickets ──────────────────────────────────────────────────────────────────

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  type: text("type"),
  priority: text("priority").default("Normal"),
  status: text("status").default("Pendiente"),
  arrivalTime: timestamp("arrival_time", { withTimezone: true }).defaultNow(),
  maxWaitMinutes: integer("max_wait_minutes"),
  teamId: integer("team_id"),
  userId: integer("user_id"),
  isActive: boolean("is_active").default(true),
});

// ── Tasks ────────────────────────────────────────────────────────────────────

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("Tareas"),
  teamId: integer("team_id"),
  startDate: timestamp("start_date", { withTimezone: true }),
  endDate: timestamp("end_date", { withTimezone: true }),
  isActive: boolean("is_active").default(true),
  assignedTo: integer("assigned_to").array().default([]),
});

// ── Notifications ────────────────────────────────────────────────────────────

export const notifications = pgTable(
  "notifications",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    ticketId: integer("ticket_id"),
    teamId: integer("team_id"),
    userId: integer("user_id"),
    type: text("type").default("ticket_created").notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_notifications_created_at").on(table.createdAt),
    index("idx_notifications_is_read").on(table.isRead),
    index("idx_notifications_team_id").on(table.teamId),
  ]
);

// ── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ one }) => ({
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  team: one(teams, { fields: [tickets.teamId], references: [teams.id] }),
  user: one(users, { fields: [tickets.userId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  ticket: one(tickets, { fields: [notifications.ticketId], references: [tickets.id] }),
  team: one(teams, { fields: [notifications.teamId], references: [teams.id] }),
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  team: one(teams, { fields: [tasks.teamId], references: [teams.id] }),
}));
