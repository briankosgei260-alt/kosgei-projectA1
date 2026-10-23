import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Private Portal",
  description: "A private portal for your approved devices.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#f3f5f8",
          color: "#172033",
          fontFamily: "Arial, sans-serif",
          margin: 0,
        }}
      >
        <main style={{ margin: "48px auto", maxWidth: 680, padding: 24 }}>
          {children}
        </main>
      </body>
    </html>
  );
}
