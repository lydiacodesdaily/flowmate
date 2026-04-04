import { stripe } from "@/lib/stripe";
import { createSupabaseServiceClient } from "@/lib/supabase-server";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

// Stripe requires the raw body for signature verification —
// Next.js App Router gives us the raw body via request.text().
export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return Response.json({ error: "Missing signature or secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      const supabaseUserId = (session.metadata?.supabase_user_id as string | undefined);
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (!supabaseUserId) {
        console.error("checkout.session.completed: no supabase_user_id in metadata");
        break;
      }

      await supabase
        .from("user_profiles")
        .update({
          is_premium: true,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          subscription_source: "stripe",
          subscription_status: "active",
          premium_updated_at: new Date().toISOString(),
        })
        .eq("id", supabaseUserId);

      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const supabaseUserId = sub.metadata?.supabase_user_id;
      if (!supabaseUserId) break;

      const isActive = sub.status === "active" || sub.status === "trialing";

      await supabase
        .from("user_profiles")
        .update({
          is_premium: isActive,
          subscription_source: "stripe",
          subscription_status: sub.status,
          stripe_subscription_id: sub.id,
          premium_updated_at: new Date().toISOString(),
        })
        .eq("id", supabaseUserId);

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const supabaseUserId = sub.metadata?.supabase_user_id;
      if (!supabaseUserId) break;

      await supabase
        .from("user_profiles")
        .update({
          is_premium: false,
          subscription_source: "stripe",
          subscription_status: "canceled",
          premium_updated_at: new Date().toISOString(),
        })
        .eq("id", supabaseUserId);

      break;
    }
  }

  return Response.json({ received: true });
}
