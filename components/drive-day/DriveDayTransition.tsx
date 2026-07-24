"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";

type Props = {
  session: any;
  onContinue: () => Promise<void>;
};

export function DriveDayTransition({ session, onContinue }: Props) {
  const [busy, setBusy] = useState(false);
  const wait = Number(session?.template?.timing_config?.transition_seconds || 8);
  const [left, setLeft] = useState(wait);
  const round = session?.current_round || {};
  const skin = session?.template?.branding_skin || {};

  useEffect(() => {
    setLeft(wait);
  }, [wait, session?.current_round_index]);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div
        className="w-full max-w-xl rounded-2xl p-10 text-white shadow-xl"
        style={{ background: skin.primary || "#1A4B8C" }}
      >
        <p className="text-xs uppercase tracking-wider opacity-70">Transition</p>
        <h2 className="text-2xl font-bold mt-2">{round.title}</h2>
        <p className="mt-4 text-sm leading-relaxed opacity-95">{round.copy}</p>
        <p className="mt-6 text-xs opacity-70">{left > 0 ? `Continuing in ${left}s…` : "Ready"}</p>
        <Button
          className="mt-6 bg-[#E87722] hover:bg-[#d66a1a]"
          disabled={busy || left > 0}
          onClick={async () => {
            setBusy(true);
            try {
              await onContinue();
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader className="w-4 h-4" /> : "Continue"}
        </Button>
      </div>
    </div>
  );
}
