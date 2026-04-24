"use client";

import { useContent } from "./ContentProvider";
import type { ElementType, HTMLAttributes } from "react";

/**
 * Zero-fallback editable text component.
 *
 * No `defaultValue`. No `fallback`. No `children`. No `placeholder`.
 * Missing key → loud "[MISSING: fieldKey]" in dev.
 *
 * This is the mechanical guarantee from PLAN.md §2.3.
 */
interface EditableContentProps extends HTMLAttributes<HTMLElement> {
  fieldKey: string;
  as?: ElementType;
}

export function EditableContent({
  fieldKey,
  as: Tag = "span",
  className,
  ...rest
}: EditableContentProps) {
  const { content } = useContent();
  const row = content.get(fieldKey);

  if (!row) {
    if (process.env.NODE_ENV === "development") {
      return (
        <Tag
          className={className}
          style={{ color: "red", fontWeight: "bold" }}
          {...rest}
        >
          [MISSING: {fieldKey}]
        </Tag>
      );
    }
    return null;
  }

  const value = row.value;

  // For richtext/html, render as innerHTML (will add DOMPurify sanitization later)
  if (row.value_type === "richtext" || row.value_type === "html") {
    return (
      <Tag
        className={className}
        dangerouslySetInnerHTML={{ __html: value }}
        {...rest}
      />
    );
  }

  return (
    <Tag className={className} {...rest}>
      {value}
    </Tag>
  );
}
