"use client";

import { useMemo, useState, useTransition } from "react";
import { saveContentField, type SaveResult } from "../actions";

export interface FieldData {
  pageKey: string;
  fieldKey: string;
  value: string;
  valueType: string;
  updatedAt: string;
}

interface Group {
  id: string;
  label: string;
  fields: FieldData[];
  defaultOpen: boolean;
}

const GROUP_DEFS: Array<{
  id: string;
  label: string;
  defaultOpen: boolean;
  match: (k: string) => boolean;
}> = [
  {
    id: "metadata",
    label: "Metadata",
    defaultOpen: true,
    match: (k) =>
      k.startsWith("meta.") ||
      k === "slug" ||
      k.startsWith("scripture") ||
      k === "date" ||
      k === "published_at" ||
      k === "author",
  },
  {
    id: "headings",
    label: "Headings",
    defaultOpen: true,
    match: (k) => /^h[1-6]\./.test(k) || k === "tagline" || k === "subtitle",
  },
  {
    id: "body",
    label: "Body",
    defaultOpen: true,
    match: (k) =>
      k.startsWith("p.") ||
      k.startsWith("list.") ||
      k.startsWith("quote.") ||
      k.startsWith("block.") ||
      k === "body_html" ||
      k === "body" ||
      k.startsWith("body."),
  },
  {
    id: "assets",
    label: "Assets",
    defaultOpen: false,
    match: (k) =>
      k.startsWith("image.") ||
      k === "thumbnail_url" ||
      k === "hero_image" ||
      k === "audio_filename" ||
      k === "audio_url" ||
      k === "portrait_url" ||
      k === "video_url",
  },
  {
    id: "form",
    label: "Form fields",
    defaultOpen: false,
    match: (k) => k.startsWith("form."),
  },
];

function groupFields(fields: FieldData[]): Group[] {
  const buckets: Record<string, FieldData[]> = {};
  const order: string[] = [];

  function push(id: string, f: FieldData) {
    if (!buckets[id]) {
      buckets[id] = [];
      order.push(id);
    }
    buckets[id].push(f);
  }

  for (const f of fields) {
    const g = GROUP_DEFS.find((d) => d.match(f.fieldKey));
    push(g?.id ?? "other", f);
  }

  return order.map((id) => {
    const def = GROUP_DEFS.find((d) => d.id === id);
    return {
      id,
      label: def?.label ?? "Other",
      defaultOpen: def?.defaultOpen ?? false,
      fields: buckets[id],
    };
  });
}

export function EditForm({ fields }: { fields: FieldData[] }) {
  const groups = useMemo(() => groupFields(fields), [fields]);

  return (
    <div className="space-y-3">
      {groups.map((g) => (
        <details
          key={g.id}
          open={g.defaultOpen}
          className="overflow-hidden rounded-lg border border-ydm-line bg-ydm-surface"
        >
          <summary className="cursor-pointer list-none border-b border-transparent px-4 py-3 text-sm font-semibold text-ydm-ink hover:bg-ydm-cream [&::-webkit-details-marker]:hidden [details[open]>&]:border-ydm-line">
            <span className="font-display uppercase tracking-wide">
              {g.label}
            </span>
            <span className="ml-2 text-xs font-normal text-ydm-muted">
              {g.fields.length}
            </span>
          </summary>
          <div className="divide-y divide-ydm-line">
            {g.fields.map((f) => (
              <FieldRow key={f.fieldKey} field={f} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

type Status =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

function FieldRow({ field }: { field: FieldData }) {
  const [value, setValue] = useState(field.value);
  const [savedValue, setSavedValue] = useState(field.value);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  const dirty = value !== savedValue;

  function handleSave() {
    setStatus({ kind: "saving" });
    startTransition(async () => {
      const res: SaveResult = await saveContentField({
        pageKey: field.pageKey,
        fieldKey: field.fieldKey,
        newValue: value,
      });
      if (res.ok) {
        setSavedValue(value);
        setStatus({ kind: "saved" });
        setTimeout(() => {
          setStatus((s) => (s.kind === "saved" ? { kind: "idle" } : s));
        }, 2000);
      } else {
        setStatus({ kind: "error", message: res.error });
      }
    });
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={`${field.pageKey}__${field.fieldKey}`}
          className="font-mono text-xs text-ydm-muted"
        >
          {field.fieldKey}
        </label>
        <span className="font-accent text-[10px] uppercase tracking-wider text-ydm-muted">
          {field.valueType}
        </span>
      </div>

      <FieldInput
        id={`${field.pageKey}__${field.fieldKey}`}
        valueType={field.valueType}
        value={value}
        onChange={setValue}
      />

      <div className="mt-2 flex items-center justify-between gap-2">
        <StatusLabel status={status} dirty={dirty} />
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || isPending}
          className="rounded border border-ydm-line bg-ydm-surface px-3 py-1.5 text-xs font-medium text-ydm-ink hover:border-ydm-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

function StatusLabel({
  status,
  dirty,
}: {
  status: Status;
  dirty: boolean;
}) {
  if (status.kind === "saving")
    return <span className="text-xs text-ydm-muted">Saving…</span>;
  if (status.kind === "saved")
    return <span className="text-xs text-emerald-700">Saved ✓</span>;
  if (status.kind === "error")
    return (
      <span className="text-xs text-red-700">Error: {status.message}</span>
    );
  if (dirty)
    return <span className="text-xs text-ydm-muted">Unsaved changes</span>;
  return <span className="text-xs text-ydm-muted">&nbsp;</span>;
}

function FieldInput({
  id,
  valueType,
  value,
  onChange,
}: {
  id: string;
  valueType: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const cls =
    "mt-1 w-full rounded border border-ydm-line bg-ydm-surface px-3 py-2 font-serif text-sm text-ydm-ink focus:border-ydm-gold focus:outline-none";

  if (valueType === "json") {
    return (
      <textarea
        id={id}
        readOnly
        rows={6}
        value={value}
        className={`${cls} cursor-not-allowed bg-ydm-cream font-mono text-xs`}
      />
    );
  }
  if (valueType === "html") {
    return (
      <textarea
        id={id}
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${cls} font-mono text-xs`}
      />
    );
  }
  if (valueType === "url") {
    return (
      <input
        id={id}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cls}
      />
    );
  }
  // 'text' or unknown
  if (value.length > 80 || value.includes("\n")) {
    return (
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cls}
      />
    );
  }
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cls}
    />
  );
}
