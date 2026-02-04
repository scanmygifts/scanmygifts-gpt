create table if not exists gifts (
  id text primary key,
  token text unique not null,
  sender_name text not null,
  recipient_name text not null,
  recipient_contact text not null,
  channel text not null,
  send_at timestamptz not null,
  timezone text,
  note text,
  share_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists media (
  id text primary key,
  gift_id text not null references gifts(id) on delete cascade,
  kind text not null,
  mime_type text not null,
  storage_path text not null,
  public_url text not null,
  created_at timestamptz not null default now()
);

create table if not exists deliveries (
  id text primary key,
  gift_id text not null references gifts(id) on delete cascade,
  channel text not null,
  send_at timestamptz not null,
  status text not null,
  provider_id text,
  created_at timestamptz not null default now()
);

create table if not exists events (
  id bigserial primary key,
  gift_id text not null references gifts(id) on delete cascade,
  type text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_gifts_token on gifts(token);
create index if not exists idx_media_gift_id on media(gift_id);
create index if not exists idx_deliveries_gift_id on deliveries(gift_id);
