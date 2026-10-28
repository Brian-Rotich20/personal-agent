
import "dotenv/config";
import { runAgent } from "./run-agent.js";
import { pool } from "../db/client.js";

async function main() {
  const businessId = process.env.BUSINESS_ID;

  if (!businessId) {
    throw new Error("BUSINESS_ID is required in .env");
  }

  const question =
    process.argv.slice(2).join(" ") ||
    "What services do you offer, and how much do they cost?";

  const answer = await runAgent(businessId, question);

  console.log("\nCustomer:", question);
  console.log("\nAssistant:", answer);
}

main()
  .catch((error: unknown) => {
    console.error("Agent test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
