"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import type { VIProgram } from "@/types/virtualInternships";
import {
  BarChart3,
  ClipboardList,
  Plus,
  Rocket,
  Save,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

type TaskDraft = {
  day_number: number;
  title: string;
  description: string;
  task_type: string;
  deadline_days: number;
  points: number;
  is_published: boolean;
};

const emptyTask = (day: number): TaskDraft => ({
  day_number: day,
  title: `Day ${day} Task`,
  description: "",
  task_type: "assignment",
  deadline_days: 2,
  points: 10,
  is_published: day === 1,
});

export default function AdminVirtualInternshipsPage() {
  const [programs, setPrograms] = useState<VIProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [step, setStep] = useState<1 | 2>(1);
  const [saving, setSaving] = useState(false);
  const [createdProgramId, setCreatedProgramId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    overview: "",
    project_details: "",
    technology: "React",
    category: "Software",
    difficulty: "intermediate",
    duration_days: 5,
    daily_commitment_hours: 2,
    enrollment_limit: 100,
    instructor_name: "",
    skills: "React, Node.js, PostgreSQL",
    learning_outcomes: "Build real APIs\nShip a mini project\nPractice daily delivery",
    prerequisites: "Basic JavaScript",
    status: "draft",
    certificate_enabled: true,
    certificate_min_score: 0,
    certificate_min_completion_pct: 100,
    thumbnail_url: "",
    starts_at: "",
    start_mode: "now" as "now" | "later",
  });
  const [uploadingIcon, setUploadingIcon] = useState(false);

  const [referenceLinks, setReferenceLinks] = useState<
    { label: string; url: string }[]
  >([{ label: "", url: "" }]);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskDraft[]>([
    emptyTask(1),
    emptyTask(2),
    emptyTask(3),
    emptyTask(4),
    emptyTask(5),
  ]);

  const load = async () => {
    setLoading(true);
    try {
      const [res, analytics] = await Promise.all([
        apiClient.adminListVirtualInternshipPrograms(),
        apiClient.adminGetVirtualInternshipsAnalytics().catch(() => null),
      ]);
      setPrograms(res.programs || []);
      setPendingReviews(
        typeof analytics?.pending_submissions === "number"
          ? analytics.pending_submissions
          : 0,
      );
    } catch {
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    const n = Math.max(1, Number(form.duration_days) || 1);
    setTasks((prev) => {
      const next: TaskDraft[] = [];
      for (let i = 1; i <= n; i++) {
        next.push(prev.find((t) => t.day_number === i) || emptyTask(i));
      }
      return next;
    });
  }, [form.duration_days]);

  const buildPayload = (publish: boolean) => ({
    title: form.title.trim(),
    description: form.description,
    overview: form.overview || null,
    project_details: form.project_details || null,
    reference_links: referenceLinks
      .filter((l) => l.label.trim() && l.url.trim())
      .map((l) => ({ label: l.label.trim(), url: l.url.trim() })),
    technology: form.technology,
    category: form.category,
    difficulty: form.difficulty,
    duration_days: Number(form.duration_days),
    daily_commitment_hours: Number(form.daily_commitment_hours),
    enrollment_limit: Number(form.enrollment_limit) || null,
    instructor_name: form.instructor_name || null,
    skills: form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    learning_outcomes: form.learning_outcomes
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    prerequisites: form.prerequisites
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    status: publish ? "published" : form.status === "published" ? "published" : "draft",
    certificate_enabled: Boolean(form.certificate_enabled),
    certificate_min_score: Number(form.certificate_min_score) || 0,
    certificate_min_completion_pct: Number(form.certificate_min_completion_pct) || 100,
    thumbnail_url: form.thumbnail_url.trim() || null,
    starts_at:
      publish && form.start_mode === "later" && form.starts_at
        ? new Date(form.starts_at).toISOString()
        : publish && form.start_mode === "now"
          ? null
          : form.start_mode === "later" && form.starts_at
            ? new Date(form.starts_at).toISOString()
            : null,
  });

  const loadProgramIntoForm = async (programId: string) => {
    try {
      const p = await apiClient.adminGetVirtualInternshipProgram(programId);
      setEditingProgramId(p.id);
      setCreatedProgramId(p.id);
      setForm({
        title: p.title || "",
        description: p.description || "",
        overview: p.overview || "",
        project_details: p.project_details || "",
        technology: p.technology || "React",
        category: p.category || "Software",
        difficulty: p.difficulty || "intermediate",
        duration_days: p.duration_days || 5,
        daily_commitment_hours: p.daily_commitment_hours || 2,
        enrollment_limit: p.enrollment_limit || 100,
        instructor_name: p.instructor_name || "",
        skills: (p.skills || []).join(", "),
        learning_outcomes: (p.learning_outcomes || []).join("\n"),
        prerequisites: (p.prerequisites || []).join("\n"),
        status: p.status || "draft",
        certificate_enabled: p.certificate_enabled !== false,
        certificate_min_score: p.certificate_min_score ?? 0,
        certificate_min_completion_pct: p.certificate_min_completion_pct ?? 100,
        thumbnail_url: p.thumbnail_url || "",
        starts_at: p.starts_at
          ? new Date(p.starts_at).toISOString().slice(0, 16)
          : "",
        start_mode: p.starts_at && new Date(p.starts_at) > new Date() ? "later" : "now",
      });
      const links = Array.isArray(p.reference_links) && p.reference_links.length
        ? p.reference_links.map((l: { label?: string; url?: string }) => ({
            label: l.label || "",
            url: l.url || "",
          }))
        : [{ label: "", url: "" }];
      setReferenceLinks(links);
      if (Array.isArray(p.tasks) && p.tasks.length) {
        setTasks(
          p.tasks.map((t: {
            day_number: number;
            title: string;
            description?: string;
            task_type?: string;
            deadline_days?: number;
            points?: number;
          }) => ({
            day_number: t.day_number,
            title: t.title,
            description: t.description || "",
            task_type: t.task_type || "assignment",
            deadline_days: t.deadline_days ?? 2,
            points: t.points ?? 10,
            is_published: t.is_published !== false,
          })),
        );
      }
      setStep(1);
      toast.success("Program loaded for editing");
    } catch {
      toast.error("Failed to load program");
    }
  };

  const uploadIcon = async (file: File | null) => {
    if (!file) return;
    const programId = editingProgramId || createdProgramId;
    if (!programId) {
      toast.error("Save the program first, then upload the card icon");
      return;
    }
    setUploadingIcon(true);
    try {
      const updated = await apiClient.adminUploadVirtualInternshipThumbnail(
        programId,
        file,
      );
      setForm((f) => ({ ...f, thumbnail_url: updated.thumbnail_url || "" }));
      toast.success("Card icon uploaded");
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Icon upload failed");
    } finally {
      setUploadingIcon(false);
    }
  };

  const createProgram = async (publish: boolean) => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (publish && form.start_mode === "later" && !form.starts_at) {
      toast.error("Pick a start date/time for Schedule later");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(publish);
      let program: VIProgram;
      if (editingProgramId) {
        program = await apiClient.adminUpdateVirtualInternshipProgram(
          editingProgramId,
          payload,
        );
        toast.success(
          publish ? "Program updated & published" : "Program details updated",
        );
      } else {
        program = await apiClient.adminCreateVirtualInternshipProgram(payload);
        toast.success(
          publish ? "Program created & published" : "Program saved as draft",
        );
      }
      setCreatedProgramId(program.id);
      setEditingProgramId(program.id);
      setStep(2);
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Save failed");
    } finally {
      setSaving(false);
    }
  };
  const saveTasks = async () => {
    if (!createdProgramId) {
      toast.error("Create a program first");
      return;
    }
    setSaving(true);
    try {
      await apiClient.adminCreateVirtualInternshipTasksBulk(
        createdProgramId,
        tasks.map((t) => ({
          day_number: t.day_number,
          title: t.title,
          description: t.description,
          task_type: t.task_type,
          deadline_type: "days",
          deadline_days: t.deadline_days,
          points: t.points,
          is_mandatory: true,
          unlock_after_previous: true,
          late_submission_allowed: true,
          is_published: Boolean(t.is_published),
        })),
      );
      toast.success("Daily tasks saved");
      await load();
    } catch {
      toast.error("Failed to save tasks");
    } finally {
      setSaving(false);
    }
  };

  const publishExisting = async (id: string) => {
    try {
      await apiClient.adminUpdateVirtualInternshipProgram(id, { status: "published" });
      toast.success("Published");
      load();
    } catch {
      toast.error("Publish failed");
    }
  };

  const archiveExisting = async (id: string) => {
    try {
      await apiClient.adminUpdateVirtualInternshipProgram(id, { status: "archived" });
      toast.success("Archived — students can no longer attend");
      load();
    } catch {
      toast.error("Archive failed");
    }
  };

  const deleteExisting = async (id: string, title: string) => {
    const ok = window.confirm(
      `Permanently delete "${title}"?\n\nThis removes the internship, tasks, enrollments, and submissions. Students will no longer see it.`,
    );
    if (!ok) return;
    try {
      await apiClient.adminDeleteVirtualInternshipProgram(id);
      toast.success("Internship deleted");
      if (createdProgramId === id || editingProgramId === id) {
        setCreatedProgramId(null);
        setEditingProgramId(null);
        setStep(1);
      }
      load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Delete failed");
    }
  };

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === createdProgramId),
    [programs, createdProgramId],
  );

  return (
    <DashboardLayout requiredUserType="admin">
      <div className="mx-auto w-full max-w-[1400px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Virtual Internships
            </h1>
            <p className="text-sm text-gray-500">
              Create programs, daily tasks, review submissions, and track progress.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="relative rounded-xl">
              <Link href="/dashboard/admin/virtual-internships/submissions">
                <ClipboardList className="mr-2 h-4 w-4" />
                Review
                {pendingReviews > 0 ? (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold leading-none text-white">
                    {pendingReviews} left
                  </span>
                ) : (
                  <span className="ml-2 text-xs font-medium text-slate-500">
                    0 left
                  </span>
                )}
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/dashboard/admin/virtual-internships/analytics">
                <BarChart3 className="mr-2 h-4 w-4" /> Analytics
              </Link>
            </Button>
          </div>
        </header>

        {/* Existing programs */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Programs</h2>
            {!loading && programs.length > 0 && (
              <p className="text-xs text-gray-500">
                {programs.length} program{programs.length === 1 ? "" : "s"}
                {programs.length > 4 ? " · scroll to see more" : ""}
              </p>
            )}
          </div>
          {loading ? (
            <Loader />
          ) : programs.length === 0 ? (
            <p className="text-sm text-gray-500">No programs yet. Create one below.</p>
          ) : (
            <div className="max-h-[17.5rem] space-y-2 overflow-y-auto overscroll-contain pr-1">
              {programs.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
                      {p.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnail_url}
                          alt=""
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400">No icon</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-gray-500">
                        {p.technology} · {p.duration_days} days · {p.task_count} tasks ·{" "}
                        {p.enrolled_count} enrolled
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{p.status}</Badge>
                    {p.status !== "published" && (
                      <Button size="sm" onClick={() => publishExisting(p.id)}>
                        Publish
                      </Button>
                    )}
                    {p.status !== "archived" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => archiveExisting(p.id)}
                      >
                        Archive
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => void deleteExisting(p.id, p.title)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void loadProgramIntoForm(p.id)}
                    >
                      Edit program
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setCreatedProgramId(p.id);
                        setEditingProgramId(p.id);
                        setStep(2);
                        setForm((f) => ({
                          ...f,
                          duration_days: p.duration_days,
                          title: p.title,
                        }));
                      }}
                    >
                      Edit tasks
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Wizard */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge variant={step === 1 ? "default" : "secondary"}>1. Program</Badge>
            <Badge variant={step === 2 ? "default" : "secondary"}>2. Daily Tasks</Badge>
            {editingProgramId && (
              <Badge variant="outline">Editing existing program</Badge>
            )}
          </div>

          {step === 1 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Title *">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="React Full Stack Internship"
                />
              </Field>
              <Field label="Technology">
                <Input
                  value={form.technology}
                  onChange={(e) => setForm({ ...form, technology: e.target.value })}
                />
              </Field>
              <Field label="Category">
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </Field>
              <Field label="Difficulty">
                <select
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </Field>
              <Field label="Duration (days)">
                <Input
                  type="number"
                  min={1}
                  value={form.duration_days}
                  onChange={(e) =>
                    setForm({ ...form, duration_days: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Daily hours">
                <Input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={form.daily_commitment_hours}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      daily_commitment_hours: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Enrollment limit">
                <Input
                  type="number"
                  value={form.enrollment_limit}
                  onChange={(e) =>
                    setForm({ ...form, enrollment_limit: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Instructor">
                <Input
                  value={form.instructor_name}
                  onChange={(e) =>
                    setForm({ ...form, instructor_name: e.target.value })
                  }
                />
              </Field>
              <Field label="Certificate enabled">
                <select
                  className="h-10 w-full rounded-md border px-3 text-sm"
                  value={form.certificate_enabled ? "yes" : "no"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      certificate_enabled: e.target.value === "yes",
                    })
                  }
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </Field>
              <Field label="Min score for certificate">
                <Input
                  type="number"
                  min={0}
                  value={form.certificate_min_score}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      certificate_min_score: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Min completion % for certificate">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.certificate_min_completion_pct}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      certificate_min_completion_pct: Number(e.target.value),
                    })
                  }
                />
              </Field>

              <div className="md:col-span-2 space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Card icon / thumbnail
                  </p>
                  <p className="text-xs text-gray-500">
                    Shown on Explore Internship cards. Prefer a square PNG/JPG (logo or
                    cover). Avoid oversized decorative marks — image fits the card area.
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="flex h-24 w-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white dark:bg-gray-950">
                    {form.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.thumbnail_url}
                        alt="Program thumbnail"
                        className="h-full w-full object-contain p-2"
                      />
                    ) : (
                      <span className="px-2 text-center text-xs text-gray-400">
                        No icon yet
                      </span>
                    )}
                  </div>
                  <div className="min-w-[220px] flex-1 space-y-2">
                    <Input
                      placeholder="Or paste image URL"
                      value={form.thumbnail_url}
                      onChange={(e) =>
                        setForm({ ...form, thumbnail_url: e.target.value })
                      }
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                        disabled={uploadingIcon}
                        onChange={(e) =>
                          void uploadIcon(e.target.files?.[0] || null)
                        }
                      />
                      {uploadingIcon && (
                        <span className="text-xs text-gray-500">Uploading…</span>
                      )}
                    </div>
                    {!editingProgramId && !createdProgramId && (
                      <p className="text-xs text-amber-600">
                        Save program first to enable file upload (URL works on save).
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3 rounded-xl border border-amber-100 bg-amber-50/40 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Internship start schedule
                </p>
                <p className="text-xs text-gray-500">
                  Publish so students can enroll. Choose start now, or schedule a later
                  start — until then students see “Internship has not started yet.”
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={form.start_mode === "now" ? "default" : "outline"}
                    onClick={() =>
                      setForm({ ...form, start_mode: "now", starts_at: "" })
                    }
                  >
                    Start / Publish now
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={form.start_mode === "later" ? "default" : "outline"}
                    onClick={() => setForm({ ...form, start_mode: "later" })}
                  >
                    Schedule later
                  </Button>
                </div>
                {form.start_mode === "later" && (
                  <Field label="Starts at">
                    <Input
                      type="datetime-local"
                      value={form.starts_at}
                      onChange={(e) =>
                        setForm({ ...form, starts_at: e.target.value })
                      }
                    />
                  </Field>
                )}
              </div>

              <Field label="Short description" className="md:col-span-2">
                <textarea
                  className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Card summary shown on listing"
                />
              </Field>
              <Field label="Overview / Instructions (shown on student dashboard)" className="md:col-span-2">
                <textarea
                  className="min-h-[120px] w-full rounded-md border px-3 py-2 text-sm"
                  value={form.overview}
                  onChange={(e) => setForm({ ...form, overview: e.target.value })}
                  placeholder="Rules, attendance, how the internship works..."
                />
              </Field>
              <Field label="Project details" className="md:col-span-2">
                <textarea
                  className="min-h-[100px] w-full rounded-md border px-3 py-2 text-sm"
                  value={form.project_details}
                  onChange={(e) =>
                    setForm({ ...form, project_details: e.target.value })
                  }
                  placeholder="What projects students will build, deliverables, stack..."
                />
              </Field>
              <div className="md:col-span-2 space-y-2">
                <label className="mb-1 block text-sm font-medium">
                  Reference links
                </label>
                {referenceLinks.map((link, idx) => (
                  <div key={idx} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
                    <Input
                      placeholder="Label (e.g. Starter repo)"
                      value={link.label}
                      onChange={(e) => {
                        const next = [...referenceLinks];
                        next[idx] = { ...link, label: e.target.value };
                        setReferenceLinks(next);
                      }}
                    />
                    <Input
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => {
                        const next = [...referenceLinks];
                        next[idx] = { ...link, url: e.target.value };
                        setReferenceLinks(next);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setReferenceLinks((rows) =>
                          rows.length <= 1
                            ? [{ label: "", url: "" }]
                            : rows.filter((_, i) => i !== idx),
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReferenceLinks((rows) => [...rows, { label: "", url: "" }])
                  }
                >
                  <Plus className="mr-1 h-4 w-4" /> Add link
                </Button>
              </div>
              <Field label="Skills (comma-separated)" className="md:col-span-2">
                <Input
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
              </Field>
              <Field label="Learning outcomes (one per line)" className="md:col-span-2">
                <textarea
                  className="min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                  value={form.learning_outcomes}
                  onChange={(e) =>
                    setForm({ ...form, learning_outcomes: e.target.value })
                  }
                />
              </Field>
              <div className="md:col-span-2 flex flex-wrap gap-2">
                <Button disabled={saving} onClick={() => createProgram(false)}>
                  <Save className="mr-2 h-4 w-4" />{" "}
                  {editingProgramId ? "Update & Continue" : "Save Draft & Continue"}
                </Button>
                <Button disabled={saving} onClick={() => createProgram(true)}>
                  <Rocket className="mr-2 h-4 w-4" />{" "}
                  {editingProgramId ? "Update & Publish" : "Publish & Continue"}
                </Button>
                {editingProgramId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingProgramId(null);
                      setCreatedProgramId(null);
                      setForm({
                        title: "",
                        description: "",
                        overview: "",
                        project_details: "",
                        technology: "React",
                        category: "Software",
                        difficulty: "intermediate",
                        duration_days: 5,
                        daily_commitment_hours: 2,
                        enrollment_limit: 100,
                        instructor_name: "",
                        skills: "React, Node.js, PostgreSQL",
                        learning_outcomes:
                          "Build real APIs\nShip a mini project\nPractice daily delivery",
                        prerequisites: "Basic JavaScript",
                        status: "draft",
                        certificate_enabled: true,
                        certificate_min_score: 0,
                        certificate_min_completion_pct: 100,
                        thumbnail_url: "",
                        starts_at: "",
                        start_mode: "now",
                      });
                      setReferenceLinks([{ label: "", url: "" }]);
                    }}
                  >
                    New program
                  </Button>
                )}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Program:{" "}
                    <strong className="text-slate-900 dark:text-white">
                      {selectedProgram?.title || form.title || createdProgramId}
                    </strong>
                  </p>
                  <p className="mt-1 max-w-3xl text-xs text-slate-500">
                    For each day, choose <strong>Publish now</strong> or{" "}
                    <strong>Schedule later</strong>. Unpublished days show students
                    “Task is not published yet.”
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() =>
                      setTasks((rows) =>
                        rows.map((t) => ({ ...t, is_published: true })),
                      )
                    }
                  >
                    Publish all days
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    onClick={() =>
                      setTasks((rows) =>
                        rows.map((t) => ({ ...t, is_published: false })),
                      )
                    }
                  >
                    Schedule all later
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {tasks.map((t, idx) => (
                  <div
                    key={t.day_number}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 dark:border-slate-700 dark:bg-slate-950/30"
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl bg-indigo-600 px-3 text-sm font-bold text-white">
                          Day {t.day_number}
                        </span>
                        <Badge
                          className={
                            t.is_published
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                              : "bg-amber-100 text-amber-900 hover:bg-amber-100"
                          }
                        >
                          {t.is_published ? "Published" : "Not published"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className={
                            t.is_published
                              ? "rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                              : "rounded-lg"
                          }
                          variant={t.is_published ? "default" : "outline"}
                          onClick={() => {
                            const next = [...tasks];
                            next[idx] = { ...t, is_published: true };
                            setTasks(next);
                          }}
                        >
                          Publish now
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className={
                            !t.is_published
                              ? "rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                              : "rounded-lg"
                          }
                          variant={!t.is_published ? "default" : "outline"}
                          onClick={() => {
                            const next = [...tasks];
                            next[idx] = { ...t, is_published: false };
                            setTasks(next);
                          }}
                        >
                          Schedule later
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-12">
                      <div className="space-y-1.5 lg:col-span-5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Task title
                        </label>
                        <Input
                          className="w-full bg-white dark:bg-slate-900"
                          value={t.title}
                          onChange={(e) => {
                            const next = [...tasks];
                            next[idx] = { ...t, title: e.target.value };
                            setTasks(next);
                          }}
                          placeholder="e.g. Intro to Docker"
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-3">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Type
                        </label>
                        <select
                          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-900"
                          value={t.task_type}
                          onChange={(e) => {
                            const next = [...tasks];
                            next[idx] = { ...t, task_type: e.target.value };
                            setTasks(next);
                          }}
                        >
                          {[
                            "assignment",
                            "coding",
                            "quiz",
                            "documentation",
                            "mini_project",
                            "github",
                            "file_upload",
                          ].map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5 lg:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Deadline (days)
                        </label>
                        <Input
                          type="number"
                          min={0}
                          className="w-full bg-white dark:bg-slate-900"
                          value={t.deadline_days}
                          onChange={(e) => {
                            const next = [...tasks];
                            next[idx] = {
                              ...t,
                              deadline_days: Number(e.target.value),
                            };
                            setTasks(next);
                          }}
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Points
                        </label>
                        <Input
                          type="number"
                          min={0}
                          className="w-full bg-white dark:bg-slate-900"
                          value={t.points}
                          onChange={(e) => {
                            const next = [...tasks];
                            next[idx] = { ...t, points: Number(e.target.value) };
                            setTasks(next);
                          }}
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-12">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Description / objective
                        </label>
                        <textarea
                          className="min-h-[88px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                          value={t.description}
                          onChange={(e) => {
                            const next = [...tasks];
                            next[idx] = { ...t, description: e.target.value };
                            setTasks(next);
                          }}
                          placeholder="What the student should complete on this day"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Button variant="outline" className="rounded-xl" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="rounded-xl"
                  disabled={saving || !createdProgramId}
                  onClick={saveTasks}
                >
                  <Plus className="mr-2 h-4 w-4" /> Save Daily Tasks
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
