"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Loader2, FileCode, Plus, Trash2 } from "lucide-react";

interface Template {
  id: string;
  name: string;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { proposals: number };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCss, setFormCss] = useState("");
  const [formHtml, setFormHtml] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function fetchTemplates() {
    try {
      const res = await fetch("/api/templates");
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      setTemplates(data.templates ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          cssContent: formCss,
          htmlSkeleton: formHtml,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "创建失败");
      }
      setShowForm(false);
      setFormName("");
      setFormCss("");
      setFormHtml("");
      fetchTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">模板管理</h1>
          <p className="text-sm text-muted-foreground">
            管理提案 HTML/CSS 模板（仅管理员）
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          新建模板
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border bg-card p-5 shadow-sm space-y-4"
        >
          <h3 className="text-sm font-semibold">创建新模板</h3>
          <div>
            <label className="mb-1 block text-xs font-medium">模板名称</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Sitesfy 默认模板 v2"
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">CSS 内容</label>
            <textarea
              value={formCss}
              onChange={(e) => setFormCss(e.target.value)}
              rows={8}
              placeholder="粘贴模板 CSS..."
              className="w-full rounded-lg border bg-background p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">
              HTML 骨架（含占位符）
            </label>
            <textarea
              value={formHtml}
              onChange={(e) => setFormHtml(e.target.value)}
              rows={8}
              placeholder="粘贴 HTML 骨架..."
              className="w-full rounded-lg border bg-background p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={creating || !formName || !formCss || !formHtml} size="sm">
              {creating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              创建
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              取消
            </Button>
          </div>
        </form>
      )}

      {/* Templates list */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            暂无模板
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border bg-card p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-indigo-500" />
                  <h3 className="text-sm font-semibold">{t.name}</h3>
                </div>
                {t.isLocked && (
                  <Lock className="h-4 w-4 text-amber-500" aria-label="锁定" />
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{t._count.proposals} 个提案使用</span>
                <span>
                  更新于 {new Date(t.updatedAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
