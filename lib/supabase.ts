import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL");
  }

  if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

export function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "gpt-gift-media";
}

export function getPublicBaseUrl() {
  return process.env.PUBLIC_BASE_URL || "http://localhost:3000";
}

export function getMessageSender() {
  return process.env.MESSAGE_SENDER_NAME || "GiftLink";
}
