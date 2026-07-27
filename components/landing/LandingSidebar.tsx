"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Briefcase,
  LayoutGrid,
  Users,
  BarChart3,
  User,
  Building2,
  BookOpen,
  Workflow,
  Layers,
  Target,
  CreditCard,
  Send,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getDashboardFeatureRoute } from "@/lib/dashboardNavigation";
import {
  studentNavGroups,
  getActiveStudentNavId,
  type StudentNavItem,
} from "@/lib/nav/studentNavGroups";

export interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface LandingSidebarProps {
  className?: string;
  isCollapsed: boolean;
  activeFeature?: string | null;
  onFeatureChange?: (featureId: string | null) => void;
}

/** Legacy flat list (backward compat) */
export const studentSidebarFeatures: SidebarItem[] = studentNavGroups
  .flatMap((g) => g.items)
  .filter((i) => !i.advanced)
  .map((i) => ({
    id: i.id,
    icon: <i.icon className="w-5 h-5" />,
    label: i.label,
    onClick: undefined,
  }));

export const collegeSidebarFeatures: SidebarItem[] = [
  { id: "dashboard", icon: <LayoutGrid className="w-5 h-5" />, label: "Dashboard" },
  { id: "intelligence", icon: <Target className="w-5 h-5" />, label: "Intelligence" },
  { id: "students", icon: <Users className="w-5 h-5" />, label: "Students" },
  { id: "analytics", icon: <BarChart3 className="w-5 h-5" />, label: "Analytics" },
  { id: "placement-hub", icon: <Layers className="w-5 h-5" />, label: "Placement Hub" },
  { id: "profile", icon: <User className="w-5 h-5" />, label: "Profile" },
];

export const enterpriseSidebarFeatures: SidebarItem[] = [
  { id: "dashboard", icon: <LayoutGrid className="w-5 h-5" />, label: "Hiring Hub" },
  { id: "campaigns", icon: <Send className="w-5 h-5" />, label: "Campaigns" },
];

export const adminSidebarFeatures: SidebarItem[] = [
  { id: "dashboard", icon: <LayoutGrid className="w-5 h-5" />, label: "Dashboard" },
  { id: "colleges", icon: <Building2 className="w-5 h-5" />, label: "Colleges" },
  { id: "enterprises", icon: <Briefcase className="w-5 h-5" />, label: "Enterprise" },
  { id: "coupons", icon: <CreditCard className="w-5 h-5" />, label: "Coupons" },
  { id: "students", icon: <Users className="w-5 h-5" />, label: "Students" },
  { id: "analytics", icon: <BarChart3 className="w-5 h-5" />, label: "Analytics" },
  { id: "disha", icon: <FileText className="w-5 h-5" />, label: "Disha Assessments" },
  { id: "question-bank", icon: <BookOpen className="w-5 h-5" />, label: "Question Bank" },
  { id: "mock-tests-admin", icon: <Target className="w-5 h-5" />, label: "Mock Tests" },
  { id: "placement-drives-admin", icon: <Layers className="w-5 h-5" />, label: "Placement Drives" },
  { id: "simulation-pipelines-admin", icon: <Workflow className="w-5 h-5" />, label: "Simulations" },
  { id: "profile", icon: <User className="w-5 h-5" />, label: "Profile" },
];

export const sidebarFeatures = studentSidebarFeatures;

