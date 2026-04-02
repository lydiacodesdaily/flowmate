import { createSupabaseServiceClient } from "@/lib/supabase-server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

// In-memory rate limiting: best-effort per Vercel instance warm lifecycle.
// State resets on cold start — acceptable for this use case.
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS = 60;
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

  let body: { timerType?: unknown; status?: unknown; completedSeconds?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { timerType, status, completedSeconds } = body;

  if (timerType !== "focus") {
    return Response.json(
      { error: "Only focus sessions are counted." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (status !== "completed" && status !== "partial") {
    return Response.json(
      { error: "Only completed or partial sessions are counted." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (
    typeof completedSeconds !== "number" ||
    !Number.isInteger(completedSeconds) ||
    completedSeconds <= 0
  ) {
    return Response.json(
      { error: "completedSeconds must be a positive integer." },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.rpc("increment_aggregate_stats", {
      p_seconds: completedSeconds,
    });

    if (error) throw error;

    return Response.json({ ok: true }, { headers: CORS_HEADERS });
  } catch (err) {
    console.error("Failed to record session stats:", err);
    return Response.json(
      { error: "Failed to record session." },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
