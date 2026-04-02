import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { SessionRecord, TimerMode, TimerType, SessionType, SessionStatus } from "@flowmato/shared";

type DbSession = {
  id: string;
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

function fromDbSession(row: DbSession): SessionRecord {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    plannedSeconds: row.planned_seconds,
    completedSeconds: row.completed_seconds,
    mode: row.mode as TimerMode,
    timerType: row.timer_type as TimerType,
    type: row.type as SessionType,
    status: row.status as SessionStatus,
    ...(row.intent != null && { intent: row.intent }),
    ...(row.steps_total != null &&
      row.steps_done != null && {
        steps: { total: row.steps_total, done: row.steps_done },
      }),
    ...(row.steps_detail != null && {
      stepsDetail: row.steps_detail as SessionRecord["stepsDetail"],
    }),
    ...(row.note != null && { note: row.note }),
    ...(row.resumed_from_id != null && { resumedFromId: row.resumed_from_id }),
  };
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, started_at, ended_at, planned_seconds, completed_seconds, mode, timer_type, type, status, intent, steps_total, steps_done, steps_detail, note, resumed_from_id"
    )
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch sessions:", error);
    return Response.json({ error: "Failed to fetch sessions." }, { status: 500 });
  }

  const sessions = (data ?? []).map((row) => fromDbSession(row as DbSession));

  return Response.json({ sessions });
}
