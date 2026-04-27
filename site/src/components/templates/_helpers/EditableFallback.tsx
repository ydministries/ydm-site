"use client";

import type { ElementType, HTMLAttributes } from "react";
import { useContent } from "@/components/ContentProvider";
import { useItemScope } from "@/components/ItemProvider";
import { EditableContent } from "@/components/EditableContent";
import { EditableRichText } from "@/components/EditableRichText";

/**
 * Try a list of field_keys in order; render the first one that has a non-empty
 * value via EditableContent (text mode) or EditableRichText (rich mode). If
 * none resolve, render `fallback` as plain text. If no fallback, render null
 * in production; in development show a [MISSING:…] marker.
 *
 * This is a CLIENT component because it relies on useContent() context. The
 * surrounding template can still be a server component — this just sits at
 * the leaves where editable text lives.
 */
type Mode = "text" | "rich";

interface EditableFallbackProps extends HTMLAttributes<HTMLElement> {
  keys: string[];
  as?: ElementType;
  fallback?: string;
  mode?: Mode;
}

export function EditableFallback({
  keys,
  as = "span",
  fallback,
  mode = "text",
  className,
  ...rest
}: EditableFallbackProps) {
  const { content } = useContent();
  const scope = useItemScope();

  const resolveKey = (k: string) =>
    scope ? `${scope.prefix}.${scope.indexKey}.${k}` : k;

  const winner = keys.find((k) => {
    const row = content.get(resolveKey(k));
    return !!row && (row.value ?? "").trim() !== "";
  });

  if (winner) {
    return mode === "rich" ? (
      <EditableRichText fieldKey={winner} className={className} />
    ) : (
      <EditableContent fieldKey={winner} as={as} className={className} {...rest} />
    );
  }

  if (fallback) {
    const Tag = as as ElementType;
    return mode === "rich" ? (
      <Tag className={className} {...rest}>{fallback}</Tag>
    ) : (
      <Tag className={className} {...rest}>{fallback}</Tag>
    );
  }

  if (process.env.NODE_ENV === "development") {
    return (
      <span
        className={className}
        style={{ color: "red", fontWeight: 700, border: "1px dashed red", padding: "2px 6px" }}
      >
        [MISSING: {keys.join(" | ")}]
      </span>
    );
  }
  return null;
}
