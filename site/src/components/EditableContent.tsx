"use client";

import { useContent } from "./ContentProvider";
import { useItemScope } from "./ItemProvider";
import { useAdminEdit } from "./admin/AdminEditProvider";
import type { ElementType, HTMLAttributes, MouseEvent } from "react";

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
 * Admin mode: when an admin/bishop is signed in, hovering shows a gold
 * dotted outline + ✎ badge; clicking opens the inline edit modal.
 */
interface EditableContentProps extends HTMLAttributes<HTMLElement> {
  fieldKey: string;
  as?: ElementType;
}

export function EditableContent({
  fieldKey,
  as: Tag = "span",
  className,
  onClick,
  ...rest
}: EditableContentProps) {
  const { content, pageKey } = useContent();
  const scope = useItemScope();
  const { isAdmin, openEdit } = useAdminEdit();

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

  if (!isAdmin) {
    return (
      <Tag className={className} {...rest}>
        {row.value}
      </Tag>
    );
  }

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    openEdit({
      pageKey,
      fieldKey: resolvedKey,
      currentValue: row.value,
      valueType: "text",
    });
    onClick?.(e);
  };

  const adminClass =
    "ydm-editable group relative cursor-pointer outline-dashed outline-1 outline-offset-2 outline-transparent transition-[outline-color] hover:outline-ydm-gold/70";

  return (
    <Tag
      className={`${className ?? ""} ${adminClass}`.trim()}
      onClick={handleClick}
      title={`Edit: ${resolvedKey}`}
      {...rest}
    >
      {row.value}
    </Tag>
  );
}
