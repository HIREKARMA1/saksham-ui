"use client";

import { Suspense, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Office3DScene, type OfficeHotspotId } from "./Office3DScene";

const HOTSPOT_COPY: Record<
  OfficeHotspotId,
  { title: string; body: string; vibe: string }
> = {
  desk: {
    title: "Your desk",
    body: "Dual monitor, quiet focus zone. This is where tasks land and reviews come back.",
    vibe: "Deep work",
  },
  meeting: {
    title: "Glass meeting room",
    body: "Standups, 1:1s, and stakeholder syncs happen here with your AI manager and peers.",
    vibe: "Collaboration",
  },
  standup: {
    title: "Standup board",
    body: "Yesterday / today / blockers — keep it crisp. The office rhythm starts here.",
    vibe: "Cadence",
  },
  window: {
    title: "City view",
    body: "Daylight and skyline. Take a breath between PRs — placement pressure feels different with space.",
    vibe: "Presence",
  },
};

export type Office3DExperienceProps = {
  company?: string;
  className?: string;
  height?: string;
  mode?: "preview" | "immersive";
  onEnterWork?: () => void;
  studentName?: string;
  studentGender?: string | null;
};

const LOOK_AT: Record<OfficeHotspotId, [number, number, number]> = {
  desk: [-0.8, 1.1, -2.0],
  meeting: [5.2, 1.15, 3.3],
  standup: [-7.0, 1.5, -2.0],
  window: [1.5, 1.6, -6.0],
};

function OfficeCanvas({
  company,
  mode,
  active,
  onHotspot,
  studentName,
  studentGender,
}: {
  company: string;
  mode: "preview" | "immersive";
  active: OfficeHotspotId | null;
  onHotspot: (id: OfficeHotspotId) => void;
  studentName?: string;
  studentGender?: string | null;
}) {
  const cameraPos = useMemo(
    () => (mode === "preview" ? ([6.5, 4.2, 7.5] as const) : ([0.2, 1.55, 4.8] as const)),
    [mode],
  );
  const target = active
    ? LOOK_AT[active]
    : mode === "preview"
      ? ([0, 1.1, -1] as [number, number, number])
      : ([0, 1.2, -1] as [number, number, number]);

  return (
    <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true, alpha: false }}>
      <color attach="background" args={["#dce8f0"]} />
      <fog attach="fog" args={["#dce8f0", 12, 28]} />
      <PerspectiveCamera makeDefault position={cameraPos} fov={mode === "preview" ? 42 : 58} />
      <ambientLight intensity={0.55} />
      <directionalLight
        castShadow
        position={[6, 9, 4]}
        intensity={1.15}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={["#e8f2ff", "#c9b8a0", 0.45]} />
      <Suspense fallback={null}>
        <Office3DScene
          company={company}
          interactive
          activeHotspot={active}
          onHotspot={onHotspot}
          studentName={studentName}
          studentGender={studentGender}
        />
        <ContactShadows position={[0, 0.01, 0]} opacity={0.35} scale={20} blur={2.4} far={8} />
        <Environment preset="city" />
      </Suspense>
      <OrbitControls
        key={active ?? `${mode}-default`}
        makeDefault
        enablePan={mode === "immersive"}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={mode === "preview" ? 6 : active ? 2.2 : 1.8}
        maxDistance={mode === "preview" ? 14 : 10}
        target={target}
        enableDamping
        dampingFactor={0.08}
        autoRotate={mode === "preview" && !active}
        autoRotateSpeed={0.45}
      />
    </Canvas>
  );
}

/**
 * Interactive 3D AI Office — drag to look, click hotspots to feel zones.
 */
export function Office3DExperience({
  company = "Company",
  className = "",
  height = "min-h-[360px] h-[48vh]",
  mode = "preview",
  onEnterWork,
  studentName = "You",
  studentGender = null,
}: Office3DExperienceProps) {
  const [active, setActive] = useState<OfficeHotspotId | null>(
    mode === "immersive" ? "desk" : null,
  );
  const copy = active ? HOTSPOT_COPY[active] : null;
  const genderLabel =
    (studentGender || "").toLowerCase() === "female"
      ? "female"
      : (studentGender || "").toLowerCase() === "male"
        ? "male"
        : null;

  return (
    <div className={`relative overflow-hidden rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[#dce8f0] ${className}`}>
      <div className={`${height} w-full`}>
        <OfficeCanvas
          company={company}
          mode={mode}
          active={active}
          onHotspot={(id) => setActive(id)}
          studentName={studentName}
          studentGender={studentGender}
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
        <div className="rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 shadow-sm backdrop-blur">
          {company} · 3D office
          {genderLabel ? ` · ${genderLabel} avatar` : ""}
        </div>
        <div className="rounded-full bg-slate-900/70 px-3 py-1.5 text-[11px] text-white/90 backdrop-blur">
          Drag to look · scroll to zoom · click markers
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-slate-950/70 via-slate-950/35 to-transparent p-4 pt-10">
        {copy ? (
          <div className="max-w-lg rounded-2xl bg-white/92 p-4 shadow-lg backdrop-blur">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-700">
              {copy.vibe}
            </p>
            <h3 className="mt-1 text-base font-semibold text-slate-900">{copy.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{copy.body}</p>
            {active === "desk" && (
              <p className="mt-2 text-xs font-medium text-teal-800">
                That&apos;s you — {studentName.split(" ")[0]} — seated at your desk.
              </p>
            )}
          </div>
        ) : (
          <p className="max-w-md text-sm text-white/90">
            You&apos;re already seated at your desk. Explore the office, then start work when it feels real.
          </p>
        )}
        {onEnterWork && (
          <button
            type="button"
            onClick={onEnterWork}
            className="pointer-events-auto inline-flex items-center rounded-full bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Enter workspace
          </button>
        )}
      </div>
    </div>
  );
}
