"use client";

import { sanitizeHtml } from "@/lib/sanitize";
import { useContent } from "./ContentProvider";
import { useItemScope } from "./ItemProvider";
import { useAdminEdit } from "./admin/AdminEditProvider";
import type { HTMLAttributes, MouseEvent } from "react";

/**
 * Renders richtext / html / markdown content from the DB.
 * All HTML is sanitized via lib/sanitize before rendering.
 *
 * Admin mode: signed-in editors see a hover affordance + click-to-edit modal
 * exactly like EditableContent. The modal opens with valueType="html".
 */
interface EditableRichTextProps extends HTMLAttributes<HTMLDivElement> {
  fieldKey: string;
}

export function EditableRichText({
  fieldKey,
  className,
  onClick,
  ...rest
}: EditableRichTextProps) {
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
        <div
          className={className}
          style={{ color: "red", fontWeight: "bold" }}
          {...rest}
        >
          [MISSING: {resolvedKey}]
        </div>
      );
    }
    return null;
  }

  const html = sanitizeHtml(row.value);

  if (!isAdmin) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
        {...rest}
      />
    );
  }

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    // Allow links inside rich text to remain clickable for the editor.
    const t = e.target as HTMLElement;
    if (t.closest("a")) return;
    e.preventDefault();
    e.stopPropagation();
    openEdit({
      pageKey,
      fieldKey: resolvedKey,
      currentValue: row.value,
      valueType: "html",
    });
    onClick?.(e);
  };

  const adminClass =
    "ydm-editable group relative cursor-pointer outline-dashed outline-1 outline-offset-2 outline-transparent transition-[outline-color] hover:outline-ydm-gold/70";

  return (
    <div
      className={`${className ?? ""} ${adminClass}`.trim()}
      onClick={handleClick}
      title={`Edit (rich text): ${resolvedKey}`}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  );
}
