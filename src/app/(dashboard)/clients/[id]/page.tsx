"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FlaskConical,
  Globe,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

/* ─── Types ─── */

interface Client {
  id: string;
  name: string;
  nameZh?: string | null;
  websiteUrl: string;
  industry?: string | null;
  targetMarket?: string | null;
  hardData?: Record<string, unknown> | null;
  ecosystem?: Record<string, unknown> | null;
  differentiation?: Record<string, unknown> | null;
  weaknessDiagnosis?: Record<string, unknown> | null;
  leverageableAssets?: Record<string, unknown> | null;
  researchedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  proposals: {
    id: string;
    title: string;
    status: string;
    qualityScore?: number | null;
    updatedAt: string;
  }[];
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "草稿",
  GENERATING: "生成中",
  REVIEW: "待审核",
  APPROVED: "已通过",
  SENT: "已发送",
  ARCHIVED: "已归档",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  GENERATING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  REVIEW: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  SENT: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  ARCHIVED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

const RESEARCH_SECTIONS = [
  { key: "hardData", label: "硬数据", description: "行业排名、规模、合作伙伴、认证" },
  { key: "ecosystem", label: "业务生态", description: "子品牌、社群、工具、媒体渠道" },
  { key: "differentiation", label: "差异化定位", description: "核心定位、品牌主张、目标受众" },
  { key: "weaknessDiagnosis", label: "官网诊断", description: "SEO、多语言、内容深度、技术 SEO" },
  { key: "leverageableAssets", label: "可利用资产", description: "可做内容的独有资产" },
];

/* ─── Research Data Panel ─── */

function ResearchPanel({
  label,
  description,
  data,
}: {
  label: string;
  description: string;
  data: Record<string, unknown> | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasData = data && Object.keys(data).length > 0;

  function renderValue(value: unknown): React.ReactNode {
    if (value === null || value === undefined) return <span className="text-muted-foreground">—</span>;
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      return <span>{String(value)}</span>;
    }
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, i) => (
            <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
              {typeof item === "string" ? item : JSON.stringify(item)}
            </span>
          ))}
        </div>
      );
    }
    return (
      <pre className="overflow-x-auto rounded bg-muted p-2 text-[11px]">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={() => hasData && setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {hasData ? (
          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            已完成
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">无数据</span>
        )}
        {hasData &&
          (expanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ))}
      </button>
      {expanded && hasData && (
        <div className="border-t px-4 py-3 space-y-2">
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className="flex items-start gap-2">
              <span className="shrink-0 text-xs font-medium text-muted-foreground min-w-[100px]">
                {k}:
              </span>
              <div className="text-xs min-w-0">{renderValue(v)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [researching, setResearching] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    nameZh: "",
    websiteUrl: "",
    industry: "",
    targetMarket: "",
  });

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`);
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setClient(data);
      setEditForm({
        name: data.name ?? "",
        nameZh: data.nameZh ?? "",
        websiteUrl: data.websiteUrl ?? "",
        industry: data.industry ?? "",
        targetMarket: data.targetMarket ?? "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  async function handleResearch() {
    setResearching(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${clientId}/research`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "研究失败");
      }
      fetchClient();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setResearching(false);
    }
  }

  async function handleDelete() {
    if (!confirm("确定删除此客户？相关提案不会被删除。")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("删除失败");
      router.push("/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setDeleting(false);
    }
  }

  async function handleSaveEdit() {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          nameZh: editForm.nameZh || undefined,
          websiteUrl: editForm.websiteUrl,
          industry: editForm.industry || undefined,
          targetMarket: editForm.targetMarket || undefined,
        }),
      });
      if (!res.ok) throw new Error("保存失败");
      setEditing(false);
      fetchClient();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">客户不存在</p>
        <Link href="/clients">
          <Button variant="outline" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/clients">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {client.nameZh ?? client.name}
              {client.nameZh && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  {client.name}
                </span>
              )}
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              <a
                href={client.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                {client.websiteUrl.replace(/^https?:\/\//, "")}
                <ExternalLink className="ml-1 inline h-3 w-3" />
              </a>
              {client.industry && (
                <>
                  <span>·</span>
                  <span>{client.industry}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setEditing(!editing)}
            className="gap-1.5"
          >
            <Pencil className="h-4 w-4" />
            编辑
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-1.5"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            删除
          </Button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold">编辑客户信息</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                名称 (英文)
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                名称 (中文)
              </label>
              <input
                type="text"
                value={editForm.nameZh}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, nameZh: e.target.value }))
                }
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                官网 URL
              </label>
              <input
                type="url"
                value={editForm.websiteUrl}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, websiteUrl: e.target.value }))
                }
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                行业
              </label>
              <input
                type="text"
                value={editForm.industry}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, industry: e.target.value }))
                }
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                目标市场
              </label>
              <input
                type="text"
                value={editForm.targetMarket}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, targetMarket: e.target.value }))
                }
                className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveEdit} size="sm">
              保存
            </Button>
            <Button
              variant="outline"
              onClick={() => setEditing(false)}
              size="sm"
            >
              取消
            </Button>
          </div>
        </div>
      )}

      {/* Research data */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">研究数据</h2>
            <p className="text-xs text-muted-foreground">
              {client.researchedAt
                ? `最后研究时间：${new Date(client.researchedAt).toLocaleString("zh-CN")}`
                : "尚未进行 AI 研究"}
            </p>
          </div>
          <Button
            onClick={handleResearch}
            disabled={researching}
            className="gap-1.5"
          >
            {researching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="h-4 w-4" />
            )}
            {client.researchedAt ? "重新研究" : "开始研究"}
          </Button>
        </div>

        {RESEARCH_SECTIONS.map((s) => (
          <ResearchPanel
            key={s.key}
            label={s.label}
            description={s.description}
            data={
              (client[s.key as keyof Client] as Record<string, unknown> | null) ??
              null
            }
          />
        ))}
      </div>

      {/* Associated proposals */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">关联提案</h2>
          <Link href={`/proposals/new`}>
            <Button size="sm" className="gap-1.5">
              新建提案
            </Button>
          </Link>
        </div>
        {client.proposals.length === 0 ? (
          <div className="mt-3 rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
            暂无关联提案
          </div>
        ) : (
          <div className="mt-3 rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">标题</th>
                  <th className="px-6 py-3 font-medium">状态</th>
                  <th className="px-6 py-3 font-medium">质量分</th>
                  <th className="px-6 py-3 font-medium">更新时间</th>
                </tr>
              </thead>
              <tbody>
                {client.proposals.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/proposals/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[p.status]}`}
                      >
                        {STATUS_LABELS[p.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {p.qualityScore ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(p.updatedAt).toLocaleDateString("zh-CN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
