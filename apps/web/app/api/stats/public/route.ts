import { createSupabaseServiceClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("aggregate_stats")
      .select("total_focus_seconds, total_sessions, total_users")
      .eq("id", true)
      .single();

    if (error) throw error;

    return Response.json(
      {
        totalFocusSeconds: data.total_focus_seconds ?? 0,
        totalSessions: data.total_sessions ?? 0,
        totalUsers: data.total_users ?? 0,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    console.error("Failed to fetch public stats:", err);
    return Response.json(
      { totalFocusSeconds: 0, totalSessions: 0, totalUsers: 0 },
      { status: 200 } // Return empty stats rather than an error to avoid UI breakage
    );
  }
}
