import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const PRICES = {
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID!,
  annual: process.env.STRIPE_ANNUAL_PRICE_ID!,
};

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { plan?: unknown };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const plan = body.plan;
    if (plan !== "monthly" && plan !== "annual") {
      return Response.json({ error: "plan must be 'monthly' or 'annual'." }, { status: 400 });
    }

    // Retrieve or create Stripe customer for this user
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("user_profiles select error:", profileError);
      return Response.json({ error: profileError.message }, { status: 500 });
    }

    let customerId = profile?.stripe_customer_id as string | null | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("user_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }

    const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: PRICES[plan], quantity: 1 }],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      allow_promotion_codes: true,
      metadata: { supabase_user_id: user.id },
      subscription_data: {
        metadata: { supabase_user_id: user.id },
      },
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Stripe error";
    return Response.json({ error: message }, { status: 500 });
  }
}
