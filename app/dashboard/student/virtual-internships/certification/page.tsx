"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import type { VICertificateItem } from "@/types/virtualInternships";
import { ArrowLeft, Award, Download } from "lucide-react";
import toast from "react-hot-toast";

export default function VirtualInternshipCertificationPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<VICertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuingId, setIssuingId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await apiClient.listMyVirtualInternshipCertificates();
        setCertificates(res.certificates || []);
      } catch {
        toast.error("Failed to load certificates");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grabCertificate = async (enrollmentId: string) => {
    setIssuingId(enrollmentId);
    try {
      const cert = await apiClient.issueVirtualInternshipCertificate(enrollmentId);
      setCertificates((prev) =>
        prev.map((c) =>
          c.enrollment_id === enrollmentId
            ? {
                ...c,
                issued: true,
                eligible: true,
                certificate_url: cert.certificate_url,
                issued_at: cert.issued_at,
                student_name: cert.student_name,
                internship_title: cert.internship_title,
                designation: cert.designation,
              }
            : c,
        ),
      );
      if (cert.certificate_url) {
        window.open(cert.certificate_url, "_blank", "noopener,noreferrer");
      }
      toast.success("Certificate ready");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Could not issue certificate");
    } finally {
      setIssuingId(null);
    }
  };

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="mx-auto max-w-6xl space-y-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/student/virtual-internships")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Internships
          </Button>

          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Virtual AI Internships
            </p>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white md:text-3xl">
              <Award className="h-7 w-7 text-indigo-600" />
              My Certification
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Download certificates for internships you have completed. Your name and
              designation are filled from your profile and the internship title.
            </p>
          </header>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader />
              </div>
            ) : certificates.length === 0 ? (
              <div className="space-y-4 px-5 py-12 text-center">
                <p className="text-sm text-slate-500">
                  No certificates yet. Complete an eligible internship to unlock one
                  here.
                </p>
                <Button
                  className="rounded-xl"
                  onClick={() =>
                    router.push("/dashboard/student/virtual-internships#explore")
                  }
                >
                  Explore Internships
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/50">
                    <tr>
                      <th className="px-5 py-3 font-medium">Course Name</th>
                      <th className="px-5 py-3 font-medium">Designation</th>
                      <th className="px-5 py-3 font-medium">Completion</th>
                      <th className="px-5 py-3 font-medium">Score</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                      <th className="px-5 py-3 font-medium text-right"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => {
                      const pct = Math.round(cert.student_completion_pct || 0);
                      const statusLabel = cert.issued
                        ? "issued"
                        : cert.eligible
                          ? "eligible"
                          : "in progress";
                      return (
                        <tr
                          key={cert.enrollment_id}
                          className="border-t border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                            {cert.student_name || "You"}
                          </td>
                          <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                            {cert.designation ||
                              cert.internship_title ||
                              "Virtual Internship"}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex min-w-[120px] items-center gap-2">
                              <span className="w-10 text-xs font-medium text-slate-600 dark:text-slate-300">
                                {pct}%
                              </span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                  className="h-full rounded-full bg-teal-500"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, pct))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-700 dark:text-slate-200">
                            {cert.student_score}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                cert.issued
                                  ? "bg-emerald-100 text-emerald-700"
                                  : cert.eligible
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {cert.issued && cert.certificate_url ? (
                                <button
                                  type="button"
                                  title="Download certificate"
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                                  onClick={() =>
                                    window.open(
                                      cert.certificate_url!,
                                      "_blank",
                                      "noopener,noreferrer",
                                    )
                                  }
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              ) : (
                                <Button
                                  size="sm"
                                  className="rounded-lg"
                                  disabled={
                                    !cert.eligible ||
                                    issuingId === cert.enrollment_id
                                  }
                                  onClick={() =>
                                    void grabCertificate(cert.enrollment_id)
                                  }
                                >
                                  {issuingId === cert.enrollment_id
                                    ? "…"
                                    : "Get"}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/student/virtual-internships/runs/${cert.enrollment_id}`,
                                  )
                                }
                              >
                                Open run
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
