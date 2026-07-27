"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { StudentBrandPageShell } from "@/components/dashboard/StudentBrandPageShell";
import { apiClient } from "@/lib/api";

export default function PassportPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await apiClient.getCareerPassport();
        setItems(res.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout requiredUserType="student">
      <StudentBrandPageShell contentClassName="pb-16">
        <div className="sq-page mx-auto max-w-3xl space-y-8">
          <header className="space-y-2">
            <p className="sq-label text-[var(--sq-accent)]">Career Passport</p>
            <h1 className="sq-display text-[var(--sq-ink)]">Verified proof</h1>
            <p className="sq-body text-[var(--sq-muted)]">
              Certificates and achievements minted only from real Career Graph evidence.
            </p>
          </header>
          {loading ? (
            <div className="h-32 animate-pulse rounded-[var(--sq-radius-lg)] bg-[var(--sq-surface-2)]" />
          ) : items.length === 0 ? (
            <p className="text-sm text-[var(--sq-muted)]">
              No passport items yet. Complete an internship or Drive Day to mint your first certificate.
            </p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-[var(--sq-radius-lg)] border border-[var(--sq-border)] bg-[var(--sq-surface)] p-5"
                >
                  <p className="text-xs uppercase tracking-wide text-[var(--sq-muted)]">{item.item_type}</p>
                  <h2 className="mt-1 font-semibold text-[var(--sq-ink)]">{item.title}</h2>
                  {item.description && (
                    <p className="mt-1 text-sm text-[var(--sq-muted)]">{item.description}</p>
                  )}
                  <p className="mt-3 text-xs text-[var(--sq-muted)]">
                    Verify: {item.verify_url}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </StudentBrandPageShell>
    </DashboardLayout>
  );
}
