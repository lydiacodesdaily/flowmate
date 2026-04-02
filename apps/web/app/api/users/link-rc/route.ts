import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { rcCustomerId?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.rcCustomerId !== "string" || !body.rcCustomerId.trim()) {
    return Response.json(
      { error: "rcCustomerId must be a non-empty string." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({
      rc_customer_id: body.rcCustomerId.trim(),
      last_active_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to link RC customer:", error);
    return Response.json({ error: "Failed to update profile." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
