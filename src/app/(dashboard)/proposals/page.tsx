import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProposalRowActions from "@/components/proposal/row-actions";

export const dynamic = "force-dynamic";

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const page = parseInt(sp.page ?? "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { client: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [proposals, total] = await Promise.all([
    prisma.proposal.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        author: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.proposal.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    return `/proposals?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">提案管理</h1>
          <p className="text-sm text-muted-foreground">
            共 {total} 份提案
          </p>
        </div>
        <Link href="/proposals/new">
          <Button className="gap-1.5">
            <Plus className="h-4 w-4" />
            新建提案
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="搜索提案..."
            className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-6 py-3 font-medium">标题</th>
                <th className="px-6 py-3 font-medium">客户</th>
                <th className="px-6 py-3 font-medium">质量分</th>
                <th className="px-6 py-3 font-medium">更新时间</th>
                <th className="px-6 py-3 font-medium w-32" />
              </tr>
            </thead>
            <tbody>
              {proposals.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-muted-foreground"
                  >
                    暂无提案
                  </td>
                </tr>
              ) : (
                proposals.map((p) => (
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
                    <td className="px-6 py-3 text-muted-foreground">
                      {p.client.name}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {p.qualityScore ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {p.updatedAt.toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <ProposalRowActions
                        proposalId={p.id}
                        proposalTitle={p.title}
                        clientId={p.client.id}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 页
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link href={buildUrl({ page: String(page - 1) })}>
                <Button variant="outline" size="sm" className="gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="gap-1" disabled>
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>
            )}
            {page < totalPages ? (
              <Link href={buildUrl({ page: String(page + 1) })}>
                <Button variant="outline" size="sm" className="gap-1">
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button variant="outline" size="sm" className="gap-1" disabled>
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
