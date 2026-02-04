create table if not exists gpt_gifts (
  id text primary key,
  token text unique not null,
  sender_name text not null,
  sender_contact text,
  recipient_name text not null,
  recipient_contact text not null,
  channel text not null,
  send_at timestamptz not null,
  timezone text,
  occasion text,
  note text,
  share_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists gpt_media (
  id text primary key,
  gift_id text not null references gpt_gifts(id) on delete cascade,
  kind text not null,
  mime_type text not null,
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists gpt_deliveries (
  id text primary key,
  gift_id text not null references gpt_gifts(id) on delete cascade,
  channel text not null,
  send_at timestamptz not null,
  status text not null,
  provider_id text,
  created_at timestamptz not null default now()
);

create table if not exists gpt_events (
  id bigserial primary key,
  gift_id text not null references gpt_gifts(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_gpt_gifts_token on gpt_gifts(token);
create index if not exists idx_gpt_media_gift_id on gpt_media(gift_id);
create index if not exists idx_gpt_deliveries_gift_id on gpt_deliveries(gift_id);
