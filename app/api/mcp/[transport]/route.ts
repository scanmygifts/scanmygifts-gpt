import { createMcpHandler } from "mcp-handler";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  createGiftSchema,
  createUploadSchema,
  giftGetSchema,
  scheduleSchema,
} from "@/lib/validation";
import { deliveryId, giftId, giftToken, mediaId } from "@/lib/ids";
import { getPublicBaseUrl, getStorageBucket, getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

const WIDGET_URI = "ui://widget/gift-widget-v1.html";
const widgetHtml = readFileSync(
  path.join(process.cwd(), "public/widget/gift-widget.html"),
  "utf8"
);

const handler = createMcpHandler(
  (server) => {
    const mcpServer = server as McpServer;
    const supabase = getSupabase();
    const publicBaseUrl = getPublicBaseUrl();
    const storageBucket = getStorageBucket();

    registerAppResource(
      mcpServer,
      "gift-widget",
      WIDGET_URI,
      {},
      async () => ({
        contents: [
          {
            uri: WIDGET_URI,
            mimeType: RESOURCE_MIME_TYPE,
            text: widgetHtml,
            _meta: {
              ui: {
                prefersBorder: false,
                domain: publicBaseUrl,
                csp: {
                  connectDomains: [publicBaseUrl, process.env.SUPABASE_URL || ""].filter(
                    Boolean
                  ),
                  resourceDomains: [process.env.SUPABASE_URL || ""].filter(Boolean),
                },
              },
            },
          },
        ],
      })
    );

    registerAppTool(
      mcpServer,
      "gift.create",
      {
        title: "Create Gift",
        inputSchema: createGiftSchema.shape,
        _meta: {
          ui: { resourceUri: WIDGET_URI },
        },
      },
      async (input) => {
        const payload = createGiftSchema.parse(input);
        const id = giftId();
        const token = giftToken();
        const shareUrl = `${publicBaseUrl}/gift/${token}`;
        const createdAt = new Date().toISOString();

        const { error: giftError } = await supabase.from("gpt_gifts").insert({
          id,
          token,
          sender_name: payload.senderName,
          recipient_name: payload.recipientName,
          recipient_contact: payload.recipientContact,
          channel: payload.channel,
          send_at: payload.sendAt,
          timezone: payload.timezone ?? null,
          note: payload.note ?? null,
          share_url: shareUrl,
          created_at: createdAt,
        });

        if (giftError) {
          throw new Error(giftError.message);
        }

        const delivery = {
          id: deliveryId(),
          gift_id: id,
          channel: payload.channel,
          send_at: payload.sendAt,
          status: "scheduled",
          created_at: createdAt,
        };

        const { error: deliveryError } = await supabase
          .from("gpt_deliveries")
          .insert(delivery);

        if (deliveryError) {
          throw new Error(deliveryError.message);
        }

        return {
          structuredContent: {
            giftId: id,
            shareUrl,
            sendAt: payload.sendAt,
            channel: payload.channel,
            recipientName: payload.recipientName,
          },
          content: [
            {
              type: "text",
              text: `Created a gift link for ${payload.recipientName}.`,
            },
          ],
          _meta: {
            gift: {
              id,
              token,
              shareUrl,
              senderName: payload.senderName,
              recipientName: payload.recipientName,
              note: payload.note ?? null,
            },
            delivery,
          },
        };
      }
    );

    registerAppTool(
      mcpServer,
      "media.create_upload_url",
      {
        title: "Create Media Upload URL",
        inputSchema: createUploadSchema.shape,
        _meta: {
          ui: { resourceUri: WIDGET_URI },
        },
      },
      async (input) => {
        const payload = createUploadSchema.parse(input);
        const id = mediaId();
        const extension = payload.filename.split(".").pop() || "bin";
        const storagePath = `${payload.giftId}/${id}.${extension}`;

        const { data: signed, error: signedError } = await supabase.storage
          .from(storageBucket)
          .createSignedUploadUrl(storagePath, { upsert: false });

        if (signedError || !signed) {
          throw new Error(signedError?.message || "Unable to create upload URL");
        }

        const { data: publicData } = supabase.storage
          .from(storageBucket)
          .getPublicUrl(storagePath);

        const publicUrl = publicData.publicUrl;

        const { error: mediaError } = await supabase.from("gpt_media").insert({
          id,
          gift_id: payload.giftId,
          kind: payload.kind,
          mime_type: payload.mimeType,
          storage_path: storagePath,
          public_url: publicUrl,
          created_at: new Date().toISOString(),
        });

        if (mediaError) {
          throw new Error(mediaError.message);
        }

        return {
          structuredContent: {
            mediaId: id,
            kind: payload.kind,
            publicUrl,
          },
          content: [
            {
              type: "text",
              text: "Upload URL created. Upload the file now.",
            },
          ],
          _meta: {
            upload: {
              signedUrl: signed.signedUrl,
              publicUrl,
            },
          },
        };
      }
    );

    registerAppTool(
      mcpServer,
      "delivery.schedule",
      {
        title: "Schedule Delivery",
        inputSchema: scheduleSchema.shape,
        _meta: {
          ui: { resourceUri: WIDGET_URI },
        },
      },
      async (input) => {
        const payload = scheduleSchema.parse(input);
        const record = {
          id: deliveryId(),
          gift_id: payload.giftId,
          channel: payload.channel,
          send_at: payload.sendAt,
          status: "scheduled",
          created_at: new Date().toISOString(),
        };

        const { error } = await supabase.from("gpt_deliveries").insert(record);
        if (error) {
          throw new Error(error.message);
        }

        return {
          structuredContent: {
            deliveryId: record.id,
            status: record.status,
            sendAt: record.send_at,
          },
          content: [{ type: "text", text: "Delivery scheduled." }],
          _meta: { delivery: record },
        };
      }
    );

    registerAppTool(
      mcpServer,
      "gift.get",
      {
        title: "Get Gift",
        inputSchema: giftGetSchema.shape,
        _meta: {
          ui: { resourceUri: WIDGET_URI },
        },
      },
      async (input) => {
        const payload = giftGetSchema.parse(input);
        const { data, error } = await supabase
          .from("gpt_gifts")
          .select(
            "id, sender_name, recipient_name, note, share_url, send_at, channel, token, gpt_media (id, kind, public_url, mime_type)"
          )
          .eq("id", payload.giftId)
          .single();

        if (error || !data) {
          throw new Error(error?.message || "Gift not found");
        }

        return {
          structuredContent: {
            giftId: data.id,
            shareUrl: data.share_url,
            senderName: data.sender_name,
            recipientName: data.recipient_name,
            note: data.note,
            media: data.gpt_media,
          },
          content: [{ type: "text", text: "Loaded gift details." }],
          _meta: { gift: data },
        };
      }
    );

    server.tool("health_check", "Check server health", {}, async () => ({
      content: [{ type: "text", text: "ok" }],
    }));
  },
  {},
  {
    basePath: "/api/mcp",
    maxDuration: 60,
  }
);

export async function GET(
  request: Request,
  context: { params: { transport: string } }
) {
  if (context.params.transport === "mcp") {
    return new Response("ok", { status: 200 });
  }
  return handler(request);
}

export { handler as POST };
