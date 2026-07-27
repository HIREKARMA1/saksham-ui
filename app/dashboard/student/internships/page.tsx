"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { Office3DExperienceDynamic } from "@/components/office/Office3DExperienceLazy";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import { ArrowRight, Box } from "lucide-react";

export default function InternshipsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewCompany, setPreviewCompany] = useState<string>("AI Office");
  const [showFeel, setShowFeel] = useState(true);
  const [avatarGender, setAvatarGender] = useState<"male" | "female" | null>(null);

  useEffect(() => {
    const g = (user as { gender?: string } | null)?.gender;
    if (g === "male" || g === "female") setAvatarGender(g);
  }, [user]);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.getInternshipTemplates();
        const list = res.templates || [];
        setTemplates(list);
        if (list[0]?.company) setPreviewCompany(list[0].company);
      } catch (e: any) {
        setError(e?.message || "Failed to load internships");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const start = async (slug: string) => {
    setStarting(slug);
    setError(null);
    try {
      const run = await apiClient.startInternship(slug);
      router.push(`/dashboard/student/internships/${run.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Could not start internship");
      setStarting(null);
    }
  };

  const studentName = user?.name || "You";
  const studentGender = avatarGender || (user as { gender?: string } | null)?.gender || null;

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="sq-page mx-auto max-w-5xl space-y-8">
          <header className="space-y-2">
            <p className="sq-label text-[var(--sq-accent)]">AI Work Experience</p>
            <h1 className="sq-display text-[var(--sq-ink)]">AI Office Internships</h1>
            <p className="sq-body text-[var(--sq-muted)] max-w-xl">
              Step into a real 3D office as yourself, feel the space, then work with AI teammates —
              email, Slack, tasks, reviews, and a completion certificate on your Career Passport.
            </p>
          </header>

          {showFeel && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--sq-muted)]">
                    Feel the office
                  </h2>
                  <p className="text-sm text-[var(--sq-muted)]">
                    Your avatar sits at the desk · drag to look · click teal markers
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-full border border-[var(--sq-border)] bg-[var(--sq-surface)] p-1">
                    <button
                      type="button"
                      onClick={() => setAvatarGender("male")}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        studentGender === "male" ? "bg-teal-700 text-white" : "text-[var(--sq-muted)]"
                      }`}
                    >
                      Male avatar
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarGender("female")}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        studentGender === "female" ? "bg-teal-700 text-white" : "text-[var(--sq-muted)]"
                      }`}
                    >
                      Female avatar
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowFeel(false)}
                    className="text-xs text-[var(--sq-muted)] hover:text-[var(--sq-ink)]"
                  >
                    Hide 3D preview
                  </button>
                </div>
              </div>
              <Office3DExperienceDynamic
                company={previewCompany}
                mode="preview"
                height="min-h-[380px] h-[52vh]"
                studentName={studentName}
                studentGender={studentGender}
              />
              {!loading && templates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.slug}
                      type="button"
                      onClick={() => setPreviewCompany(t.company || t.title)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        previewCompany === (t.company || t.title)
                          ? "border-teal-700 bg-teal-700 text-white"
                          : "border-[var(--sq-border)] bg-[var(--sq-surface)] text-[var(--sq-ink)] hover:bg-[var(--sq-surface-2)]"
                      }`}
                    >
                      {t.company}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {!showFeel && (
            <button
              type="button"
              onClick={() => setShowFeel(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--sq-border)] bg-[var(--sq-surface)] px-4 py-2 text-sm font-medium text-[var(--sq-ink)]"
            >
              <Box className="h-4 w-4" />
              Show 3D office preview
            </button>
          )}

          {error && (
            <p className="text-sm text-[var(--sq-danger)]" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-28 rounded-[var(--sq-radius-lg)] bg-[var(--sq-surface-2)]" />
              <div className="h-28 rounded-[var(--sq-radius-lg)] bg-[var(--sq-surface-2)]" />
            </div>
          ) : (
            <ul className="space-y-4">
              {templates.map((t) => (
                <li
                  key={t.slug}
                  className="rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs uppercase tracking-wide text-[var(--sq-muted)]">{t.company}</p>
                      <h2 className="text-lg font-semibold text-[var(--sq-ink)]">{t.title}</h2>
                      <p className="text-sm text-[var(--sq-muted)]">{t.description}</p>
                      <p className="text-xs text-[var(--sq-muted)]">
                        {t.duration_days} days · {t.role_track} · teammates:{" "}
                        {(t.office_actors || []).join(", ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewCompany(t.company || t.title);
                          setShowFeel(true);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-[var(--sq-border)] px-4 py-2.5 text-sm font-medium text-[var(--sq-ink)] hover:bg-[var(--sq-surface-2)]"
                      >
                        <Box className="h-4 w-4" />
                        Feel 3D view
                      </button>
                      <button
                        type="button"
                        disabled={starting === t.slug}
                        onClick={() => void start(t.slug)}
                        className="inline-flex items-center gap-2 rounded-full bg-[var(--sq-accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {starting === t.slug ? "Starting…" : "Join office"}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
