"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Loader2,
  Monitor,
  Play,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import AIChatPanel from "@/components/proposal/ai-chat-panel";

/* ─── Types ─── */

interface Proposal {
  id: string;
  title: string;
  status: string;
  htmlContent?: string | null;
  qualityScore?: number | null;
  client: {
    id: string;
    name: string;
    nameZh?: string | null;
  };
  heroData?: Record<string, unknown> | null;
  profileData?: Record<string, unknown> | null;
  diagnosisData?: Record<string, unknown> | null;
  competitorData?: Record<string, unknown> | null;
  serviceData?: Record<string, unknown> | null;
  pricingData?: Record<string, unknown> | null;
  outcomeData?: Record<string, unknown> | null;
  timelineData?: Record<string, unknown> | null;
  upsellData?: Record<string, unknown> | null;
  ctaData?: Record<string, unknown> | null;
}

interface ProposalVersion {
  id: string;
  versionNumber: number;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "草稿",
  GENERATING: "生成中",
};

const SECTIONS = [
  { key: "heroData", label: "Hero 封面", index: 1 },
  { key: "profileData", label: "公司画像", index: 2 },
  { key: "diagnosisData", label: "机会与诊断", index: 3 },
  { key: "competitorData", label: "竞品对标矩阵", index: 4 },
  { key: "serviceData", label: "服务方案", index: 5 },
  { key: "pricingData", label: "合作结构", index: 6 },
  { key: "outcomeData", label: "预期效果", index: 7 },
  { key: "timelineData", label: "执行路径", index: 8 },
  { key: "upsellData", label: "更多可能", index: 9 },
  { key: "ctaData", label: "行动召唤", index: 10 },
];

const DEVICE_WIDTHS: Record<string, number | null> = {
  desktop: null,
  tablet: 768,
  mobile: 375,
};

/* ─── Section Editor ─── */

