"use client";

import { useContent } from "./ContentProvider";
import { useItemScope } from "./ItemProvider";
import type { ElementType, HTMLAttributes } from "react";

/**
 * Zero-fallback editable **plain text** component.
 *
 * Renders the DB value as a React text child — React auto-escapes it,
 * so HTML-meaningful characters like < > & render as literal text.
 * For rich/HTML content, use EditableRichText instead.
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
  const scope = useItemScope();

  // Inside an ItemProvider, prepend the list scope to the fieldKey
  const resolvedKey = scope
    ? `${scope.prefix}.${scope.indexKey}.${fieldKey}`
    : fieldKey;

  const row = content.get(resolvedKey);

  if (!row) {
    if (process.env.NODE_ENV === "development") {
      return (
        <Tag
          className={className}
          style={{ color: "red", fontWeight: "bold" }}
          {...rest}
        >
          [MISSING: {resolvedKey}]
        </Tag>
      );
    }
    return null;
  }

  return (
    <Tag className={className} {...rest}>
      {row.value}
    </Tag>
  );
}
