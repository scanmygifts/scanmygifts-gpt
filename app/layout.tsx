import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GiftLink MCP App",
  description: "Create gift experiences with photo + message delivery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
