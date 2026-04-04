import { createSupabaseServiceClient } from "@/lib/supabase-server";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

// RevenueCat signs webhook payloads with HMAC-SHA256.
// Set REVENUECAT_WEBHOOK_SECRET in your environment variables
// (RevenueCat dashboard → Project Settings → Webhooks → Authorization header value).
function verifySignature(body: string, authHeader: string | null): boolean {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret) {
    console.error("REVENUECAT_WEBHOOK_SECRET is not set");
    return false;
  }
  if (!authHeader) return false;
  // RC sends the secret directly in the Authorization header (not HMAC).
  // Compare using timing-safe equality to prevent timing attacks.
  try {
    const expected = Buffer.from(secret);
    const received = Buffer.from(authHeader);
    if (expected.length !== received.length) return false;
    return timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

type RCEventType =
  | "INITIAL_PURCHASE"
  | "RENEWAL"
  | "PRODUCT_CHANGE"
  | "CANCELLATION"
  | "BILLING_ISSUE"
  | "SUBSCRIBER_ALIAS"
  | "UNCANCELLATION"
  | "NON_SUBSCRIPTION_PURCHASE"
  | "EXPIRATION"
  | "TRANSFER";

interface RCWebhookPayload {
  event: {
    type: RCEventType;
    app_user_id: string;         // Supabase user ID (we set this as RC App User ID)
    original_app_user_id: string;
    product_id: string;
    period_type?: string;
    expiration_at_ms?: number;
    cancel_reason?: string;
    subscriber_attributes?: Record<string, { value: string }>;
  };
  api_version: string;
}

export async function POST(request: Request) {
  const body = await request.text();
  const authHeader = request.headers.get("authorization");

  if (!verifySignature(body, authHeader)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: RCWebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, app_user_id } = payload.event;
  if (!app_user_id) {
    return Response.json({ error: "Missing app_user_id" }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION": {
      await supabase
        .from("user_profiles")
        .update({
          is_premium: true,
          subscription_source: "revenuecat",
          subscription_status: "active",
          premium_updated_at: new Date().toISOString(),
        })
        .eq("id", app_user_id);
      break;
    }

    case "BILLING_ISSUE": {
      // Subscription is in a grace period — keep premium active but flag status
      await supabase
        .from("user_profiles")
        .update({
          subscription_status: "past_due",
          premium_updated_at: new Date().toISOString(),
        })
        .eq("id", app_user_id);
      break;
    }

    case "CANCELLATION":
    case "EXPIRATION": {
      // CANCELLATION fires when the user cancels but the sub may still be active until period end.
      // EXPIRATION fires when access actually ends.
      // Only revoke premium on EXPIRATION or when cancel_reason is immediate.
      if (type === "EXPIRATION") {
        await supabase
          .from("user_profiles")
          .update({
            is_premium: false,
            subscription_status: "canceled",
            premium_updated_at: new Date().toISOString(),
          })
          .eq("id", app_user_id);
      } else {
        // CANCELLATION — still active until period end, just update status
        await supabase
          .from("user_profiles")
          .update({
            subscription_status: "canceled",
            premium_updated_at: new Date().toISOString(),
          })
          .eq("id", app_user_id);
      }
      break;
    }

    case "TRANSFER": {
      // A transfer moves a subscriber from one app user ID to another.
      // The new owner is in app_user_id; original owner lost access.
      const { original_app_user_id } = payload.event;
      if (original_app_user_id && original_app_user_id !== app_user_id) {
        await supabase
          .from("user_profiles")
          .update({
            is_premium: false,
            subscription_status: "transferred",
            premium_updated_at: new Date().toISOString(),
          })
          .eq("id", original_app_user_id);
      }
      await supabase
        .from("user_profiles")
        .update({
          is_premium: true,
          subscription_source: "revenuecat",
          subscription_status: "active",
          premium_updated_at: new Date().toISOString(),
        })
        .eq("id", app_user_id);
      break;
    }

    default:
      // Unhandled event types — acknowledge receipt but take no action
      break;
  }

  return Response.json({ received: true });
}
