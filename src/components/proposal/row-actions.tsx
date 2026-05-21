"use client";

import { useRouter } from "next/navigation";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface RowActionsProps {
  proposalId: string;
  proposalTitle: string;
  clientId: string;
}

export default function ProposalRowActions({
  proposalId,
  proposalTitle,
  clientId,
}: RowActionsProps) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("确认删除此提案？此操作不可撤销。")) return;
    await fetch(`/api/proposals/${proposalId}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleDuplicate() {
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${proposalTitle}（副本）`,
        clientId,
        duplicateFrom: proposalId,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/proposals/${data.id}`);
    }
  }

  const btnClass =
    "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <div className="flex items-center gap-1">
      <Link href={`/proposals/${proposalId}`} className={btnClass} title="编辑">
        <Pencil className="h-3.5 w-3.5" />
      </Link>
      <a
        href={`/api/proposals/${proposalId}/html`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnClass}
        title="查看"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
      <button onClick={handleDuplicate} className={btnClass} title="复制">
        <Copy className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleDelete}
        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
        title="删除"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
