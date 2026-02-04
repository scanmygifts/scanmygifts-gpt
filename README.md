# GiftLink MCP App (ChatGPT Apps SDK)

This repo scaffolds a ChatGPT App using the Apps SDK and MCP. It includes:
- MCP server hosted on Vercel (Next.js route handler)
- ChatGPT UI widget (MCP Apps standard)
- Supabase schema + Storage integration
- Public gift page for recipients

## Quick Start

1. Install deps
```
npm install
```

2. Copy env
```
cp .env.example .env.local
```

3. Run locally
```
npm run dev
```

4. Create your Supabase tables
- Use `supabase/schema.sql`
- Create a public storage bucket named `gift-media`

## MCP Server Endpoint
- `POST /api/mcp` (SSE / JSON-RPC transport)
- The route lives at `app/api/mcp/[transport]/route.ts`

## ChatGPT App UI
The UI widget is served from `public/widget/gift-widget.html` and loaded by ChatGPT using:
- `_meta.ui.resourceUri` in tool responses
- MCP Apps bridge (`tools/call`) from the iframe

## Tool Surface
- `gift.create` -> create gift + scheduled delivery
- `media.create_upload_url` -> signed upload URL + public URL
- `delivery.schedule` -> additional delivery schedule
- `gift.get` -> retrieve gift details

## Supabase
Tables are defined in `supabase/schema.sql`:
- `gifts`
- `media`
- `deliveries`
- `events`

Storage bucket: `gift-media` (public for MVP)

## Vercel Deployment
1. Push this repo to GitHub.
2. Create a Vercel project and set env vars:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_STORAGE_BUCKET`
   - `PUBLIC_BASE_URL`
3. Deploy. Your MCP endpoint will be:
   - `https://YOUR_DOMAIN.vercel.app/api/mcp`

## ChatGPT App Setup
1. Enable Developer Mode in ChatGPT.
2. Add your MCP server endpoint: `https://YOUR_DOMAIN.vercel.app/api/mcp`.
3. Test: call `health_check` then `gift.create`.
4. Submit the app from the OpenAI dashboard.

## Production TODOs
- Implement real delivery providers (SMS/WhatsApp/email via Twilio or similar)
- Add auth if you want sender accounts
- Add moderation checks for uploaded content
- Add RLS and signed URLs if you want private media

## Notes
- The MCP UI uses the MCP Apps standard so it can run in ChatGPT and other compatible hosts.
- The widget uses `tools/call` to invoke MCP tools.
