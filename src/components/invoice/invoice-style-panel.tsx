"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type InvoiceStyleValue = {
  headerLayout?: "split" | "left" | "right" | "center";
  showLogo?: boolean;
  logoSize?: "sm" | "md" | "lg";
  fontFamily?: "inter" | "serif" | "mono";
  baseFontSize?: number;
  headingWeight?: number;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  tableHeaderBg?: string;
  borderStyle?: "none" | "thin" | "medium";
  borderRadius?: number;
  tableStyle?: "lines" | "boxed";
  showColumnBorders?: boolean;
  rowSeparator?: "none" | "thin" | "medium";
  cellPadding?: "sm" | "md" | "lg";
  zebraRows?: boolean;
  zebraColor?: string;
  titleFontSize?: number;
  labelFontSize?: number;
  bodyFontSize?: number;
  uppercaseLabels?: boolean;
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
          <Label>Header Layout</Label>
          <Select value={v.headerLayout ?? "split"} onValueChange={(val) => set("headerLayout", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Header Layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="split">Split</SelectItem>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
          <Label>Title Size</Label>
          <Input
            type="number"
            value={v.titleFontSize ?? 32}
            onChange={(e) => set("titleFontSize", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Label Size</Label>
          <Input
            type="number"
            value={v.labelFontSize ?? 10}
            onChange={(e) => set("labelFontSize", Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label>Body Size</Label>
          <Input
            type="number"
            value={v.bodyFontSize ?? 12}
            onChange={(e) => set("bodyFontSize", Number(e.target.value))}
          />
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

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Row Separator</Label>
          <Select value={v.rowSeparator ?? "thin"} onValueChange={(val) => set("rowSeparator", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Row Separator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="thin">Thin</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Cell Padding</Label>
          <Select value={v.cellPadding ?? "md"} onValueChange={(val) => set("cellPadding", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Cell Padding" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Table Header BG</Label>
          <Input value={v.tableHeaderBg ?? "#f9fafb"} onChange={(e) => set("tableHeaderBg", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Background</Label>
          <Input value={v.backgroundColor ?? "#ffffff"} onChange={(e) => set("backgroundColor", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Text</Label>
          <Input value={v.textColor ?? "#111111"} onChange={(e) => set("textColor", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Muted</Label>
          <Input value={v.mutedColor ?? "#6b7280"} onChange={(e) => set("mutedColor", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Border Color</Label>
          <Input value={v.borderColor ?? "#e5e7eb"} onChange={(e) => set("borderColor", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Zebra Color</Label>
          <Input value={v.zebraColor ?? "#f9fafb"} onChange={(e) => set("zebraColor", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Logo</Label>
          <Select value={v.logoSize ?? "md"} onValueChange={(val) => set("logoSize", val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Logo Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={Boolean(v.showLogo ?? true)}
            onChange={(e) => set("showLogo", e.target.checked)}
          />
          Show logo
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={Boolean(v.uppercaseLabels ?? true)}
            onChange={(e) => set("uppercaseLabels", e.target.checked)}
          />
          Uppercase labels
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={Boolean(v.showColumnBorders)}
            onChange={(e) => set("showColumnBorders", e.target.checked)}
          />
          Column borders
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={Boolean(v.zebraRows)}
            onChange={(e) => set("zebraRows", e.target.checked)}
          />
          Zebra rows
        </label>
      </div>
    </div>
  );
}
