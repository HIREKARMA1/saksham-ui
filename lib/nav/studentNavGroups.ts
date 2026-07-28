/**
 * Solviq V2 — Grouped student navigation (single source of truth).
 * Advanced items can be flagged for progressive disclosure later.
 */

import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  FileText,
  Sparkles,
  Briefcase,
  Target,
  BookOpen,
  Workflow,
  Layers,
  Mic,
  BarChart3,
  CreditCard,
  User,
  GraduationCap,
} from "lucide-react";

export type StudentNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Hide from default nav until feature is unlocked / user expands Advanced */
  advanced?: boolean;
};

export type StudentNavGroup = {
  id: string;
  label: string;
  items: StudentNavItem[];
};

const base = "/dashboard/student";

export const studentNavGroups: StudentNavGroup[] = [
  {
    id: "home",
    label: "Home",
    items: [
      { id: "dashboard", label: "Career Home", href: base, icon: LayoutGrid },
    ],
  },
  {
    id: "career",
    label: "Career",
    items: [
      { id: "resume", label: "Resume", href: `${base}/resume`, icon: FileText },
      {
        id: "career-guidance",
        label: "Career Guidance",
        href: `${base}/career-guidance`,
        icon: Sparkles,
      },
      {
        id: "jobs",
        label: "Jobs",
        href: `${base}/market-jobs`,
        icon: Briefcase,
        advanced: true,
      },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    items: [
      {
        id: "mock-tests",
        label: "Mock Tests",
        href: `${base}/mock-tests`,
        icon: Target,
      },
      {
        id: "practice",
        label: "Skill Practice",
        href: `${base}/practice`,
        icon: BookOpen,
      },
    ],
  },
  {
    id: "simulation",
    label: "Simulation",
    items: [
      {
        id: "simulations",
        label: "Job Simulations",
        href: `${base}/simulations`,
        icon: Workflow,
      },
      {
        id: "placement-drives",
        label: "Drive Day",
        href: `${base}/placement-drives`,
        icon: Layers,
      },
      {
        id: "mock-interview",
        label: "AI Interview",
        href: `${base}/mock-interview`,
        icon: Mic,
      },
      {
        id: "virtual-internships",
        label: "Virtual Internships",
        href: `${base}/virtual-internships`,
        icon: GraduationCap,
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    items: [
      {
        id: "analytics",
        label: "Analytics",
        href: `${base}/analytics`,
        icon: BarChart3,
      },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { id: "profile", label: "Profile", href: `${base}/profile`, icon: User },
      { id: "plans", label: "Plans", href: `${base}/plans`, icon: CreditCard },
    ],
  },
];

/** Flat list for mobile / legacy consumers */
export function flattenStudentNav(includeAdvanced = true): StudentNavItem[] {
  return studentNavGroups.flatMap((g) =>
    g.items.filter((i) => includeAdvanced || !i.advanced),
  );
}

export function getActiveStudentNavId(pathname: string | null): string | null {
  if (!pathname) return null;
  const items = flattenStudentNav(true);
  // Prefer longest href match
  const sorted = [...items].sort((a, b) => b.href.length - a.href.length);
  for (const item of sorted) {
    if (item.id === "dashboard") {
      if (pathname === item.href) return item.id;
      continue;
    }
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      return item.id;
    }
  }
  return null;
}
