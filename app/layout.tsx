import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flowmate - Pomodoro Timer",
  description: "A pomodoro timer with audio ticking and verbal announcements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
