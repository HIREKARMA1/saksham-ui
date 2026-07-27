"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Download,
  FileText,
  Sparkles,
  User,
  Loader2,
  History,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api";
import type {
  ChatTurnResponse,
  ResumeEditorMessage,
  ResumeEditorVersionSummary,
  ResumeJSON,
} from "@/types/resumeEditor";

interface ResumeEditorChatProps {
  sessionId: string;
  initialMessages: ResumeEditorMessage[];
  initialResumeJson?: ResumeJSON | null;
  initialVersion?: ResumeEditorVersionSummary | null;
  initialQuestions?: string[] | null;
}

function formatTime(ts?: string | null) {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function ResumeEditorChat({
  sessionId,
  initialMessages,
  initialResumeJson,
  initialVersion,
  initialQuestions,
}: ResumeEditorChatProps) {
  const [messages, setMessages] = useState<ResumeEditorMessage[]>(initialMessages);
  const [resumeJson, setResumeJson] = useState<ResumeJSON | null>(initialResumeJson || null);
  const [currentVersion, setCurrentVersion] = useState<ResumeEditorVersionSummary | null>(
    initialVersion || null,
  );
  const [versions, setVersions] = useState<ResumeEditorVersionSummary[]>(
    initialVersion ? [initialVersion] : [],
  );
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>(
    initialQuestions || [],
  );
  const [pivotAnswers, setPivotAnswers] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, clarifyingQuestions]);

  useEffect(() => {
    apiClient
      .listResumeEditorVersions(sessionId)
      .then((data) => setVersions(data.versions || []))
      .catch(() => undefined);
  }, [sessionId, currentVersion?.version]);

  const appendLocal = (role: "user" | "assistant", content: string, meta?: ResumeEditorMessage["meta"]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}-${role}`,
        role,
        content,
        meta,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const applyTurn = (turn: ChatTurnResponse) => {
    appendLocal("assistant", turn.assistant_message, {
      action: turn.action,
      edit_class: turn.edit_class || undefined,
      clarifying_questions: turn.clarifying_questions || undefined,
      diff: turn.diff || undefined,
      version: turn.version?.version,
    });
    if (turn.clarifying_questions?.length) {
      setClarifyingQuestions(turn.clarifying_questions);
      setPivotAnswers({});
    } else {
      setClarifyingQuestions([]);
    }
    if (turn.resume_json) setResumeJson(turn.resume_json);
    if (turn.version) {
      setCurrentVersion(turn.version);
      toast.success(`Saved as version ${turn.version.version}`);
    }
  };

  const sendMessage = async (message: string, answers?: Record<string, string> | null) => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;
    setSending(true);
    appendLocal("user", trimmed);
    setInput("");
    try {
      const turn = (await apiClient.sendResumeEditorMessage(sessionId, {
        message: trimmed,
        pivot_answers: answers || null,
      })) as ChatTurnResponse;
      applyTurn(turn);
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Could not send message. Please try again.";
      toast.error(typeof detail === "string" ? detail : "Request failed");
      appendLocal(
        "assistant",
        typeof detail === "string"
          ? detail
          : "Something went wrong while editing your resume.",
      );
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => sendMessage(input);

  const handlePivotSubmit = () => {
    const missing = clarifyingQuestions.filter((q) => !(pivotAnswers[q] || "").trim());
    if (missing.length) {
      toast.error("Please answer all clarifying questions");
      return;
    }
    const answers: Record<string, string> = {};
    clarifyingQuestions.forEach((q, i) => {
      answers[`q${i + 1}`] = pivotAnswers[q];
    });
    const summary = clarifyingQuestions
      .map((q, i) => `${i + 1}. ${q}\n→ ${pivotAnswers[q]}`)
      .join("\n\n");
    sendMessage(summary, answers);
  };

  const handleDownload = async (format: "pdf" | "docx") => {
    if (!currentVersion) {
      toast.error("No version available to download yet");
      return;
    }
    setDownloading(format);
    try {
      const { blob, filename } = await apiClient.downloadResumeEditorVersion(
        sessionId,
        currentVersion.version,
        format,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${filename}`);
    } catch {
      toast.error(`Failed to download ${format.toUpperCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  const handleRevert = async (version: number) => {
    if (sending) return;
    setSending(true);
    try {
      const data = await apiClient.revertResumeEditorVersion(sessionId, version);
      if (data.resume_json) setResumeJson(data.resume_json);
      if (data.version) {
        setCurrentVersion(data.version);
        toast.success(`Reverted to v${version} (saved as v${data.version.version})`);
      }
      appendLocal(
        "assistant",
        `Reverted to version ${version}${data.version ? ` (now v${data.version.version})` : ""}.`,
      );
      const listed = await apiClient.listResumeEditorVersions(sessionId);
      setVersions(listed.versions || []);
    } catch {
      toast.error("Could not revert version");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4 lg:gap-6 min-h-[calc(100vh-10rem)]">
      {/* Chat column */}
      <div className="flex flex-col min-h-[560px] overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 px-4 py-3 sm:px-5 bg-[#E8EFFF] dark:bg-gray-900/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0068FC] text-white shadow-md">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Resume AI Coach
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Ask for resume edits, career advice, interview prep, or a role pivot
              </p>
            </div>
            {currentVersion && (
              <Badge className="bg-white text-[#0068FC] border border-blue-200 font-semibold">
                v{currentVersion.version}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 space-y-4 bg-slate-50/60 dark:bg-gray-950/40">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0068FC] text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[min(100%,560px)] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      isUser
                        ? "bg-[#0068FC] text-white rounded-br-md"
                        : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200/80 dark:border-gray-700 rounded-bl-md"
                    }`}
                  >
                    {m.content}
                    <div
                      className={`mt-1 text-[10px] ${
                        isUser ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {formatTime(m.created_at)}
                      {m.meta?.version ? ` · saved v${m.meta.version}` : ""}
                    </div>
                  </div>
                  {isUser && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {sending && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-[#0068FC]" />
              Thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        {clarifyingQuestions.length > 0 && (
          <div className="border-t border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 space-y-3">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              Answer these to complete your role pivot
            </p>
            {clarifyingQuestions.map((q) => (
              <div key={q} className="space-y-1">
                <label className="text-xs font-medium text-gray-700 dark:text-gray-300">{q}</label>
                <Textarea
                  value={pivotAnswers[q] || ""}
                  onChange={(e) =>
                    setPivotAnswers((prev) => ({ ...prev, [q]: e.target.value }))
                  }
                  rows={2}
                  className="text-sm bg-white dark:bg-gray-900"
                  placeholder="Your answer…"
                />
              </div>
            ))}
            <Button
              onClick={handlePivotSubmit}
              disabled={sending}
              className="bg-[#0068FC] hover:bg-blue-700 text-white"
            >
              Apply pivot with my answers
            </Button>
          </div>
        )}

        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 bg-white dark:bg-gray-900">
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="e.g. Make my summary shorter, or change this to a software developer resume…"
              rows={2}
              disabled={sending}
              className="min-h-[44px] resize-none text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="h-11 px-4 bg-[#0068FC] hover:bg-blue-700 text-white shrink-0"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="space-y-4 xl:overflow-y-auto xl:max-h-[calc(100vh-10rem)]">
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0068FC]" />
              Current resume
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {resumeJson?.name || "—"}
              </p>
              <p className="text-xs text-[#0068FC]">
                {resumeJson?.target_role || "Target role not set"}
              </p>
            </div>
            {resumeJson?.summary && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-4">
                {resumeJson.summary}
              </p>
            )}
            {!!resumeJson?.skills?.length && (
              <div className="flex flex-wrap gap-1">
                {resumeJson.skills.slice(0, 12).map((s) => (
                  <Badge
                    key={s}
                    variant="outline"
                    className="text-[10px] font-normal border-blue-200 text-blue-700"
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs gap-1"
                disabled={!currentVersion || !!downloading}
                onClick={() => handleDownload("pdf")}
              >
                {downloading === "pdf" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                PDF
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs gap-1"
                disabled={!currentVersion || !!downloading}
                onClick={() => handleDownload("docx")}
              >
                {downloading === "docx" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                DOCX
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-[#0068FC]" />
              Version history
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {versions.length === 0 && (
              <p className="text-xs text-gray-500">No versions yet</p>
            )}
            {[...versions].reverse().map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 dark:border-gray-800 px-2.5 py-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">
                    v{v.version}
                    {v.is_current ? (
                      <span className="ml-1.5 text-[10px] text-emerald-600">current</span>
                    ) : null}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {v.change_summary || v.target_role || "Resume snapshot"}
                  </p>
                </div>
                {!v.is_current && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[10px] gap-1"
                    onClick={() => handleRevert(v.version)}
                    disabled={sending}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Revert
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
