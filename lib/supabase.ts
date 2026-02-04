import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL");
}

if (!supabaseServiceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

export const storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "gift-media";

export const publicBaseUrl = process.env.PUBLIC_BASE_URL || "http://localhost:3000";

export const messageSender = process.env.MESSAGE_SENDER_NAME || "GiftLink";
