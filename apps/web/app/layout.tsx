import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowMate – Focus Timer for ADHD & Deep Work",
  description:
    "FlowMate is a free audio-guided focus timer for ADHD, time blindness, and deep work. Set your intention, hear time pass, and stay on task — no clock-watching required.",
  keywords: [
    "ADHD timer",
    "focus timer for ADHD",
    "time blindness timer",
    "Pomodoro timer ADHD",
    "audio focus timer",
    "ADHD productivity app",
    "ADHD time management",
    "Pomodoro technique ADHD",
    "deep work timer",
    "time awareness ADHD",
  ],
  metadataBase: new URL("https://flowmate.club"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FlowMate – Focus Timer for ADHD & Deep Work",
    description:
      "Audio-guided focus timer designed for ADHD, time blindness, and deep work. Hear time pass. Stay on task. Free and private — no account needed.",
    url: "https://flowmate.club",
    siteName: "FlowMate",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FlowMate – Audio Focus Timer for ADHD",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowMate – Focus Timer for ADHD & Deep Work",
    description:
      "Audio-guided Pomodoro timer for ADHD & deep work. Hear time pass. Stay focused. Free & private.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/icons/favicon.ico"],
  },
  manifest: "/icons/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "FlowMate",
              url: "https://flowmate.club",
              description:
                "Audio-guided focus timer for ADHD, time blindness, and deep work sessions.",
              applicationCategory: "ProductivityApplication",
              operatingSystem: "Web, Android, iOS",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              featureList: [
                "Audio time announcements",
                "Pomodoro timer",
                "ADHD-friendly focus sessions",
                "No account required",
                "Private — data stays on your device",
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
