"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type InvoiceStyleValue = {
  fontFamily?: "inter" | "serif" | "mono";
  baseFontSize?: number;
  headingWeight?: number;
  accentColor?: string;
  borderStyle?: "none" | "thin" | "medium";
  borderRadius?: number;
  tableStyle?: "lines" | "boxed";
  zebraRows?: boolean;
  spacing?: "compact" | "normal" | "spacious";
};

export function InvoiceStylePanel({
  value,
  onChange,
  title,
}: {
  value: InvoiceStyleValue | null | undefined;
  onChange: (next: InvoiceStyleValue) => void;
  title: string;
}) {
  const v = value ?? {};

  const set = <K extends keyof InvoiceStyleValue>(key: K, next: InvoiceStyleValue[K]) => {
    onChange({ ...v, [key]: next });
  };

  return (
    <div className="space-y-4 rounded-lg border bg-muted/10 p-4">
      <div className="text-sm font-semibold">{title}</div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Font</Label>
          <Select value={v.fontFamily ?? "inter"} onValueChange={(val) => set("fontFamily", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inter">Sans</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="mono">Mono</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Accent Color</Label>
          <Input value={v.accentColor ?? "#111111"} onChange={(e) => set("accentColor", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Base Size</Label>
          <Input
            type="number"
            value={v.baseFontSize ?? 12}
            onChange={(e) => set("baseFontSize", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Heading Weight</Label>
          <Input
            type="number"
            value={v.headingWeight ?? 700}
            onChange={(e) => set("headingWeight", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Spacing</Label>
          <Select value={v.spacing ?? "normal"} onValueChange={(val) => set("spacing", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Spacing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">Compact</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="spacious">Spacious</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Border</Label>
          <Select value={v.borderStyle ?? "thin"} onValueChange={(val) => set("borderStyle", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Border" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="thin">Thin</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Radius</Label>
          <Input
            type="number"
            value={v.borderRadius ?? 10}
            onChange={(e) => set("borderRadius", Number(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <Label>Table</Label>
          <Select value={v.tableStyle ?? "lines"} onValueChange={(val) => set("tableStyle", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Table" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lines">Lines</SelectItem>
              <SelectItem value="boxed">Boxed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={Boolean(v.zebraRows)}
          onChange={(e) => set("zebraRows", e.target.checked)}
        />
        Zebra rows
      </label>
    </div>
  );
}

