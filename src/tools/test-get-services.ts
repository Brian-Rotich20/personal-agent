
import { getServices } from "./get-service-details.tool.js";
import { pool } from "../db/client.js";

async function main() {
  const businessId = process.env.BUSINESS_ID;

  if (!businessId) {
    throw new Error("BUSINESS_ID is required");
  }

  const result = await getServices(businessId, {});

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error("Tool test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