function SectionEditor({
  sectionKey,
  label,
  index,
  data,
  onSave,
  saving,
}: {
  sectionKey: string;
  label: string;
  index: number;
  data: Record<string, unknown> | null;
  onSave: (key: string, data: Record<string, unknown>) => void;
  saving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editData, setEditData] = useState<string>("");

  useEffect(() => {
    if (data) {
      setEditData(JSON.stringify(data, null, 2));
    }
  }, [data]);

  function handleSave() {
    try {
      const parsed = JSON.parse(editData);
      onSave(sectionKey, parsed);
    } catch {
      /* invalid json */
    }
  }

  const hasData = data && Object.keys(data).length > 0;

  return (
    <div className="border-b last:border-0">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
          {index}
        </span>
        <span className="flex-1 text-sm font-medium">{label}</span>
        {hasData ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <span className="text-[10px] text-muted-foreground">空</span>
        )}
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="space-y-2 px-4 pb-4">
          <textarea
            value={editData}
            onChange={(e) => setEditData(e.target.value)}
            rows={12}
            className="w-full rounded-lg border bg-background p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="gap-1"
            >
              {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              保存
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Editor Page ─── */

export default function ProposalEditorPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoom, setZoom] = useState(100);
  const [exporting, setExporting] = useState(false);
  const [leftWidth, setLeftWidth] = useState(380);
  const [rightWidth, setRightWidth] = useState(380);
  const dragging = useRef(false);
  const splitRef = useRef<HTMLDivElement>(null);
  const [showAI, setShowAI] = useState(false);
  const [versions, setVersions] = useState<ProposalVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genStep, setGenStep] = useState("");
  const generatingRef = useRef(false);
  const [qualityChecking, setQualityChecking] = useState(false);
  const [qualityResult, setQualityResult] = useState<{
    score: number;
    checks: { name: string; passed: boolean; severity: string; details: string }[];
    passedCount: number;
    totalCount: number;
  } | null>(null);
  const [showQuality, setShowQuality] = useState(false);

  // Drag to resize left panel
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const startX = e.clientX;
    const startW = leftWidth;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = ev.clientX - startX;
      const containerW = splitRef.current?.offsetWidth ?? 1200;
      const minW = 240;
      const maxW = Math.min(600, containerW * 0.45);
      setLeftWidth(Math.max(minW, Math.min(maxW, startW + delta)));
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [leftWidth]);

  // Drag to resize right (AI) panel
  const handleRightDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    const startX = e.clientX;
    const startW = rightWidth;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = startX - ev.clientX; // inverted: drag left = wider
      const containerW = splitRef.current?.offsetWidth ?? 1200;
      const minW = 280;
      const maxW = Math.min(600, containerW * 0.45);
      setRightWidth(Math.max(minW, Math.min(maxW, startW + delta)));
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [rightWidth]);

  // Check if all sections are empty
  const allSectionsEmpty = SECTIONS.every((s) => {
    const data = proposal?.[s.key as keyof Proposal] as Record<string, unknown> | null | undefined;
    return !data || Object.keys(data).length === 0;
  });

  // Trigger generation from editor
  async function handleGenerate() {
    setGenerating(true);
    generatingRef.current = true;
    setGenProgress(0);
    setGenStep("初始化");
    setError("");

    try {
      const res = await fetch(`/api/proposals/${proposalId}/generate`, {
        method: "POST",
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "生成失败");
      }

      const jobId = resData.jobId;

      // Connect to SSE stream for progress (pass jobId to avoid picking up stale jobs)
      const eventSource = new EventSource(
        `/api/proposals/${proposalId}/generate/stream${jobId ? `?jobId=${jobId}` : ""}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "progress") {
            setGenProgress(data.progress);
            setGenStep(data.currentStep);
            if (data.status === "COMPLETED") {
              eventSource.close();
              setGenerating(false);
              generatingRef.current = false;
              fetchProposal();
            } else if (data.status === "FAILED") {
              eventSource.close();
              setGenerating(false);
              generatingRef.current = false;
              setError(data.error || "生成失败");
            }
          } else if (data.type === "error") {
            eventSource.close();
            setGenerating(false);
            generatingRef.current = false;
            setError(data.message);
          }
        } catch {
          /* ignore parse errors */
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        if (generatingRef.current) {
          setGenerating(false);
          generatingRef.current = false;
          setError("连接中断");
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setGenerating(false);
      generatingRef.current = false;
    }
  }

  // Fetch proposal
  const fetchProposal = useCallback(async () => {
    try {
      const res = await fetch(`/api/proposals/${proposalId}`);
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setProposal(data);
      setTitleDraft(data.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    fetchProposal();
  }, [fetchProposal]);

  // Save section data
  async function handleSaveSection(key: string, data: Record<string, unknown>) {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: data }),
      });
      if (!res.ok) throw new Error("保存失败");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Refresh preview
      fetchProposal();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  // Save title
  async function handleSaveTitle() {
    if (!titleDraft.trim() || titleDraft === proposal?.title) {
      setEditingTitle(false);
      return;
    }
    try {
      await fetch(`/api/proposals/${proposalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleDraft }),
      });
      setProposal((prev) => prev ? { ...prev, title: titleDraft } : prev);
    } catch {
      /* ignore */
    }
    setEditingTitle(false);
  }

  // Export HTML
  function exportHtml() {
    if (!proposal?.htmlContent) return;
    const blob = new Blob([proposal.htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Sitesfy_x_${proposal.client.name ?? "Client"}_Proposal.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Delete proposal
  async function handleDelete() {
    if (!confirm("确认删除此提案？此操作不可撤销。")) return;
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      router.push("/proposals");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  // Duplicate proposal
  async function handleDuplicate() {
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${proposal?.title}（副本）`,
          clientId: proposal?.client.id,
          duplicateFrom: proposalId,
        }),
      });
      if (!res.ok) throw new Error("复制失败");
      const data = await res.json();
      router.push(`/proposals/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  // Fetch versions
  async function fetchVersions() {
    try {
      const res = await fetch(`/api/proposals/${proposalId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data);
      }
    } catch {
      /* ignore */
    }
  }

  // Create version snapshot
  async function handleSaveVersion() {
    setSavingVersion(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/versions`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("保存版本失败");
      await fetchVersions();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingVersion(false);
    }
  }

  // Restore version
  async function handleRestoreVersion(versionId: string) {
    if (!confirm("确认恢复到此版本？当前未保存的更改将丢失。")) return;
    setRestoringVersion(versionId);
    try {
      const res = await fetch(
        `/api/proposals/${proposalId}/versions/${versionId}/restore`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("恢复版本失败");
      await fetchProposal();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRestoringVersion(null);
    }
  }

  // Toggle version panel
  function toggleVersions() {
    if (!showVersions) fetchVersions();
    setShowVersions(!showVersions);
  }

  // Run quality check
  async function handleQualityCheck() {
    if (!proposal?.htmlContent) return;
    setQualityChecking(true);
    setShowQuality(true);
    setQualityResult(null);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/quality-check`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "质检失败");
      setQualityResult(data);
      setProposal((prev) =>
        prev ? { ...prev, qualityScore: data.score } : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setQualityChecking(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">提案不存在</p>
        <Link href="/proposals">
          <Button variant="outline" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Button>
        </Link>
      </div>
    );
  }

  const deviceWidth = DEVICE_WIDTHS[previewDevice];
  const iframeKey = `${proposalId}-${proposal.htmlContent?.length ?? 0}`;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b pb-3">
        <Link href="/proposals" className="shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        {/* Title (editable) */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {editingTitle ? (
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                autoFocus
                className="h-7 w-full max-w-md rounded border bg-background px-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="truncate text-sm font-semibold hover:underline"
                title={proposal.title}
              >
                {proposal.title}
              </button>
            )}
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {proposal.client.nameZh ?? proposal.client.name}
            </span>
            {/* Auto-save indicator */}
            {saving && (
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                保存中
              </span>
            )}
            {saved && (
              <span className="flex shrink-0 items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Check className="h-3 w-3" />
                已保存
              </span>
            )}
            {/* Quality score */}
            {proposal.qualityScore !== null && proposal.qualityScore !== undefined && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  proposal.qualityScore >= 80
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : proposal.qualityScore >= 60
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {proposal.qualityScore}分
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerate}
          disabled={generating}
          className="gap-1"
        >
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {generating ? `${genProgress}%` : "生成"}
        </Button>
        <Button
          variant={showQuality ? "default" : "outline"}
          size="sm"
          onClick={handleQualityCheck}
          disabled={qualityChecking || !proposal.htmlContent}
          className="gap-1"
        >
          {qualityChecking ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5" />
          )}
          {qualityChecking ? "检查中..." : "质检"}
        </Button>
        <Button
          variant={showVersions ? "default" : "outline"}
          size="sm"
          onClick={toggleVersions}
          className="gap-1"
        >
          <Clock className="h-3.5 w-3.5" />
          版本
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={exportHtml}
          disabled={exporting || !proposal.htmlContent}
          className="gap-1"
        >
          <Download className="h-3.5 w-3.5" />
          下载 HTML
        </Button>
        <Button
          variant={showAI ? "default" : "outline"}
          size="sm"
          onClick={() => setShowAI(!showAI)}
          className="gap-1"
        >
          <Bot className="h-3.5 w-3.5" />
          AI 助手
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDuplicate}
          className="gap-1"
        >
          <Copy className="h-3.5 w-3.5" />
          复制
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="gap-1 text-red-600 hover:text-red-700 dark:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
          删除
        </Button>
      </div>

      {/* Split pane */}
      <div ref={splitRef} className="flex flex-1 gap-0 overflow-hidden pt-3">
        {/* Left: Section editors */}
        <div style={{ width: leftWidth }} className="shrink-0 overflow-y-auto rounded-lg border bg-card">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold">段落编辑</h3>
            <p className="text-xs text-muted-foreground">
              编辑各段 JSON 数据，保存后预览更新
            </p>
          </div>
          {/* Generation progress bar */}
          {generating && (
            <div className="border-b px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>{genStep}</span>
                <span className="ml-auto font-medium">{genProgress}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${genProgress}%` }}
                />
              </div>
            </div>
          )}
          {/* Empty state */}
          {allSectionsEmpty && !generating && (
            <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                所有段落为空，请先生成提案内容
              </p>
              <Button
                size="sm"
                onClick={handleGenerate}
                className="gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                开始生成
              </Button>
            </div>
          )}
          {SECTIONS.map((s) => (
            <SectionEditor
              key={s.key}
              sectionKey={s.key}
              label={s.label}
              index={s.index}
              data={
                (proposal[s.key as keyof Proposal] as Record<string, unknown> | null) ??
                null
              }
              onSave={handleSaveSection}
              saving={saving}
            />
          ))}
          {/* Version history panel */}
          {showVersions && (
            <div className="border-t">
              <div className="flex items-center justify-between px-4 py-3">
                <h4 className="text-sm font-semibold">版本历史</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveVersion}
                  disabled={savingVersion || !proposal.htmlContent}
                  className="gap-1 text-xs"
                >
                  {savingVersion ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  保存版本
                </Button>
              </div>
              <div className="max-h-48 overflow-y-auto px-4 pb-3">
                {versions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">暂无版本记录</p>
                ) : (
                  <div className="space-y-1.5">
                    {versions.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div>
                          <p className="text-xs font-medium">v{v.versionNumber}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(v.createdAt).toLocaleString("zh-CN")}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRestoreVersion(v.id)}
                          disabled={restoringVersion === v.id}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                        >
                          {restoringVersion === v.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RotateCcw className="h-3 w-3" />
                          )}
                          恢复
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Quality check results panel */}
          {showQuality && (
            <div className="border-t">
              <div className="flex items-center justify-between px-4 py-3">
                <h4 className="text-sm font-semibold">质检结果</h4>
                <button
                  onClick={() => setShowQuality(false)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  关闭
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto px-4 pb-3">
                {qualityChecking ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    正在运行质检（含 AI 语义检查）...
                  </div>
                ) : qualityResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-lg font-bold ${
                          qualityResult.score >= 80
                            ? "text-green-600"
                            : qualityResult.score >= 60
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      >
                        {qualityResult.score}分
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {qualityResult.passedCount}/{qualityResult.totalCount} 项通过
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {qualityResult.checks.map((check, i) => (
                        <div
                          key={i}
                          className={`rounded-lg border px-3 py-2 text-xs ${
                            check.passed
                              ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
                              : check.severity === "critical"
                                ? "border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
                                : "border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{check.passed ? "✓" : check.severity === "critical" ? "✗" : "⚠"}</span>
                            <span className="font-medium">{check.name}</span>
                          </div>
                          <p className="mt-0.5 text-muted-foreground">{check.details}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
        {/* Drag handle */}
        <div
          onMouseDown={handleDragStart}
          className="group relative z-10 w-3 shrink-0 cursor-col-resize"
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:w-0.5 group-hover:bg-indigo-500 group-active:bg-indigo-500" />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Preview controls */}
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center rounded-lg border bg-card p-0.5">
              <button
                onClick={() => setPreviewDevice("desktop")}
                className={`rounded-md p-1.5 ${previewDevice === "desktop" ? "bg-muted" : "hover:bg-muted/50"}`}
                title="桌面"
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice("tablet")}
                className={`rounded-md p-1.5 ${previewDevice === "tablet" ? "bg-muted" : "hover:bg-muted/50"}`}
                title="平板"
              >
                <Tablet className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setPreviewDevice("mobile")}
                className={`rounded-md p-1.5 ${previewDevice === "mobile" ? "bg-muted" : "hover:bg-muted/50"}`}
                title="手机"
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(25, z - 10))}
                className="rounded-md p-1.5 hover:bg-muted"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="w-10 text-center text-xs text-muted-foreground">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="rounded-md p-1.5 hover:bg-muted"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              onClick={fetchProposal}
              className="ml-auto rounded-md p-1.5 hover:bg-muted"
              title="刷新预览"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* iframe */}
          <div className="flex-1 overflow-auto rounded-lg border bg-zinc-100 dark:bg-zinc-900">
            <div
              className="mx-auto h-full transition-all"
              style={{
                width: deviceWidth ? `${deviceWidth}px` : "100%",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              {proposal.htmlContent ? (
                <iframe
                  key={iframeKey}
                  src={`/api/proposals/${proposalId}/html`}
                  className="h-full w-full bg-white"
                  sandbox="allow-same-origin"
                  title="提案预览"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  暂无 HTML 内容。请先生成提案。
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: AI Chat Panel */}
        {showAI && (
          <>
            <div
              onMouseDown={handleRightDragStart}
              className="group relative z-10 w-3 shrink-0 cursor-col-resize"
            >
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border transition-colors group-hover:w-0.5 group-hover:bg-indigo-500 group-active:bg-indigo-500" />
            </div>
            <div style={{ width: rightWidth }} className="shrink-0 overflow-hidden">
            <AIChatPanel
              proposalId={proposalId}
              sectionData={
                Object.fromEntries(
                  SECTIONS.map((s) => [
                    s.key,
                    (proposal[s.key as keyof Proposal] as Record<string, unknown> | null) ?? null,
                  ])
                )
              }
              onSectionUpdate={(key, data) => {
                handleSaveSection(key, data);
                setProposal((prev) =>
                  prev ? { ...prev, [key]: data } : prev
                );
              }}
              clientName={proposal.client.nameZh ?? proposal.client.name}
            />
          </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
