
import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client.js";
import { services } from "../db/schema.js";

export const getServicesInput = z.object({
  query: z.string().trim().max(100).optional(),
}).strict();

export type GetServicesInput = z.infer<
  typeof getServicesInput
>;

export async function getServices(
  businessId: string,
  rawInput: unknown,
) {
  const input = getServicesInput.parse(rawInput);

  const conditions = [
    eq(services.businessId, businessId),
    eq(services.active, true),
  ];

  if (input.query) {
    conditions.push(
      ilike(services.name, `%${input.query}%`),
    );
  }

  const rows = await db
    .select({
      id: services.id,
      name: services.name,
      description: services.description,
      priceText: services.priceText,
    })
    .from(services)
    .where(and(...conditions))
    .limit(10);

  return {
    success: true as const,
    count: rows.length,
    services: rows,
  };
}
