import { z } from "zod";

export const channelSchema = z.enum(["sms", "whatsapp", "email"]);

export const createGiftSchema = z.object({
  senderName: z.string().min(1).max(80),
  recipientName: z.string().min(1).max(80),
  recipientContact: z.string().min(3).max(200),
  channel: channelSchema,
  sendAt: z.string().datetime(),
  timezone: z.string().min(2).max(64).optional(),
  note: z.string().max(500).optional(),
});

export const createUploadSchema = z.object({
  giftId: z.string().min(6).max(32),
  kind: z.enum(["image", "audio", "video"]),
  filename: z.string().min(1).max(200),
  mimeType: z.string().min(3).max(120),
});

export const scheduleSchema = z.object({
  giftId: z.string().min(6).max(32),
  channel: channelSchema,
  sendAt: z.string().datetime(),
});

export const giftGetSchema = z.object({
  giftId: z.string().min(6).max(32),
});

export const giftTokenSchema = z.object({
  token: z.string().min(8).max(40),
});
