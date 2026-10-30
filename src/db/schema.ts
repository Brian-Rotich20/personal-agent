
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  integer,
} from "drizzle-orm/pg-core";

export const businesses = pgTable("businesses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  policies: text("policies").notNull().default(""),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull().defaultNow(),
});

export const services = pgTable(
  "services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    description: text("description").notNull(),
    priceText: text("price_text"),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    index("services_business_idx").on(table.businessId),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessId: uuid("business_id")
      .notNull()
      .references(() => businesses.id),
    customerWaId: text("customer_wa_id").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("conversation_customer_unique").on(
      table.businessId,
      table.customerWaId,
    ),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, {
        onDelete: "cascade",
      }),

    whatsappMessageId: text("whatsapp_message_id"),

    direction: text("direction", {
      enum: ["inbound", "outbound"],
    }).notNull(),

    body: text("body").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    processingStatus: text("processing_status", {
      enum: ["pending", "processing", "processed", "failed"],
    }).notNull().default("processed"),

    attempts: integer("attempts").notNull().default(0),

    nextAttemptAt: timestamp("next_attempt_at", {
      withTimezone: true,
    }).notNull().defaultNow(),

    processingStartedAt: timestamp("processing_started_at", {
      withTimezone: true,
    }),

    processedAt: timestamp("processed_at", {
      withTimezone: true,
    }),

    lastError: text("last_error"),

    replyToMessageId: uuid("reply_to_message_id"),
  },
  (table) => [
    uniqueIndex("messages_whatsapp_message_unique").on(
      table.whatsappMessageId,
    ),
    index("messages_conversation_idx").on(
      table.conversationId,
      table.createdAt,
    ),
    index("messages_processing_idx").on(
      table.processingStatus,
      table.nextAttemptAt,
      table.createdAt,
    ),
  ],
);

export const enquiries = pgTable("enquiries", {
  id: uuid("id").defaultRandom().primaryKey(),

  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id),

  customerName: text("customer_name"),

  summary: text("summary").notNull(),

  status: text("status", {
    enum: ["new", "contacted", "resolved"],
  }).notNull().default("new"),

  consentToFollowUp: boolean("consent_to_follow_up")
    .notNull()
    .default(false),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).notNull().defaultNow(),
});
