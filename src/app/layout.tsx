import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TimeTracker – Smart Time Tracking for Professionals",
    template: "%s | TimeTracker",
  },
  description:
    "TimeTracker is a powerful time tracking app for professionals, freelancers, and teams. Log work hours, analyze productivity, manage projects, and export reports in PDF, Excel, or JSON.",
  keywords: [
    "time tracking",
    "productivity",
    "project management",
    "work hours",
    "freelancer tools",
    "time entry",
    "reports",
    "analytics",
  ],
  authors: [{ name: "Rashed Abdullah", url: "https://rashedabdullah.com" }],
  creator: "Rashed Abdullah",
  metadataBase: new URL("https://timeentry.dirasah.org"),
  openGraph: {
    title: "TimeTracker – Smart Time Tracking for Professionals",
    description:
      "Track work hours, analyze productivity, and generate reports with TimeTracker — built for professionals, freelancers, and teams.",
    url: "https://timeentry.dirasah.org",
    siteName: "TimeTracker",
    images: [
      {
        url: "/cover-image.png",
        width: 1200,
        height: 630,
        alt: "TimeTracker – Smart Time Tracking",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TimeTracker – Smart Time Tracking for Professionals",
    description:
      "Log hours, manage projects, and export reports — all in one place.",
    images: ["/cover-image.png"],
    creator: "@RashedAbdullah",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ubuntu.variable} font-ubuntu  antialiased`}>
        {children}
      </body>
    </html>
  );
}
