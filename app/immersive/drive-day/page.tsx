"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

/**
 * Immersive Drive Day — full viewport, no LMS chrome.
 */
export default function DriveDayImmersivePage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [company, setCompany] = useState("Amazon");
  const [role, setRole] = useState("SDE Intern");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codingResult, setCodingResult] = useState<any>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const starter = session?.coding_problem?.starter;
    if (session?.current_room === "coding_arena" && starter && !code) {
      setCode(starter);
    }
  }, [session?.current_room, session?.coding_problem?.starter]);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const s = await apiClient.startDriveDay(company, role);
      setSession(s);
      setCodingResult(null);
      setCode("");
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Could not start Drive Day");
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (!session?.id) return;
    setBusy(true);
    setError(null);
    try {
      const s = await apiClient.transitionDriveDay(session.id);
      setSession(s);
      if (s.current_room !== "coding_arena") {
        setCodingResult(null);
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Transition failed");
    } finally {
      setBusy(false);
    }
  };

  const submitCoding = async () => {
    if (!session?.id) return;
    setBusy(true);
    setError(null);
    try {
      const s = await apiClient.submitDriveDayCoding(session.id, {
        source_code: code,
        problem_slug: session.coding_problem?.slug || "two_sum",
        use_ai: false,
      });
      setSession(s);
      setCodingResult(s.coding_result || null);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Coding submit failed");
    } finally {
      setBusy(false);
    }
  };

  const inCoding = session?.current_room === "coding_arena";
  const codingLocked = Boolean(session?.requires_coding);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#070b14] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,116,144,0.25),_transparent_55%)]" />

      {!session ? (
        <div className="relative z-10 m-auto w-full max-w-lg space-y-6 px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Drive Day</p>
          <h1 className="text-4xl font-semibold tracking-tight">Campus placement, immersive.</h1>
          <p className="text-slate-400">
            Full-screen rooms from arrival to offer. Your scores update the Career Graph.
          </p>
          <label className="block space-y-2 text-sm">
            <span className="text-slate-400">Company</span>
            <select
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            >
              {["Amazon", "Google", "Microsoft", "TCS", "Accenture", "Deloitte"].map((c) => (
                <option key={c} value={c} className="text-black">
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-2 text-sm">
            <span className="text-slate-400">Role</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </label>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void start()}
              className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Entering…" : "Enter campus"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/student")}
              className="rounded-full border border-white/15 px-6 py-3 text-sm"
            >
              Exit
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex h-full flex-col">
          <header className="flex items-center justify-between px-6 py-4 text-xs uppercase tracking-wide text-slate-400">
            <span>
              {session.company} · {session.role}
            </span>
            <span>
              Room {session.room_index + 1}/{session.room_total}
            </span>
          </header>

          <main className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={session.current_room}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className={`w-full space-y-6 ${inCoding ? "max-w-3xl text-left" : "max-w-2xl text-center"}`}
              >
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300/90">
                  {String(session.current_room).replace(/_/g, " ")}
                </p>
                <h2
                  className={
                    inCoding
                      ? "text-2xl sm:text-3xl font-semibold tracking-tight"
                      : "text-3xl sm:text-5xl font-semibold tracking-tight"
                  }
                >
                  {session.copy}
                </h2>

                {inCoding && session.coding_problem && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap">
                      {session.coding_problem.statement}
                    </p>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                      rows={12}
                      className="w-full rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm text-slate-100"
                    />
                    <button
                      type="button"
                      disabled={busy || code.trim().length < 5}
                      onClick={() => void submitCoding()}
                      className="rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {busy ? "Judging…" : "Run tests"}
                    </button>
                    {codingResult && (
                      <p className="text-sm text-emerald-300">
                        {codingResult.tests_passed}/{codingResult.tests_total} tests · board{" "}
                        {codingResult.board_score}
                      </p>
                    )}
                  </div>
                )}

                {session.scores && Object.keys(session.scores).length > 0 && (
                  <p className="text-sm text-slate-400">
                    Scores:{" "}
                    {Object.entries(session.scores)
                      .map(([k, v]) => `${k} ${v}`)
                      .join(" · ")}
                  </p>
                )}
                {session.offer && (
                  <p className="text-sm text-emerald-300">
                    Offer: {session.offer.status}
                    {session.offer.overall != null ? ` · overall ${session.offer.overall}` : ""}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="flex items-center justify-between gap-4 px-6 py-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard/student")}
              className="text-sm text-slate-400 hover:text-white"
            >
              Leave
            </button>
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {session.status === "active" && session.next_room ? (
              <button
                type="button"
                disabled={busy || codingLocked}
                onClick={() => void next()}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 disabled:opacity-60"
                title={codingLocked ? "Submit coding first" : undefined}
              >
                {codingLocked ? "Submit code to continue" : "Continue"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/dashboard/student")}
                className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white"
              >
                Back to Career Home
              </button>
            )}
          </footer>
        </div>
      )}
    </div>
  );
}
