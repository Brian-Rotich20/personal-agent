
import { z } from "zod";
import { getServices } from "./get-service-details.tool.js";

export const getServicesDefinition = {
  type: "function",
  function: {
    name: "get_services",
    description:
      "Find active services offered by the current business. " +
      "Use this when a customer asks what services are available " +
      "or asks to find a service by name. Returns real service " +
      "descriptions and published prices. Never invent results.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Optional service-name search. Omit to list all active services.",
        },
      },
      required: [],
      additionalProperties: false,
    },
  },
} as const;

const toolInputSchema = z.object({
  query: z.string().trim().max(100).optional(),
}).strict();

export async function executeTool(
  name: string,
  rawArguments: unknown,
  businessId: string,
) {
  switch (name) {
    case "get_services": {
      const input = toolInputSchema.parse(rawArguments);
      return getServices(businessId, input);
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
