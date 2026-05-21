import { FileText, PenTool, Send, Star, RefreshCcw, Rocket, ArrowRight, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProposalRowActions from "@/components/proposal/row-actions";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [totalProposals, activeDrafts, sentThisMonth, proposals] =
    await Promise.all([
      prisma.proposal.count(),
      prisma.proposal.count({ where: { status: "DRAFT" } }),
      prisma.proposal.count({
        where: {
          status: "SENT",
          updatedAt: {
            gte: new Date(
              new Date().getFullYear(),
              new Date().getMonth(),
              1
            ),
          },
        },
      }),
      prisma.proposal.findMany({
        include: {
          client: { select: { name: true } },
          author: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

  // Calculate average quality score
  const scored = await prisma.proposal.findMany({
    where: { qualityScore: { not: null } },
    select: { qualityScore: true },
  });
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((sum, p) => sum + (p.qualityScore ?? 0), 0) /
            scored.length
        )
      : null;

  const stats = [
    { label: "总提案", value: String(totalProposals), icon: FileText },
    { label: "活跃草稿", value: String(activeDrafts), icon: PenTool },
    { label: "本月发送", value: String(sentThisMonth), icon: Send },
    {
      label: "平均质量分",
      value: avgScore !== null ? `${avgScore}` : "—",
      icon: Star,
    },
  ];

  const isEmpty = totalProposals === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">工作台</h1>
        <p className="text-sm text-muted-foreground">概览你的提案工作</p>
      </div>

      {/* Hero CTA */}
      <div className={`rounded-2xl border bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-zinc-900 ${isEmpty ? "px-8 py-14" : "px-8 py-10"}`}>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            AI 驱动
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEmpty ? "开始你的第一个提案" : "创建新提案"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {isEmpty
              ? "输入客户官网，AI 自动完成研究与提案生成，几分钟内交付专业提案"
              : "输入客户官网，AI 自动完成研究与提案生成"}
          </p>

          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/proposals/new?type=upgrade"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:border-indigo-400 hover:shadow-md dark:border-indigo-800 dark:bg-zinc-900 dark:hover:border-indigo-600"
            >
              <RefreshCcw className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              官网升级提案
            </Link>
            <Link
              href="/proposals/new?type=greenfield"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold shadow-sm transition-all hover:border-emerald-400 hover:shadow-md dark:border-emerald-800 dark:bg-zinc-900 dark:hover:border-emerald-600"
            >
              <Rocket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              全新建站提案
            </Link>
          </div>

          <p className="mt-4">
            <Link
              href="/clients"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              从已有客户档案创建
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>
      </div>

      {/* Stat cards — hidden when no proposals */}
      {!isEmpty && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent proposals — hidden when no proposals */}
      {!isEmpty && (
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="font-semibold">近期提案</h2>
          <Link
            href="/proposals"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            查看全部
          </Link>
        </div>
        {proposals.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            暂无提案，点击右上角「新建提案」开始
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">标题</th>
                  <th className="px-6 py-3 font-medium">客户</th>
                  <th className="px-6 py-3 font-medium">质量分</th>
                  <th className="px-6 py-3 font-medium">更新时间</th>
                  <th className="px-6 py-3 font-medium w-24" />
                </tr>
              </thead>
              <tbody>
                {proposals.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-6 py-3">
                      <Link
                        href={`/proposals/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {p.client.name}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {p.qualityScore ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {p.updatedAt.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-6 py-3">
                      <ProposalRowActions
                        proposalId={p.id}
                        proposalTitle={p.title}
                        clientId={p.clientId}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

    </div>
  );
}
