
import { and, desc, eq } from "drizzle-orm";
import { db, pool } from "../db/client.js";
import { conversations, messages } from "../db/schema.js";
import { runAgent, type ConversationMessage } from "./run-agent.js";

const HISTORY_LIMIT = 20;

type HandleMessageInput = {
  businessId: string;
  customerWaId: string;
  whatsappMessageId: string;
  body: string;
};

export async function handleCustomerMessage(
  input: HandleMessageInput,
): Promise<{ conversationId: string; reply: string } | { duplicate: true }> {
  const {
    businessId,
    customerWaId,
    whatsappMessageId,
    body,
  } = input;

  const cleanBody = body.trim();

  if (!businessId || !customerWaId || !whatsappMessageId) {
    throw new Error("Business, customer, and message IDs are required");
  }

  if (!cleanBody || cleanBody.length > 4000) {
    throw new Error("Message must contain 1–4000 characters");
  }

  // Ignore a webhook event already saved to the database.
  const [existingMessage] = await db
    .select({ id: messages.id })
    .from(messages)
    .where(eq(messages.whatsappMessageId, whatsappMessageId))
    .limit(1);

  if (existingMessage) {
    return { duplicate: true };
  }

  // Find or create the customer's conversation for this business.
  await db
    .insert(conversations)
    .values({ businessId, customerWaId })
    .onConflictDoNothing({
      target: [conversations.businessId, conversations.customerWaId],
    });

  const [conversation] = await db
    .select({ id: conversations.id })
    .from(conversations)
    .where(
      and(
        eq(conversations.businessId, businessId),
        eq(conversations.customerWaId, customerWaId),
      ),
    )
    .limit(1);

  if (!conversation) {
    throw new Error("Could not find or create conversation");
  }

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversation.id));

  // Save the customer's message before calling the model.
  await db.insert(messages).values({
    conversationId: conversation.id,
    whatsappMessageId,
    direction: "inbound",
    body: cleanBody,
  });

  // Load the latest messages, then restore chronological order.
  const recentMessages = await db
    .select({
      direction: messages.direction,
      body: messages.body,
    })
    .from(messages)
    .where(eq(messages.conversationId, conversation.id))
    .orderBy(desc(messages.createdAt))
    .limit(HISTORY_LIMIT);

  const history: ConversationMessage[] = recentMessages
    .reverse()
    .map((message) => ({
      role: message.direction === "inbound" ? "user" : "assistant",
      content: message.body,
    }));

  const reply = await runAgent(businessId, history);

  // Save the assistant response for the next turn.
  await db.insert(messages).values({
    conversationId: conversation.id,
    whatsappMessageId: null,
    direction: "outbound",
    body: reply,
  });

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversation.id));

  return { conversationId: conversation.id, reply };
}
