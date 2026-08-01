"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader } from "@/components/ui/loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import {
  MetricCard,
  BarChartCard,
  LineChartCard,
  PieChartCard,
  DataTableCard,
} from "@/components/analytics"
import {
  Activity,
  Coins,
  Download,
  Filter,
  Cpu,
  Users,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import toast from "react-hot-toast"

type FeatureOption = { key: string; label: string }

function defaultDateRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 30)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function formatTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n ?? 0)
}

function formatUsd(n: number) {
  return `$${(n ?? 0).toFixed(4)}`
}

export default function AdminAiUsagePage() {
  const initial = defaultDateRange()
  const [startDate, setStartDate] = useState(initial.start)
  const [endDate, setEndDate] = useState(initial.end)
  const [feature, setFeature] = useState<string>("all")
  const [provider, setProvider] = useState<string>("all")
  const [studentId, setStudentId] = useState("")
  const [featureOptions, setFeatureOptions] = useState<FeatureOption[]>([])

  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [byFeature, setByFeature] = useState<any[]>([])
  const [byProvider, setByProvider] = useState<any[]>([])
  const [providerRollup, setProviderRollup] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const queryParams = useMemo(() => {
    const params: Record<string, string | undefined> = {
      start_date: startDate ? `${startDate}T00:00:00` : undefined,
      end_date: endDate ? `${endDate}T23:59:59` : undefined,
      feature: feature !== "all" ? feature : undefined,
      provider: provider !== "all" ? provider : undefined,
      student_id: studentId.trim() || undefined,
    }
    return params
  }, [startDate, endDate, feature, provider, studentId])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sum, feat, prov, stud] = await Promise.all([
        apiClient.getAiUsageSummary(queryParams),
        apiClient.getAiUsageByFeature(queryParams),
        apiClient.getAiUsageByProvider(queryParams),
        apiClient.getAiUsageByStudent({ ...queryParams, page: 1, page_size: 50 }),
      ])
      setSummary(sum)
      setByFeature(feat?.items || [])
      setByProvider(prov?.items || [])
      setProviderRollup(prov?.by_provider || [])
      setStudents(stud?.items || [])
    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.detail || "Failed to load AI usage analytics")
    } finally {
      setLoading(false)
    }
  }, [queryParams])

  useEffect(() => {
    apiClient
      .getAiUsageFeatures()
      .then((res) => setFeatureOptions(res.features || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const providerFilterOptions = useMemo(() => {
    const set = new Set<string>()
    providerRollup.forEach((p) => set.add(p.provider))
    byProvider.forEach((p) => set.add(p.provider))
    ;["cohere", "anthropic", "openai"].forEach((p) => set.add(p))
    return Array.from(set)
  }, [providerRollup, byProvider])

  const handleExport = async (format: "csv" | "excel") => {
    setExporting(true)
    try {
      const blob = await apiClient.exportAiUsage(format, queryParams)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = format === "excel" ? "ai_usage.xlsx" : "ai_usage.csv"
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Exported AI usage as ${format.toUpperCase()}`)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Export failed")
    } finally {
      setExporting(false)
    }
  }

  const kpis = summary?.kpis

  return (
    <DashboardLayout requiredUserType="admin">
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Usage Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Token consumption, requests, and estimated cost across Cohere, Claude, and OpenAI
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={() => handleExport("csv")}
            >
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={() => handleExport("excel")}
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            <CardDescription>Filter by date range, feature, provider, or student</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Start date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">End date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Feature</label>
              <Select value={feature} onValueChange={setFeature}>
                <SelectTrigger>
                  <SelectValue placeholder="All features" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All features</SelectItem>
                  {featureOptions.map((f) => (
                    <SelectItem key={f.key} value={f.key}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Provider</label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="All providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All providers</SelectItem>
                  {providerFilterOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Student ID</label>
              <Input
                placeholder="UUID (optional)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard
                title="Total Requests"
                value={kpis?.total_requests ?? 0}
                icon={<Activity className="h-4 w-4" />}
              />
              <MetricCard
                title="Total Tokens"
                value={formatTokens(kpis?.total_tokens ?? 0)}
                description={`${formatTokens(kpis?.input_tokens ?? 0)} in / ${formatTokens(kpis?.output_tokens ?? 0)} out`}
                icon={<Zap className="h-4 w-4" />}
              />
              <MetricCard
                title="Estimated Cost"
                value={formatUsd(kpis?.estimated_cost_usd ?? 0)}
                description="List-price estimate (free + paid keys)"
                icon={<Coins className="h-4 w-4" />}
              />
              <MetricCard
                title="Avg Tokens / Student"
                value={formatTokens(Math.round(kpis?.avg_tokens_per_student ?? 0))}
                description={`${kpis?.unique_students ?? 0} students`}
                icon={<Users className="h-4 w-4" />}
              />
              <MetricCard
                title="Top Feature"
                value={kpis?.top_feature_label || "—"}
                icon={<Cpu className="h-4 w-4" />}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <LineChartCard
                title="Daily Token Consumption"
                description="Platform-wide total tokens per day"
                data={(summary?.daily || []).map((d: any) => ({
                  date: d.date,
                  tokens: d.total_tokens,
                  requests: d.requests,
                }))}
                lines={[
                  { dataKey: "tokens", color: "#06b6d4", name: "Tokens" },
                  { dataKey: "requests", color: "#10b981", name: "Requests" },
                ]}
                xAxisKey="date"
              />
              <PieChartCard
                title="Tokens by Provider"
                description="Shows providers that have usage in this range"
                data={providerRollup.map((p) => ({
                  name: p.provider,
                  value: p.total_tokens,
                }))}
                dataKey="value"
                nameKey="name"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <BarChartCard
                title="Tokens by Feature"
                description="Which AI features consume the most tokens"
                data={byFeature.map((f) => ({
                  label: f.label,
                  tokens: f.total_tokens,
                }))}
                dataKey="tokens"
                xAxisKey="label"
                height={360}
              />
              <BarChartCard
                title="Requests by Feature"
                description="Most-used AI features by request count"
                data={byFeature.map((f) => ({
                  label: f.label,
                  requests: f.requests,
                }))}
                dataKey="requests"
                xAxisKey="label"
                height={360}
              />
            </div>

            <DataTableCard
              title="Feature Breakdown"
              description="Input, output, total tokens and estimated cost per feature"
              columns={[
                { key: "label", label: "Feature" },
                { key: "requests", label: "Requests" },
                { key: "input_tokens", label: "Input" },
                { key: "output_tokens", label: "Output" },
                { key: "total_tokens", label: "Total" },
                { key: "estimated_cost_usd", label: "Est. Cost" },
              ]}
              data={byFeature.map((f) => ({
                ...f,
                input_tokens: formatTokens(f.input_tokens),
                output_tokens: formatTokens(f.output_tokens),
                total_tokens: formatTokens(f.total_tokens),
                estimated_cost_usd: formatUsd(f.estimated_cost_usd),
              }))}
            />

            <DataTableCard
              title="Provider / Model Breakdown"
              description="Dynamic list of LLM APIs used in the selected period"
              columns={[
                { key: "provider", label: "Provider" },
                { key: "model", label: "Model" },
                { key: "requests", label: "Requests" },
                { key: "total_tokens", label: "Tokens" },
                { key: "estimated_cost_usd", label: "Est. Cost" },
              ]}
              data={byProvider.map((p) => ({
                ...p,
                total_tokens: formatTokens(p.total_tokens),
                estimated_cost_usd: formatUsd(p.estimated_cost_usd),
              }))}
            />

            <Card>
              <CardHeader>
                <CardTitle>Student-wise AI Usage</CardTitle>
                <CardDescription>
                  Expand a row to see which features each student used and token spend
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {students.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No student usage in this range yet. Usage appears after instrumented AI calls run.
                  </p>
                )}
                {students.map((s) => {
                  const key = s.student_id || "system"
                  const open = expandedStudent === key
                  return (
                    <div key={key} className="rounded-lg border">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-muted/40"
                        onClick={() => setExpandedStudent(open ? null : key)}
                      >
                        <div>
                          <div className="font-medium">{s.student_name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.student_email || s.student_id || "No student linked"}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Badge variant="secondary">{s.requests} req</Badge>
                          <span>{formatTokens(s.total_tokens)} tok</span>
                          <span className="text-muted-foreground">{formatUsd(s.estimated_cost_usd)}</span>
                          {open ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </button>
                      {open && (
                        <div className="border-t bg-muted/20 p-3">
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {(s.features || []).map((f: any) => (
                              <div
                                key={f.feature}
                                className="rounded-md border bg-background p-2 text-sm"
                              >
                                <div className="font-medium">{f.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {f.requests} requests · {formatTokens(f.total_tokens)} tokens ·{" "}
                                  {formatUsd(f.estimated_cost_usd)}
                                </div>
                              </div>
                            ))}
                            {(s.features || []).length === 0 && (
                              <p className="text-xs text-muted-foreground">No feature detail</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
