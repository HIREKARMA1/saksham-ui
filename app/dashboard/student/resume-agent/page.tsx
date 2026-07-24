"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { ResumeRetargetChat } from "@/components/resume/ResumeRetargetChat";
import { apiClient } from "@/lib/api";
import {
  Sparkles,
  FileText,
  ArrowRight,
  RefreshCw,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * Resume Agent POC surface — wired to existing Student Context + Resume Agent APIs
 * (`/students/context`, `/students/agents/resume/*`) and ResumeRetargetChat.
 * Upload remains on the main Resume Analysis page (legacy ATS + versioning).
 */
export default function ResumeAgentPage() {
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState<any | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [sidebar, setSidebar] = useState<any | null>(null);
  const [recommending, setRecommending] = useState(false);

  const activeResumeVersionId =
    context?.active_resume_version_id ||
    versions.find((v) => v.is_active)?.id ||
    versions[0]?.id ||
    null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ctxRes, verRes] = await Promise.all([
        apiClient.getStudentContext().catch(() => ({ context: null })),
        apiClient.getResumeGapVersions().catch(() => ({ versions: [] })),
      ]);
      setContext(ctxRes?.context || null);
      setVersions(verRes?.versions || []);
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Failed to load context");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const recommend = async () => {
    if (!activeResumeVersionId) {
      toast.error("Upload and activate a resume on Resume Analysis first");
      return;
    }
    setRecommending(true);
    try {
      const res = await apiClient.recommendStudentRoles(5);
      setRoles(res?.recommendation?.roles || []);
      setContext(res?.context || context);
      toast.success("Role recommendations ready");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.detail ||
          "Recommend failed — mark a resume version active on Resume Analysis, then retry",
      );
    } finally {
      setRecommending(false);
    }
  };

  const rebuildCurriculum = async () => {
    try {
      const res = await apiClient.rebuildStudentCurriculum();
      setSidebar(res.sidebar);
      setContext(res.context);
      toast.success("Curriculum rebuilt");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Could not rebuild curriculum");
    }
  };

  const items = sidebar?.items || [];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-orange-600 font-semibold">POC</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500" />
              Resume Agent
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Conversational re-target on your active resume version. Uses the existing Student Context
              Object and Resume Agent contracts — no fabricated experience.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
            <Link
              href="/dashboard/student/resume"
              className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50"
            >
              <FileText className="w-4 h-4 mr-1" /> Upload / ATS
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-sm space-y-2">
                <p className="font-semibold">Active context</p>
                <p>
                  Resume version:{" "}
                  <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 rounded">
                    {activeResumeVersionId || "none — upload on Resume Analysis"}
                  </code>
                </p>
                <p>
                  Target role:{" "}
                  <span className="font-medium">{context?.target_role || "—"}</span>
                </p>
                {versions.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {versions.slice(0, 6).map((v: any) => (
                      <Badge
                        key={v.id}
                        variant={v.is_active || v.id === activeResumeVersionId ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        v{v.version_number || "?"} {v.is_active ? "active" : ""}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <ResumeRetargetChat
                activeResumeVersionId={activeResumeVersionId ? String(activeResumeVersionId) : null}
                onLocked={({ target_role, sidebar: sb }) => {
                  setContext((c: any) => ({ ...(c || {}), target_role }));
                  if (sb) setSidebar(sb);
                  void load();
                }}
              />

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => void recommend()} disabled={recommending}>
                  {recommending ? <Loader className="w-4 h-4" /> : "Recommend roles"}
                </Button>
                <Button variant="outline" onClick={() => void rebuildCurriculum()}>
                  Rebuild curriculum
                </Button>
              </div>

              {roles.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-2">
                  {roles.map((r: any) => (
                    <div
                      key={r.role_id}
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm"
                    >
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">{r.name}</span>
                        <Badge className="bg-slate-800">{Math.round(r.fit?.score ?? 0)}%</Badge>
                      </div>
                      {r.skill_gaps?.length > 0 && (
                        <p className="text-xs text-amber-700 mt-1">
                          Gaps: {r.skill_gaps.slice(0, 4).join(", ")}
                        </p>
                      )}
                      {r.fit?.reasoning?.summary && (
                        <p className="text-[11px] text-slate-500 mt-1">{r.fit.reasoning.summary}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 space-y-2">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  Curriculum plan
                </p>
                <p className="text-xs text-slate-600">
                  {sidebar?.headline || "Lock a resume to rebuild the sidebar"}
                </p>
                <ul className="space-y-2">
                  {items.map((item: any) => (
                    <li key={item.id}>
                      <Link
                        href={item.href || "/dashboard/student/drive-day"}
                        className={`flex items-center gap-2 text-sm ${
                          item.primary || item.kind === "drive_day"
                            ? "font-semibold text-orange-700"
                            : "text-slate-700"
                        }`}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        {item.title}
                        {(item.primary || item.kind === "drive_day") && (
                          <Badge className="bg-orange-600 text-[10px]">Primary</Badge>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/dashboard/student/drive-day"
                className="block rounded-xl border border-slate-800 bg-slate-900 text-white p-4 text-sm hover:bg-slate-800 transition"
              >
                <p className="font-semibold flex items-center gap-2">
                  <Layers className="w-4 h-4" /> TCS NQT Drive Day →
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Opens the immersive Placement Drive runner (config: tcs_nqt_phase1.json).
                </p>
              </Link>
            </aside>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
