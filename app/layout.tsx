import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DnD Statblock Builder",
  description: "Local-only NPC statblock builder for Foundry import"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
