import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Failed to fetch premium status:", error);
    return Response.json({ error: "Failed to fetch profile." }, { status: 500 });
  }

  return Response.json({ isPremium: data?.is_premium ?? false });
}

export async function PATCH() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("user_profiles")
    .update({ is_premium: true })
    .eq("id", user.id);

  if (error) {
    console.error("Failed to update premium status:", error);
    return Response.json({ error: "Failed to update profile." }, { status: 500 });
  }

  return Response.json({ ok: true });
}