export function LandingSidebar({
  className,
  isCollapsed,
  activeFeature,
  onFeatureChange,
}: LandingSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isStudent = !user || user.user_type === "student";
  const isDashboardContext = Boolean(pathname?.startsWith("/dashboard"));

  const getSidebarFeatures = (): SidebarItem[] => {
    if (!user) return studentSidebarFeatures;
    switch (user.user_type) {
      case "college":
        return collegeSidebarFeatures;
      case "enterprise":
        return enterpriseSidebarFeatures;
      case "admin":
        return adminSidebarFeatures;
      default:
        return studentSidebarFeatures;
    }
  };

  const getFeatureRoute = (featureId: string): string | null => {
    if (!user) return null;
    return getDashboardFeatureRoute(user.user_type, featureId);
  };

  const navigateFeature = (featureId: string, href?: string) => {
    if (user) {
      const route = href || getFeatureRoute(featureId);
      if (route) {
        router.push(route);
        return;
      }
    }
    if (isDashboardContext) return;
    if (featureId === "dashboard") {
      router.push("/auth/login");
      return;
    }
    onFeatureChange?.(featureId);
  };

  const activeStudentId = getActiveStudentNavId(pathname ?? null);

  const renderFlatFeatures = () => {
    const features = getSidebarFeatures().map((item) => ({
      ...item,
      onClick: () => navigateFeature(item.id),
    }));

    return (
      <nav className="space-y-1">
        {features.map((item) => {
          let isActive = false;
          if (isDashboardContext) {
            const route = getFeatureRoute(item.id);
            if (route) {
              isActive =
                pathname === route ||
                (pathname?.startsWith(route + "/") ?? false);
              if (item.id === "dashboard") {
                isActive =
                  pathname === route ||
                  pathname === `/dashboard/${user?.user_type}`;
              }
            }
          } else {
            isActive = activeFeature === item.id;
          }
          return (
            <SidebarButton
              key={item.id}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive}
            />
          );
        })}
      </nav>
    );
  };

  const renderStudentGroups = () => {
    const activeId = isDashboardContext ? activeStudentId : activeFeature;

    return (
      <div className="space-y-6">
        {studentNavGroups.map((group) => {
          const visible = group.items.filter((i) => !i.advanced || showAdvanced);
          if (visible.length === 0) return null;
          return (
            <div key={group.id}>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-3 mb-2 text-[10px] font-semibold text-[var(--sq-muted)] uppercase tracking-wider"
                  >
                    {group.label}
                  </motion.h3>
                )}
              </AnimatePresence>
              <nav className="space-y-0.5">
                {visible.map((item) => (
                  <StudentNavButton
                    key={item.id}
                    item={item}
                    isCollapsed={isCollapsed}
                    isActive={activeId === item.id}
                    onClick={() => navigateFeature(item.id, item.href)}
                  />
                ))}
              </nav>
            </div>
          );
        })}
        {!isCollapsed && (
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="mx-3 flex w-[calc(100%-1.5rem)] items-center justify-between rounded-lg px-2 py-2 text-xs font-medium text-[var(--sq-muted)] hover:bg-[var(--sq-accent-soft)] hover:text-[var(--sq-accent)]"
          >
            {showAdvanced ? "Hide advanced" : "Show advanced"}
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform",
                showAdvanced && "rotate-180",
              )}
            />
          </button>
        )}
      </div>
    );
  };

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-20 z-30 overflow-hidden",
        "h-[calc(100vh-5rem)]",
        "bg-[var(--sq-surface)]/95 backdrop-blur-lg",
        "border-r border-[var(--sq-border)]",
        "shadow-sm",
        "hidden lg:block",
        className,
      )}
    >
      <div className="flex flex-col h-full relative z-10">
        <div className="flex-1 overflow-y-auto py-5 px-2">
          {isStudent ? renderStudentGroups() : renderFlatFeatures()}
        </div>
      </div>
    </motion.aside>
  );
}

interface SidebarButtonProps {
  item: SidebarItem;
  isCollapsed: boolean;
  isActive?: boolean;
}

function SidebarButton({ item, isCollapsed, isActive }: SidebarButtonProps) {
  return (
    <button type="button" onClick={item.onClick} className="w-full text-left">
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          "text-[var(--sq-ink)]/80",
          "hover:bg-[var(--sq-accent-soft)] hover:text-[var(--sq-accent)]",
          "cursor-pointer group",
          isCollapsed && "justify-center",
          isActive &&
            "bg-[var(--sq-accent-soft)] text-[var(--sq-accent)] border-l-2 border-[var(--sq-accent)]",
        )}
      >
        <div className="flex-shrink-0">{item.icon}</div>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="truncate font-medium text-sm"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}

function StudentNavButton({
  item,
  isCollapsed,
  isActive,
  onClick,
}: {
  item: StudentNavItem;
  isCollapsed: boolean;
  isActive?: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button type="button" onClick={onClick} className="w-full text-left">
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          "text-[var(--sq-ink)]/80",
          "hover:bg-[var(--sq-accent-soft)] hover:text-[var(--sq-accent)]",
          "cursor-pointer group",
          isCollapsed && "justify-center",
          isActive &&
            "bg-[var(--sq-accent-soft)] text-[var(--sq-accent)] font-medium border-l-2 border-[var(--sq-accent)]",
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="truncate text-sm"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}
