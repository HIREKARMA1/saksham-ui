"use client";

import dynamic from "next/dynamic";
import type { Office3DExperienceProps } from "./Office3DExperience";

export const Office3DExperienceDynamic = dynamic<Office3DExperienceProps>(
  () => import("./Office3DExperience").then((m) => m.Office3DExperience),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[360px] h-[48vh] items-center justify-center rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface-2)] text-sm text-[var(--sq-muted)]">
        Loading 3D office…
      </div>
    ),
  },
);
