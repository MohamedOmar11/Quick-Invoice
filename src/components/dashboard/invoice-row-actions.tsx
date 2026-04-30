"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MoreVertical, Edit, Copy, Trash } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function InvoiceRowActions({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Dialog open={deleteOpen} onOpenChange={(o) => (busy ? null : setDeleteOpen(o))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete invoice?</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">This action can’t be undone.</div>
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const res = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
                  if (res.ok) {
                    setDeleteOpen(false);
                    router.refresh();
                  }
                } finally {
                  setBusy(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md text-muted-foreground hover:bg-muted" aria-label="Open menu">
              <MoreVertical className="h-4 w-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link href={`/dashboard/invoice/${invoiceId}`} className="flex items-center w-full">
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={busy}
            onSelect={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const res = await fetch(`/api/invoices/${invoiceId}/duplicate`, { method: "POST" });
                if (!res.ok) return;
                const data = await res.json();
                if (data?.id) router.push(`/dashboard/invoice/${data.id}?duplicated=1`);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Copy className="mr-2 h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            disabled={busy}
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

