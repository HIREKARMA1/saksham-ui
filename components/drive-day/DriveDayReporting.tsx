"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

type Props = {
  session: any;
  onAcknowledge: () => Promise<void>;
};

export function DriveDayReporting({ session, onAcknowledge }: Props) {
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(
    Number(session?.template?.timing_config?.reporting_seconds || 45),
  );
  const skin = session?.template?.branding_skin || {};
  const round = session?.current_round || {};

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const canEnter = secondsLeft <= 0;

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center"
      style={{
        background: `linear-gradient(160deg, ${skin.primary || "#1A4B8C"} 0%, #0f2748 100%)`,
        color: skin.accent || "#fff",
      }}
    >
      <p className="text-sm uppercase tracking-[0.2em] opacity-80">{skin.logo_label || "TCS"}</p>
      <h1 className="text-3xl sm:text-4xl font-bold mt-2">{session?.template?.display_name}</h1>
      <p className="mt-2 text-sm opacity-90 max-w-lg">{skin.tagline}</p>

      <div className="mt-8 rounded-xl bg-white/10 border border-white/20 px-8 py-6 backdrop-blur">
        <p className="text-xs uppercase tracking-wider opacity-70">Candidate ID</p>
        <p className="text-2xl font-mono font-bold mt-1">{session?.candidate_id}</p>
      </div>

      <p className="mt-8 max-w-xl text-sm leading-relaxed opacity-95">{round.copy}</p>

      <div className="mt-6 text-sm opacity-80">
        {canEnter ? "You may now enter the assessment hall." : `Reporting desk — ${secondsLeft}s remaining`}
      </div>

      <Button
        className="mt-6 bg-[#E87722] hover:bg-[#d66a1a] text-white px-8"
        disabled={!canEnter || busy}
        onClick={async () => {
          setBusy(true);
          try {
            await onAcknowledge();
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? <Loader className="w-4 h-4" /> : "Enter assessment hall"}
      </Button>
      <p className="mt-3 text-xs opacity-60">Reporting cannot be skipped.</p>
    </div>
  );
}
