"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Check, Eye, EyeOff, Key, Loader2, Save, User } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();

  /* ── Profile ── */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  /* ── Password ── */
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(
    null
  );

  /* ── API Key ── */
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setEmail(session.user.email ?? "");
    }
  }, [session]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.anthropicKeySet) setApiKey("sk-ant-••••••••");
      })
      .catch(() => {});
  }, []);

  async function handleSaveProfile() {
    setSavingProfile(true);
    setError("");
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("保存失败");
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword() {
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: "两次密码不一致" });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: "密码至少 6 位" });
      return;
    }
    setSavingPw(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "修改失败");
      }
      setPwMsg({ ok: true, text: "密码已更新" });
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err) {
      setPwMsg({
        ok: false,
        text: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSavingPw(false);
    }
  }

  async function handleSaveApiKey() {
    setSavingKey(true);
    setError("");
    try {
      const res = await fetch("/api/settings/api-key", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anthropicApiKey: apiKey }),
      });
      if (!res.ok) throw new Error("保存失败");
      setKeySaved(true);
      setApiKey("sk-ant-••••••••");
      setShowKey(false);
      setTimeout(() => setKeySaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingKey(false);
    }
  }

  const inputCls =
    "h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">设置</h1>
        <p className="text-sm text-muted-foreground">
          管理个人资料和平台配置
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">个人资料</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              姓名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              disabled
              className={`${inputCls} opacity-60 cursor-not-allowed`}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveProfile}
            disabled={savingProfile || !name.trim()}
            size="sm"
            className="gap-1"
          >
            {savingProfile ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : profileSaved ? (
              <Check className="h-3 w-3" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            {profileSaved ? "已保存" : "保存"}
          </Button>
          {session?.user &&
            (session.user as { role?: string }).role === "ADMIN" && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                管理员
              </span>
            )}
        </div>
      </section>

      {/* Password */}
      <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">修改密码</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              当前密码
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                新密码
              </label>
              <input
                type={showPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                确认新密码
              </label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleChangePassword}
            disabled={savingPw || !currentPw || !newPw || !confirmPw}
            size="sm"
            className="gap-1"
          >
            {savingPw && <Loader2 className="h-3 w-3 animate-spin" />}
            修改密码
          </Button>
          {pwMsg && (
            <span
              className={`text-xs ${
                pwMsg.ok
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {pwMsg.text}
            </span>
          )}
        </div>
      </section>

      {/* API Key */}
      <section className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-indigo-500" />
          <h2 className="text-sm font-semibold">Anthropic API Key</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          用于 AI 研究和提案生成。密钥仅存储在服务端环境变量中。
        </p>
        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            className={`${inputCls} font-mono text-xs pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showKey ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveApiKey}
            disabled={
              savingKey || !apiKey.trim() || apiKey === "sk-ant-••••••••"
            }
            size="sm"
            className="gap-1"
          >
            {savingKey ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : keySaved ? (
              <Check className="h-3 w-3" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            {keySaved ? "已保存" : "保存"}
          </Button>
        </div>
      </section>

      {/* Platform info */}
      <section className="rounded-xl border bg-card p-5 shadow-sm space-y-2">
        <h2 className="text-sm font-semibold">平台信息</h2>
        <div className="grid gap-1 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>版本</span>
            <span className="font-mono">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>技术栈</span>
            <span>Next.js + Prisma + Claude API</span>
          </div>
          <div className="flex justify-between">
            <span>部署</span>
            <span>Vercel Pro + Supabase</span>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
