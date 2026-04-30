"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/utils/uploadthing";

export function SimpleUploader({
  endpoint,
  disabled,
  onUploaded,
  onError,
  onBegin,
  onProgress,
}: {
  endpoint: "paymentScreenshot" | "brandLogo";
  disabled?: boolean;
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
  onBegin?: () => void;
  onProgress?: (progress: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onUploadBegin: () => {
      onBegin?.();
      onProgress?.(0);
    },
    onUploadProgress: (p) => onProgress?.(p),
    onUploadError: (e) => onError?.(typeof (e as any)?.message === "string" ? (e as any).message : "Upload failed"),
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url;
      if (url) onUploaded(url);
    },
  });

  const selectFiles = () => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  };

  const handleFiles = async (files: FileList | null) => {
    const list = files ? Array.from(files) : [];
    if (list.length === 0) return;
    await startUpload(list);
  };

  return (
    <div
      className={`rounded-xl border border-dashed bg-muted/10 p-6 text-center transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-border"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        if (disabled) return;
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        void handleFiles(e.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*"
        disabled={disabled || isUploading}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-background border flex items-center justify-center">
          <UploadCloud className="w-6 h-6 text-muted-foreground" />
        </div>
        <div className="text-sm text-muted-foreground">Drag and drop an image here, or</div>
        <Button type="button" variant="outline" className="rounded-full" onClick={selectFiles} disabled={disabled || isUploading}>
          Choose file
        </Button>
      </div>
    </div>
  );
}

