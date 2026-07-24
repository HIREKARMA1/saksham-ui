'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { Loader2, MessageSquare, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

type DiffItem = {
  suggestion_id: string;
  kind: 'reframe' | 'suggested_addition';
  section: string;
  before?: string | null;
  after: string;
  confirmed?: boolean;
  reasoning?: { summary?: string };
};

type Props = {
  activeResumeVersionId?: string | null;
  onLocked?: (payload: { target_role: string; sidebar?: unknown }) => void;
};

/**
 * Conversational resume re-target (PRD §4) — thin UI over Resume Agent APIs.
 */
export function ResumeRetargetChat({ activeResumeVersionId, onLocked }: Props) {
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [clarifying, setClarifying] = useState<string[]>([]);
  const [diffs, setDiffs] = useState<DiffItem[]>([]);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [agentMessage, setAgentMessage] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<string[]>([]);

  const send = async () => {
    if (!message.trim()) return;
    setLoading(true);
    try {
      const res = await apiClient.retargetResume({
        message: message.trim(),
        target_role: targetRole.trim() || undefined,
        accepted_suggestion_ids: accepted,
      });
      const resume = res.resume || {};
      setAgentMessage(resume.message || null);
      setClarifying(resume.clarifying_questions || []);
      setDiffs(resume.diff || []);
      setAtsScore(typeof resume.ats_score === 'number' ? resume.ats_score : null);
      if (resume.action === 'clarifying') {
        toast('Answer the clarifying question to continue');
      }
      setMessage('');
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Re-target failed — upload/lock a resume first');
    } finally {
      setLoading(false);
    }
  };

  const lockVersion = async () => {
    if (!activeResumeVersionId) {
      toast.error('No active resume version to lock');
      return;
    }
    if (!targetRole.trim()) {
      toast.error('Set a target role before locking');
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient.lockResumeVersion({
        resume_version_id: activeResumeVersionId,
        target_role: targetRole.trim(),
      });
      toast.success('Resume locked — sidebar rebuilt for this role');
      onLocked?.({ target_role: targetRole.trim(), sidebar: res.sidebar });
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || 'Could not lock resume version');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccept = (id: string) => {
    setAccepted((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-brand-blue" />
        <h3 className="font-semibold text-slate-900 dark:text-white">Re-target this resume</h3>
        <Badge variant="outline" className="ml-auto text-[10px]">
          Resume Agent
        </Badge>
      </div>
      <p className="mb-4 text-sm text-slate-500">
        Chat to reframe for a role (≤2 clarifying questions). Suggested additions stay unconfirmed until you accept.
      </p>

      <input
        className="mb-3 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-700"
        placeholder="Target role (e.g. QA Engineer internship)"
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
      />

      <Textarea
        placeholder='e.g. "Target this for a QA Engineer 6-month internship instead of SDE."'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="rounded-xl"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => void send()} disabled={loading || !message.trim()} className="gap-2 rounded-xl">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send
        </Button>
        <Button
          variant="outline"
          onClick={() => void lockVersion()}
          disabled={loading || !activeResumeVersionId}
          className="gap-2 rounded-xl"
        >
          <Lock className="h-4 w-4" />
          Lock version + rebuild sidebar
        </Button>
      </div>

      {agentMessage && <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{agentMessage}</p>}
      {atsScore != null && (
        <p className="mt-2 text-sm font-medium text-emerald-700">ATS match (vs target): {atsScore}%</p>
      )}

      {clarifying.length > 0 && (
        <div className="mt-4 space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          {clarifying.map((q) => (
            <p key={q}>{q}</p>
          ))}
        </div>
      )}

      {diffs.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Diff proposals</p>
          {diffs.map((d) => (
            <div
              key={d.suggestion_id}
              className="rounded-xl border border-slate-100 p-3 text-sm dark:border-slate-800"
            >
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{d.section}</Badge>
                <Badge variant={d.kind === 'suggested_addition' ? 'destructive' : 'outline'}>
                  {d.kind === 'suggested_addition' ? 'unconfirmed addition' : 'reframe'}
                </Badge>
                <label className="ml-auto flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={accepted.includes(d.suggestion_id)}
                    onChange={() => toggleAccept(d.suggestion_id)}
                  />
                  Accept
                </label>
              </div>
              {d.before && <p className="text-slate-500 line-through">{d.before}</p>}
              <p className="text-slate-800 dark:text-slate-100">{d.after}</p>
              {d.reasoning?.summary && (
                <p className="mt-1 text-xs text-slate-400">{d.reasoning.summary}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
