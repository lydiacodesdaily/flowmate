import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { SessionRecord } from "@flowmato/shared";

type DbSession = {
  id: string;
  user_id: string;
  started_at: number;
  ended_at: number;
  planned_seconds: number;
  completed_seconds: number;
  mode: string;
  timer_type: string;
  type: string;
  status: string;
  intent: string | null;
  steps_total: number | null;
  steps_done: number | null;
  steps_detail: unknown | null;
  note: string | null;
  resumed_from_id: string | null;
};

function toDbSession(record: SessionRecord, userId: string): DbSession {
  return {
    id: record.id,
    user_id: userId,
    started_at: record.startedAt,
    ended_at: record.endedAt,
    planned_seconds: record.plannedSeconds,
    completed_seconds: record.completedSeconds,
    mode: record.mode,
    timer_type: record.timerType,
    type: record.type,
    status: record.status,
    intent: record.intent ?? null,
    steps_total: record.steps?.total ?? null,
    steps_done: record.steps?.done ?? null,
    steps_detail: record.stepsDetail ?? null,
    note: record.note ?? null,
    resumed_from_id: record.resumedFromId ?? null,
  };
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { sessions?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.sessions)) {
    return Response.json(
      { error: "sessions must be an array." },
      { status: 400 }
    );
  }

  const sessions = body.sessions as SessionRecord[];

  if (sessions.length > 500) {
    return Response.json(
      { error: "Cannot sync more than 500 sessions at once." },
      { status: 400 }
    );
  }

  const rows = sessions.map((s) => toDbSession(s, user.id));

  const { error } = await supabase
    .from("sessions")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("Session sync error:", error);
    return Response.json({ error: "Failed to sync sessions." }, { status: 500 });
  }

  return Response.json({ synced: rows.length });
}
