"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { apiClient } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

type Analytics = {
  active_programs: number;
  total_programs: number;
  active_students: number;
  total_enrollments: number;
  completion_rate: number;
  submission_rate: number;
  average_score: number;
  pending_submissions: number;
  late_submission_pct: number;
};

export default function AdminVirtualInternshipAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const res = await apiClient.adminGetVirtualInternshipsAnalytics();
        setData(res);
      } catch {
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = data
    ? [
        { label: "Active Internships", value: data.active_programs },
        { label: "Total Programs", value: data.total_programs },
        { label: "Active Students", value: data.active_students },
        { label: "Total Enrollments", value: data.total_enrollments },
        { label: "Completion Rate", value: `${data.completion_rate}%` },
        { label: "Submission Rate", value: `${data.submission_rate}%` },
        { label: "Average Score", value: data.average_score },
        { label: "Pending Submissions", value: data.pending_submissions },
        { label: "Late Submission %", value: `${data.late_submission_pct}%` },
      ]
    : [];

  return (
    <DashboardLayout requiredUserType="admin">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div>
          <Button asChild variant="ghost" className="mb-2 px-0">
            <Link href="/dashboard/admin/virtual-internships">
              <ArrowLeft className="mr-2 h-4 w-4" /> Programs
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Virtual Internship Analytics</h1>
          <p className="text-sm text-gray-500">POC overview cards</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {c.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                  {c.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
