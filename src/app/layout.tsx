import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JobReady — Build the evidence your target role is missing",
    template: "%s · JobReady",
  },
  description: "Upload your resume, identify missing career evidence, and build a verified end-to-end project you can defend in interviews.",
  applicationName: "JobReady",
  openGraph: {
    title: "JobReady — Build the evidence your target role is missing",
    description: "Resume-to-evidence-gap analysis and guided project execution for early-career technical roles.",
    type: "website",
    siteName: "JobReady",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobReady",
    description: "Stop building random projects. Build the evidence your target role is missing.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f7f5",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
