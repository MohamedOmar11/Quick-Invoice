"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function LogoutButton({
  variant = "ghost",
  className,
}: {
  variant?: "ghost" | "outline" | "default" | "destructive" | "secondary";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    setLoading(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={variant} className={className}>
            <LogOut className="w-4 h-4 mr-2" />
            Log out
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log out?</DialogTitle>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">Are you sure you want to log out?</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            Log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

