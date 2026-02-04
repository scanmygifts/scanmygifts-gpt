"use client";

import { useEffect, useMemo, useState } from "react";

type MediaItem = {
  id: string;
  kind: "image" | "audio" | "video";
  public_url: string;
  mime_type: string;
};

type Gift = {
  id: string;
  sender_name: string;
  recipient_name: string;
  note: string | null;
  share_url: string;
  send_at: string;
  channel: string;
  media: MediaItem[];
};

export default function GiftPage({ params }: { params: { token: string } }) {
  const [gift, setGift] = useState<Gift | null>(null);
  const [error, setError] = useState<string | null>(null);
  const heroMedia = useMemo(() => {
    if (!gift?.media?.length) return null;
    return gift.media.find((item) => item.kind === "image") ?? gift.media[0];
  }, [gift]);

  useEffect(() => {
    let active = true;
    fetch(`/api/gift/${params.token}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.error) {
          setError(data.error);
        } else {
          setGift(data.gift);
        }
      })
      .catch(() => {
        if (active) setError("Unable to load gift");
      });

    return () => {
      active = false;
    };
  }, [params.token]);

  if (error) {
    return (
      <main style={{ padding: "48px 24px" }}>
        <h1>Gift not found</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!gift) {
    return (
      <main style={{ padding: "48px 24px" }}>
        <p>Loading gift...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background:
          "radial-gradient(circle at top, rgba(255,235,179,0.6), rgba(255,255,255,0.95) 55%)",
        fontFamily: "'Georgia', serif",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "white",
          borderRadius: 24,
          padding: 32,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Hi {gift.recipient_name}!</h1>
        <p style={{ fontSize: 18 }}>
          {gift.sender_name} sent you a gift message.
        </p>
        {heroMedia?.kind === "image" && (
          <img
            src={heroMedia.public_url}
            alt="Gift preview"
            style={{
              width: "100%",
              borderRadius: 18,
              marginBottom: 20,
              objectFit: "cover",
            }}
          />
        )}
        {gift.note && (
          <blockquote
            style={{
              fontSize: 20,
              fontStyle: "italic",
              borderLeft: "4px solid #f0c36d",
              paddingLeft: 16,
              margin: "24px 0",
            }}
          >
            {gift.note}
          </blockquote>
        )}
        {gift.media
          .filter((item) => item.kind !== "image")
          .map((item) => (
            <div key={item.id} style={{ marginBottom: 16 }}>
              {item.kind === "audio" ? (
                <audio controls style={{ width: "100%" }} src={item.public_url} />
              ) : (
                <video controls style={{ width: "100%" }} src={item.public_url} />
              )}
            </div>
          ))}
      </div>
    </main>
  );
}
