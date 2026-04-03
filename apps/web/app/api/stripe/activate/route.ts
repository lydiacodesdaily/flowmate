import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { sessionId?: unknown };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const sessionId = body.sessionId;
    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return Response.json({ error: "Invalid session ID." }, { status: 400 });
    }

    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.mode !== "subscription" ||
      session.payment_status !== "paid" ||
      session.status !== "complete"
    ) {
      return Response.json({ error: "Session not completed." }, { status: 400 });
    }

    // Confirm this session belongs to the authenticated user
    const supabaseUserId = session.metadata?.supabase_user_id;
    if (supabaseUserId !== user.id) {
      return Response.json({ error: "Session does not belong to this user." }, { status: 403 });
    }

    const serviceClient = createSupabaseServiceClient();
    const { error } = await serviceClient
      .from("user_profiles")
      .update({
        is_premium: true,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        subscription_status: "active",
      })
      .eq("id", user.id);

    if (error) {
      console.error("Failed to activate premium:", error);
      return Response.json({ error: "Failed to activate premium." }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Stripe activate error:", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return Response.json({ error: message }, { status: 500 });
  }
}
