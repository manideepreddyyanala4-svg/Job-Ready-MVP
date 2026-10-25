import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobReady — Build the evidence your target role requires",
  description: "A job-readiness assessment and project execution platform for Indian college students.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
