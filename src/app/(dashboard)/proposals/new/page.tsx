"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Globe,
  FileText,
  FlaskConical,
  Layers,
  ShieldCheck,
  Download,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCcw,
  Rocket,
  Upload,
} from "lucide-react";

/* ─── Types ─── */

type BusinessLine = "upgrade" | "greenfield";

interface Client {
  id: string;
  name: string;
  nameZh?: string | null;
  websiteUrl: string;
  industry?: string | null;
  researchedAt?: string | null;
}

interface ResearchResult {
  hardData: Record<string, unknown>;
  ecosystem: Record<string, unknown>;
  differentiation: Record<string, unknown>;
  diagnosis: Record<string, unknown>;
  assets: Record<string, unknown>;
}

interface StepLog {
  step: string;
  status: string;
  message?: string;
  timestamp: string;
}

interface QualityCheck {
  name: string;
  passed: boolean;
  severity: "critical" | "warning" | "info";
  details: string;
}

/* ─── Business Line Selection ─── */

function BusinessLineSelection({
  onSelect,
}: {
  onSelect: (line: BusinessLine) => void;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold tracking-tight">选择业务类型</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          不同业务类型对应不同的提案流程和模板
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Upgrade */}
        <button
          type="button"
          onClick={() => onSelect("upgrade")}
          className="group relative rounded-xl border-2 border-transparent bg-card p-6 text-left shadow-sm transition-all hover:border-indigo-500 hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:group-hover:bg-indigo-900/30">
            <RefreshCcw className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold">网站升级</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            客户已有网站，需要重新设计或升级改版，提升品牌形象与转化效果
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["改版升级", "品牌焕新", "SEO 优化", "多语言"].map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <ArrowRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/0 transition-all group-hover:text-indigo-500 group-hover:translate-x-0.5" />
        </button>

        {/* Greenfield */}
        <button
          type="button"
          onClick={() => onSelect("greenfield")}
          className="group relative rounded-xl border-2 border-transparent bg-card p-6 text-left shadow-sm transition-all hover:border-indigo-500 hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:group-hover:bg-emerald-900/30">
            <Rocket className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold">0-1 建站</h3>
          <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
            客户没有网站或需要全新搭建，从零开始规划设计并开发上线
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {["全新搭建", "品牌策划", "内容规划", "全球化"].map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <ArrowRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/0 transition-all group-hover:text-indigo-500 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Step indicator ─── */

const STEPS = [
  { label: "客户信息", icon: Globe },
  { label: "AI 研究", icon: FlaskConical },
  { label: "逐段生成", icon: Layers },
  { label: "质检导出", icon: ShieldCheck },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const Icon = s.icon;
        const active = i === current;
        const done = i < current;
        return (
          <div key={s.label} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`h-px w-8 ${done ? "bg-indigo-500" : "bg-border"}`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "bg-indigo-500 text-white"
                  : done
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {done ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Icon className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1: Client Info ─── */

type DataSource = "website" | "manual";

function Step1ClientInfo({
  onNext,
  initialClientId,
}: {
  onNext: (client: Client, proposalId: string, dataSource: DataSource) => void;
  initialClientId?: string | null;
}) {
  const [name, setName] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [manualNotes, setManualNotes] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Client autocomplete
  const [clients, setClients] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    if (name.length < 2) {
      setClients([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/clients?search=${encodeURIComponent(name)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setClients(data.clients ?? []);
        }
      } catch {
        /* ignore */
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [name]);

  // Auto-load client from URL param
  useEffect(() => {
    if (!initialClientId) return;
    (async () => {
      try {
        const res = await fetch(`/api/clients/${initialClientId}`);
        if (res.ok) {
          const data = await res.json();
          selectClient({
            id: data.id,
            name: data.name,
            nameZh: data.nameZh ?? null,
            websiteUrl: data.websiteUrl,
            industry: data.industry ?? null,
            researchedAt: data.researchedAt ?? null,
          });
        }
      } catch {
        /* ignore */
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialClientId]);

  function selectClient(c: Client) {
    setSelectedClient(c);
    setName(c.name);
    setNameZh(c.nameZh ?? "");
    setWebsiteUrl(c.websiteUrl);
    setIndustry(c.industry ?? "");
    setShowSuggestions(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let clientId = selectedClient?.id;

      if (!clientId) {
        // Create new client
        const clientRes = await fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            nameZh: nameZh || undefined,
            websiteUrl: websiteUrl || "https://placeholder.local",
            industry: industry || undefined,
            targetMarket: targetMarket || undefined,
          }),
        });
        if (!clientRes.ok) {
          const text = await clientRes.text();
          let msg = "创建客户失败";
          try { msg = JSON.parse(text).error || msg; } catch {}
          throw new Error(msg);
        }
        const client = await clientRes.json();
        clientId = client.id;
      }

      // Create proposal
      const proposalTitle = `Sitesfy x ${nameZh || name} 提案`;
      const proposalRes = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: proposalTitle, clientId }),
      });
      if (!proposalRes.ok) {
        const text = await proposalRes.text();
        let msg = "创建提案失败";
        try { msg = JSON.parse(text).error || msg; } catch {}
        throw new Error(msg);
      }
      const proposal = await proposalRes.json();

      const ds: DataSource = websiteUrl.trim() ? "website" : "manual";
      onNext(
        selectedClient ?? {
          id: clientId!,
          name,
          nameZh: nameZh || null,
          websiteUrl: websiteUrl || "",
          industry: industry || null,
          researchedAt: null,
        },
        proposal.id,
        ds
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const canSubmit =
    name.trim() &&
    (websiteUrl.trim() || files.length > 0 || manualNotes.trim());

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5">
      <div>
        <h2 className="text-lg font-semibold">客户信息</h2>
        <p className="text-sm text-muted-foreground">
          输入客户信息或从已有客户中选择
        </p>
      </div>

      {/* Name with autocomplete */}
      <div className="relative">
        <label className="mb-1 block text-sm font-medium">
          客户名称 (英文) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setSelectedClient(null);
            setShowSuggestions(true);
          }}
          onFocus={() => clients.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="e.g. LCSC Electronics"
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        {showSuggestions && clients.length > 0 && (
          <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border bg-card shadow-lg">
            {clients.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={() => selectClient(c)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{c.name}</span>
                {c.nameZh && (
                  <span className="text-muted-foreground">{c.nameZh}</span>
                )}
                {c.researchedAt && (
                  <span className="ml-auto rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    已研究
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
        {selectedClient && (
          <p className="mt-1 text-xs text-green-600 dark:text-green-400">
            已选择现有客户
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">客户名称 (中文)</label>
        <input
          type="text"
          value={nameZh}
          onChange={(e) => setNameZh(e.target.value)}
          placeholder="e.g. 立创商城"
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Website URL */}
      <div>
        <label className="mb-1 block text-sm font-medium">官网 URL</label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://www.lcsc.com"
          className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          填写后 AI 将自动研究官网内容
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">行业</label>
          <input
            type="text"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. 电子元器件"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">目标市场</label>
          <input
            type="text"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            placeholder="e.g. 全球"
            className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* File upload zone */}
      <div>
        <label className="mb-1 block text-sm font-medium">上传文件</label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const dropped = Array.from(e.dataTransfer.files);
            if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
          }}
          className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 transition-colors ${
            dragging
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
        >
          <Upload className="h-8 w-8 text-muted-foreground/60" />
          <p className="mt-2 text-sm text-muted-foreground">
            拖拽文件到此处，或
            <label className="mx-1 cursor-pointer font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              点击浏览
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.webp,.xls,.xlsx,.csv,.pptx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            支持 PDF、Word、Excel、图片、文本等
          </p>
        </div>
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-sm"
              >
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-xs text-muted-foreground">
                  {f.size < 1024
                    ? `${f.size} B`
                    : f.size < 1024 * 1024
                      ? `${(f.size / 1024).toFixed(0)} KB`
                      : `${(f.size / (1024 * 1024)).toFixed(1)} MB`}
                </span>
                <button
                  type="button"
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional text notes */}
      <div>
        <label className="mb-1 block text-sm font-medium">补充说明</label>
        <textarea
          value={manualNotes}
          onChange={(e) => setManualNotes(e.target.value)}
          placeholder={"可粘贴补充资料，例如公司介绍、产品信息、行业背景等"}
          rows={4}
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button type="submit" disabled={!canSubmit || loading} className="w-full gap-1.5">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        {websiteUrl.trim() ? "下一步：AI 研究" : "下一步：生成提案"}
      </Button>
    </form>
  );
}

/* ─── Step 2: AI Research ─── */

function Step2Research({
  client,
  proposalId,
  onNext,
  onBack,
}: {
  client: Client;
  proposalId: string;
  onNext: (research: ResearchResult) => void;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    client.researchedAt ? "done" : "idle"
  );
  const [research, setResearch] = useState<ResearchResult | null>(null);
  const [error, setError] = useState("");
  const [expandedPanels, setExpandedPanels] = useState<Record<string, boolean>>({});
  // Per-dimension status: "pending" | "running" | "completed" | "failed"
  const [dimStatus, setDimStatus] = useState<Record<string, string>>({});
  const [fetchingWebsite, setFetchingWebsite] = useState(false);

  const DIMENSIONS = [
    { key: "hardData", stepName: "硬数据提取", label: "硬数据", description: "行业排名、规模、合作伙伴" },
    { key: "ecosystem", stepName: "业务生态分析", label: "业务生态", description: "子品牌、社群、工具、媒体" },
    { key: "differentiation", stepName: "差异化定位", label: "差异化定位", description: "核心定位、品牌主张" },
    { key: "diagnosis", stepName: "官网诊断", label: "官网诊断", description: "SEO、多语言、内容深度、技术" },
    { key: "assets", stepName: "可利用资产", label: "可利用资产", description: "可做内容的独有资产" },
  ];

  // Map step names from backend to dimension keys
  const stepToDimKey: Record<string, string> = {};
  for (const dim of DIMENSIONS) {
    stepToDimKey[dim.stepName] = dim.key;
  }

  // If client already has research, load it
  useEffect(() => {
    if (client.researchedAt) {
      fetch(`/api/clients/${client.id}`)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((data) => {
          const r: ResearchResult = {
            hardData: data.hardData ?? {},
            ecosystem: data.ecosystem ?? {},
            differentiation: data.differentiation ?? {},
            diagnosis: data.weaknessDiagnosis ?? {},
            assets: data.leverageableAssets ?? {},
          };
          setResearch(r);
          // Mark all as completed
          const allCompleted: Record<string, string> = {};
          for (const dim of DIMENSIONS) {
            if (r[dim.key as keyof ResearchResult] && Object.keys(r[dim.key as keyof ResearchResult]).length > 0) {
              allCompleted[dim.key] = "completed";
            }
          }
          setDimStatus(allCompleted);
        })
        .catch(() => setStatus("idle"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  async function startResearch() {
    setStatus("running");
    setError("");
    setDimStatus({});
    setFetchingWebsite(true);

    try {
      const res = await fetch(`/api/clients/${client.id}/research`, {
        method: "POST",
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = "研究失败";
        try { msg = JSON.parse(text).error || msg; } catch {}
        throw new Error(msg);
      }

      // SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("无法读取流");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "step") {
              if (data.step === "网页抓取") {
                setFetchingWebsite(data.status === "running");
              } else {
                const dimKey = stepToDimKey[data.step];
                if (dimKey) {
                  setDimStatus((prev) => ({ ...prev, [dimKey]: data.status }));
                }
              }
            } else if (data.type === "done") {
              setResearch(data.research);
              setStatus("done");
              // Mark all dimensions as completed
              const allCompleted: Record<string, string> = {};
              for (const dim of DIMENSIONS) {
                allCompleted[dim.key] = "completed";
              }
              setDimStatus(allCompleted);
            } else if (data.type === "error") {
              setError(data.message);
              setStatus("error");
            }
          } catch {
            /* ignore parse errors */
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    } finally {
      setFetchingWebsite(false);
    }
  }

  function togglePanel(key: string) {
    setExpandedPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function renderResearchData(data: Record<string, unknown>) {
    return Object.entries(data).map(([k, v]) => {
      if (v === null || v === undefined) return null;
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        return (
          <div key={k} className="flex items-start gap-2 py-1">
            <span className="min-w-0 shrink-0 text-xs font-medium text-muted-foreground">
              {k}:
            </span>
            <span className="text-xs">{String(v)}</span>
          </div>
        );
      }
      if (Array.isArray(v)) {
        return (
          <div key={k} className="py-1">
            <span className="text-xs font-medium text-muted-foreground">{k}:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {v.map((item, i) => (
                <span
                  key={i}
                  className="rounded-md bg-muted px-1.5 py-0.5 text-[11px]"
                >
                  {typeof item === "string" ? item : JSON.stringify(item)}
                </span>
              ))}
            </div>
          </div>
        );
      }
      return (
        <div key={k} className="py-1">
          <span className="text-xs font-medium text-muted-foreground">{k}:</span>
          <pre className="mt-1 overflow-x-auto rounded bg-muted p-2 text-[11px]">
            {JSON.stringify(v, null, 2)}
          </pre>
        </div>
      );
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold">AI 客户研究</h2>
        <p className="text-sm text-muted-foreground">
          AI 将分析 {client.name} 的官网，提取 5 类关键信息
        </p>
      </div>

      {/* Client summary */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-3">
          {fetchingWebsite ? (
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          ) : (
            <Globe className="h-5 w-5 text-muted-foreground" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {client.nameZh ?? client.name}
              {client.nameZh && (
                <span className="ml-1.5 text-xs text-muted-foreground">
                  {client.name}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{client.websiteUrl}</p>
          </div>
          {fetchingWebsite && (
            <span className="text-xs text-amber-500">抓取网页中...</span>
          )}
        </div>
      </div>

      {/* Progress / Results */}
      <div className="space-y-2">
        {DIMENSIONS.map((dim) => {
          const isExpanded = expandedPanels[dim.key];
          const data = research?.[dim.key as keyof ResearchResult];
          const hasData = data && Object.keys(data).length > 0;
          const ds = dimStatus[dim.key]; // "running" | "completed" | "failed" | undefined

          return (
            <div key={dim.key} className="rounded-lg border bg-card">
              <button
                type="button"
                onClick={() => hasData && togglePanel(dim.key)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left ${hasData ? "cursor-pointer" : "cursor-default"}`}
              >
                {ds === "failed" ? (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                ) : ds === "completed" || hasData ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                ) : ds === "running" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-amber-500" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full bg-muted-foreground/20" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{dim.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {dim.description}
                  </p>
                </div>
                {hasData &&
                  (isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  ))}
              </button>
              {isExpanded && hasData && (
                <div className="border-t px-4 py-3">
                  {renderResearchData(data)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>

        {status === "idle" || status === "error" ? (
          <Button onClick={startResearch} className="flex-1 gap-1.5">
            <FlaskConical className="h-4 w-4" />
            开始 AI 研究
          </Button>
        ) : status === "running" ? (
          <Button disabled className="flex-1 gap-1.5">
            <Loader2 className="h-4 w-4 animate-spin" />
            研究进行中...
          </Button>
        ) : (
          <div className="flex flex-1 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStatus("idle");
                setResearch(null);
                setDimStatus({});
              }}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              重新研究
            </Button>
            <Button
              onClick={() => research && onNext(research)}
              className="flex-1 gap-1.5"
            >
              <ArrowRight className="h-4 w-4" />
              下一步：生成提案
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Step 3: Section Generation ─── */

function Step3Generate({
  client,
  proposalId,
  onNext,
  onBack,
}: {
  client: Client;
  proposalId: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<"idle" | "generating" | "done" | "error">("idle");
  const statusRef = useRef(status);
  statusRef.current = status;
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [stepsLog, setStepsLog] = useState<StepLog[]>([]);
  const [error, setError] = useState("");
  const [previewReady, setPreviewReady] = useState(false);

  const startGeneration = useCallback(async () => {
    setStatus("generating");
    setError("");
    setProgress(0);
    setStepsLog([]);

    try {
      const res = await fetch(`/api/proposals/${proposalId}/generate`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "生成失败");
      }

      // Connect to SSE stream
      const eventSource = new EventSource(
        `/api/proposals/${proposalId}/generate/stream`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "progress") {
            setProgress(data.progress);
            setCurrentStep(data.currentStep);
            setStepsLog(data.stepsLog ?? []);

            if (data.status === "COMPLETED") {
              setStatus("done");
              setPreviewReady(true);
              eventSource.close();
            } else if (data.status === "FAILED") {
              setStatus("error");
              setError(data.error || "生成失败");
              eventSource.close();
            }
          } else if (data.type === "error") {
            setStatus("error");
            setError(data.message);
            eventSource.close();
          }
        } catch {
          /* ignore parse errors */
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        if (statusRef.current === "generating") {
          setStatus("error");
          setError("连接中断");
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatus("error");
    }
  }, [proposalId]);

  const SECTION_NAMES = [
    "Hero 封面",
    "公司画像",
    "机会与诊断",
    "竞品对标矩阵",
    "服务方案",
    "合作结构",
    "预期效果",
    "执行路径",
    "更多可能",
    "行动召唤",
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">逐段生成</h2>
        <p className="text-sm text-muted-foreground">
          AI 将串行生成提案的 10 个段落，保证叙事连贯性
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left: Progress */}
        <div className="space-y-4">
          {/* Progress bar */}
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">生成进度</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentStep && (
              <p className="mt-1 text-xs text-muted-foreground">
                当前：{currentStep}
              </p>
            )}
          </div>

          {/* Section checklist */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-2.5">
              <p className="text-sm font-medium">段落清单</p>
            </div>
            <div className="divide-y">
              {SECTION_NAMES.map((name, i) => {
                const completedLog = stepsLog.find(
                  (l) => l.step === name && l.status === "completed"
                );
                const runningLog = stepsLog.find(
                  (l) => l.step === name && l.status === "running"
                );
                const failedLog = stepsLog.find(
                  (l) => l.step === name && l.status === "failed"
                );

                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    {failedLog ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : completedLog ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : runningLog ? (
                      <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2" />
                    )}
                    <span
                      className={`text-sm ${completedLog ? "font-medium" : "text-muted-foreground"}`}
                    >
                      {i + 1}. {name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Preview iframe */}
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-2.5">
            <p className="text-sm font-medium">实时预览</p>
          </div>
          <div className="aspect-[3/4] w-full">
            {previewReady ? (
              <iframe
                src={`/api/proposals/${proposalId}/html`}
                className="h-full w-full rounded-b-lg"
                sandbox="allow-same-origin"
                title="提案预览"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {status === "generating"
                  ? "生成完成后显示预览..."
                  : '点击"开始生成"查看预览'}
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Actions — sticky bottom bar */}
      <div className="sticky bottom-0 z-10 -mx-6 -mb-6 mt-4 border-t bg-card/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={status === "generating"}
            className="gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>

          {status === "idle" || status === "error" ? (
            <Button onClick={startGeneration} className="flex-1 gap-1.5">
              <Layers className="h-4 w-4" />
              开始生成
            </Button>
          ) : status === "generating" ? (
            <Button disabled className="flex-1 gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              生成中...
            </Button>
          ) : (
            <Button onClick={onNext} className="flex-1 gap-1.5">
              <ArrowRight className="h-4 w-4" />
              下一步：质检导出
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 4: Quality Check & Export ─── */

function Step4QualityExport({
  proposalId,
  client,
  onBack,
}: {
  proposalId: string;
  client: Client;
  onBack: () => void;
}) {
  const router = useRouter();
  const [qcStatus, setQcStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [score, setScore] = useState<number | null>(null);
  const [checks, setChecks] = useState<QualityCheck[]>([]);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  async function runQualityCheck() {
    setQcStatus("running");
    setError("");
    try {
      const res = await fetch(`/api/proposals/${proposalId}/quality-check`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "质检失败");
      }
      const data = await res.json();
      setScore(data.score);
      setChecks(data.checks ?? []);
      setQcStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setQcStatus("error");
    }
  }

  async function exportPdf() {
    setExporting(true);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/export-pdf`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "导出失败");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sitesfy_x_${client.name}_Proposal.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const criticalFails = checks.filter((c) => !c.passed && c.severity === "critical");

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h2 className="text-lg font-semibold">质检与导出</h2>
        <p className="text-sm text-muted-foreground">
          运行 Phase 3 质量检查，确保提案符合标准
        </p>
      </div>

      {/* Score circle */}
      {score !== null && (
        <div className="flex items-center justify-center">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-muted"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${(score / 100) * 327} 327`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                className={
                  score >= 80
                    ? "text-green-500"
                    : score >= 60
                      ? "text-amber-500"
                      : "text-red-500"
                }
              />
            </svg>
            <div className="text-center">
              <p className="text-3xl font-bold">{score}</p>
              <p className="text-xs text-muted-foreground">质量分</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {qcStatus === "done" && (
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-green-600 dark:text-green-400">
            {passedCount} 项通过
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-red-600 dark:text-red-400">
            {checks.length - passedCount} 项未通过
          </span>
          {criticalFails.length > 0 && (
            <>
              <span className="text-muted-foreground">|</span>
              <span className="text-red-600 dark:text-red-400">
                {criticalFails.length} 项严重
              </span>
            </>
          )}
        </div>
      )}

      {/* Checks list */}
      {checks.length > 0 && (
        <div className="rounded-lg border bg-card divide-y">
          {checks.map((check, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              {check.passed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              ) : check.severity === "critical" ? (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium">{check.name}</p>
                <p className="text-xs text-muted-foreground">{check.details}</p>
              </div>
              <span
                className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  check.severity === "critical"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : check.severity === "warning"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
              >
                {check.severity === "critical"
                  ? "严重"
                  : check.severity === "warning"
                    ? "警告"
                    : "信息"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Preview iframe */}
      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-2.5">
          <p className="text-sm font-medium">提案预览</p>
        </div>
        <div className="aspect-[3/4] w-full">
          <iframe
            src={`/api/proposals/${proposalId}/html`}
            className="h-full w-full rounded-b-lg"
            sandbox="allow-same-origin"
            title="提案预览"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={qcStatus === "running"}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>

        {qcStatus === "idle" || qcStatus === "error" ? (
          <Button onClick={runQualityCheck} className="flex-1 gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            运行质检
          </Button>
        ) : qcStatus === "running" ? (
          <Button disabled className="flex-1 gap-1.5">
            <Loader2 className="h-4 w-4 animate-spin" />
            质检中...
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={runQualityCheck}
              className="gap-1.5"
            >
              <RefreshCw className="h-4 w-4" />
              重新质检
            </Button>
            <Button
              variant="outline"
              onClick={exportPdf}
              disabled={exporting}
              className="gap-1.5"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              导出 PDF
            </Button>
            <Button
              onClick={() => router.push(`/proposals/${proposalId}`)}
              className="flex-1 gap-1.5"
            >
              <Layers className="h-4 w-4" />
              进入编辑器
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Wizard Page ─── */

export default function NewProposalPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <NewProposalPageInner />
    </Suspense>
  );
}

function NewProposalPageInner() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const clientIdParam = searchParams.get("clientId");
  const initialBusinessLine =
    typeParam === "upgrade" || typeParam === "greenfield" ? typeParam : null;

  const [businessLine, setBusinessLine] = useState<BusinessLine | null>(initialBusinessLine);
  const [step, setStep] = useState(0);
  const [client, setClient] = useState<Client | null>(null);
  const [proposalId, setProposalId] = useState("");
  const [research, setResearch] = useState<ResearchResult | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>("website");

  // Business line selection gate
  if (!businessLine) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/proposals">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">新建提案</h1>
            <p className="text-sm text-muted-foreground">
              选择业务类型以开始
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <BusinessLineSelection onSelect={setBusinessLine} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (step === 0) {
                // Go back to business line selection
                setBusinessLine(null);
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              新建提案
              <span className="ml-2 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {businessLine === "upgrade" ? "网站升级" : "0-1 建站"}
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              4 步创建高质量提案
            </p>
          </div>
        </div>
        <StepIndicator current={step} />
      </div>

      {/* Step content */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        {step === 0 && (
          <Step1ClientInfo
            initialClientId={clientIdParam}
            onNext={(c, pid, ds) => {
              setClient(c);
              setProposalId(pid);
              setDataSource(ds);
              if (ds === "manual") {
                // Skip AI research step, go directly to generation
                setStep(2);
              } else {
                setStep(1);
              }
            }}
          />
        )}
        {step === 1 && client && (
          <Step2Research
            client={client}
            proposalId={proposalId}
            onNext={(r) => {
              setResearch(r);
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && client && (
          <Step3Generate
            client={client}
            proposalId={proposalId}
            onNext={() => setStep(3)}
            onBack={() => setStep(dataSource === "manual" ? 0 : 1)}
          />
        )}
        {step === 3 && client && (
          <Step4QualityExport
            proposalId={proposalId}
            client={client}
            onBack={() => setStep(2)}
          />
        )}
      </div>
    </div>
  );
}
