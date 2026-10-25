"use client";

import { ErrorState } from "@/components/ui";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="app-page"><ErrorState body="We couldn't load this part of JobReady. Your saved data has not been changed." retry={reset} /></main>;
}
