import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameZh: { contains: search, mode: "insensitive" } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      _count: { select: { proposals: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">客户档案</h1>
          <p className="text-sm text-muted-foreground">
            共 {clients.length} 个客户
          </p>
        </div>
        <Link href="/proposals/new">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            添加客户
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="搜索客户..."
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">客户名称</th>
                <th className="px-6 py-3 font-medium">官网</th>
                <th className="px-6 py-3 font-medium">行业</th>
                <th className="px-6 py-3 font-medium">已研究</th>
                <th className="px-6 py-3 font-medium">提案数</th>
                <th className="px-6 py-3 font-medium">更新时间</th>
                <th className="px-6 py-3 font-medium w-24" />
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-16 text-center text-muted-foreground"
                  >
                    暂无客户
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/clients/${c.id}`}
                        className="font-medium hover:underline"
                      >
                        {c.nameZh ?? c.name}
                      </Link>
                      {c.nameZh && (
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {c.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <a
                        href={c.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {c.websiteUrl.replace(/^https?:\/\//, "")}
                      </a>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {c.industry ?? "—"}
                    </td>
                    <td className="px-6 py-3">
                      {c.researchedAt ? (
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          已研究
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          未研究
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {c._count.proposals}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {c.updatedAt.toLocaleDateString("zh-CN")}
                    </td>
                    <td className="px-6 py-3">
                      <Link
                        href={`/proposals/new?type=upgrade&clientId=${c.id}`}
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        生成提案
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
