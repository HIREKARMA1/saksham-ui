"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ResumeEditorChat from "@/components/resume-editor/ResumeEditorChat";
import { apiClient } from "@/lib/api";
import type {
  GetResumeEditorSessionResponse,
  ResumeEditorMessage,
  ResumeEditorVersionSummary,
  ResumeJSON,
  StartResumeEditorResponse,
} from "@/types/resumeEditor";
import { ArrowLeft, AlertCircle, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

export default function ResumeEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionFromQuery = searchParams.get("session");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(sessionFromQuery);
  const [messages, setMessages] = useState<ResumeEditorMessage[]>([]);
  const [resumeJson, setResumeJson] = useState<ResumeJSON | null>(null);
  const [version, setVersion] = useState<ResumeEditorVersionSummary | null>(null);
  const [questions, setQuestions] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(null);
      try {
        if (sessionFromQuery) {
          const data = (await apiClient.getResumeEditorSession(
            sessionFromQuery,
          )) as GetResumeEditorSessionResponse;
          if (cancelled) return;
          setSessionId(data.session.id);
          setMessages(data.messages || []);
          setResumeJson(data.resume_json || null);
          setVersion(data.session.current_version || null);
          setQuestions(data.session.pending_pivot?.questions || null);
        } else {
          const data = (await apiClient.startResumeEditorSession()) as StartResumeEditorResponse;
          if (cancelled) return;
          setSessionId(data.session.id);
          setResumeJson(data.resume_json || null);
          setVersion(data.session.current_version || null);
          const welcome: ResumeEditorMessage[] = data.assistant_message
            ? [
                {
                  id: "welcome",
                  role: "assistant",
                  content: data.assistant_message,
                  created_at: new Date().toISOString(),
                },
              ]
            : [];
          setMessages(welcome);
          router.replace(
            `/dashboard/student/resume/editor?session=${data.session.id}`,
          );
          toast.success("Resume editor ready");
        }
      } catch (err: any) {
        const detail =
          err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Could not open the resume editor. Upload a resume first.";
        if (!cancelled) {
          setError(typeof detail === "string" ? detail : "Failed to start editor");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // intentionally only on mount / session query change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionFromQuery]);

  return (
    <DashboardLayout requiredUserType="student">
      <div className="space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#0068FC]" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Conversational Resume Editor
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Chat to edit your resume, pivot roles, and download PDF or DOCX
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-1.5 self-start"
            onClick={() => router.push("/dashboard/student/resume")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ATS results
          </Button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader />
            <p className="text-sm text-gray-500">
              {sessionFromQuery
                ? "Loading your editor session…"
                : "Reading your resume and preparing the chat (this can take a moment)…"}
            </p>
          </div>
        )}

        {!loading && error && (
          <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700 dark:text-red-300 space-y-3">
              <p>{error}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => router.push("/dashboard/student/resume")}
                  className="bg-[#0068FC] hover:bg-blue-700 text-white"
                >
                  Go to Resume / ATS
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    router.replace("/dashboard/student/resume/editor");
                    window.location.reload();
                  }}
                >
                  Try again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!loading && !error && sessionId && (
          <ResumeEditorChat
            sessionId={sessionId}
            initialMessages={messages}
            initialResumeJson={resumeJson}
            initialVersion={version}
            initialQuestions={questions}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
