
const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.OPENROUTER_MODEL;
const baseUrl =
  process.env.OPENROUTER_BASE_URL ??
  "https://openrouter.ai/api/v1";

if (!apiKey || !model) {
  throw new Error(
    "OPENROUTER_API_KEY and OPENROUTER_MODEL are required",
  );
}

async function main() {
  const response = await fetch(
    `${baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content:
              "Reply with exactly: Model connection works.",
          },
        ],
        max_tokens: 50,
      }),
      signal: AbortSignal.timeout(45000),
    },
  );

  const body = await response.json();

  if (!response.ok) {
    console.error("OpenRouter HTTP status:", response.status);
    console.error("OpenRouter error:", body);
    process.exitCode = 1;
    return;
  }

  const result = body as {
    choices?: Array<{
      message?: { content?: string | null };
    }>;
  };

  console.log(
    "Model response:",
    result.choices?.[0]?.message?.content ??
      "(No text response)",
  );
}

main().catch((error: unknown) => {
  console.error("Connection failed:", error);
  process.exitCode = 1;
});
