import OpenAI from "openai";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

// In-memory rate limiting: best-effort per Vercel instance warm lifecycle
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(request: Request) {
  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: CORS_HEADERS }
    );
  }

  let body: { intent?: unknown; tone?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { intent, tone = "gentle" } = body;

  if (
    typeof intent !== "string" ||
    intent.trim().length < 1 ||
    intent.trim().length > 120
  ) {
    return Response.json(
      { error: "Intent must be between 1 and 120 characters." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (tone !== "gentle" && tone !== "direct") {
    return Response.json(
      { error: 'Tone must be "gentle" or "direct".' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "AI service not configured." },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  const toneInstruction =
    tone === "gentle"
      ? "Use calm, encouraging language. Start each step with an action verb."
      : "Use clear, direct language. Start each step with a strong action verb.";

  const prompt = `Generate 3 to 5 concrete action steps for this focus goal: "${intent.trim()}"

Rules:
- Return ONLY a JSON object with a "steps" array of strings
- 3 to 5 steps total
- Each step is at most 48 characters
- No trailing punctuation (no periods, exclamation marks, or question marks at the end)
- ${toneInstruction}
- Steps must be specific and actionable

Example output: {"steps":["Open the document","Write the first paragraph","Review and edit"]}`;

  try {
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed: unknown = JSON.parse(raw);

    const steps =
      parsed !== null &&
      typeof parsed === "object" &&
      "steps" in parsed &&
      Array.isArray((parsed as { steps: unknown }).steps)
        ? (parsed as { steps: unknown[] }).steps
            .filter(
              (s): s is string => typeof s === "string" && s.trim().length > 0
            )
            .slice(0, 5)
            .map((s) =>
              s
                .trim()
                .slice(0, 48)
                .replace(/[.!?]+$/, "")
            )
        : [];

    if (steps.length < 3) {
      return Response.json(
        {
          error:
            "Could not generate enough steps. Please try rephrasing your intent.",
        },
        { status: 422, headers: CORS_HEADERS }
      );
    }

    return Response.json({ steps }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("AI step generation failed:", err);
    return Response.json(
      { error: "Could not generate steps. Please try again." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
