import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = getSupabase();
  const token = params.token;

  const { data, error } = await supabase
    .from("gifts")
    .select(
      "id, sender_name, recipient_name, note, share_url, send_at, channel, media (id, kind, public_url, mime_type)"
    )
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Gift not found" }, { status: 404 });
  }

  return NextResponse.json({ gift: data }, { status: 200 });
}
