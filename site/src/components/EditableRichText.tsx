"use client";

import DOMPurify from "isomorphic-dompurify";
import { useContent } from "./ContentProvider";
import { useItemScope } from "./ItemProvider";
import type { HTMLAttributes } from "react";

/**
 * Renders richtext / html / markdown content from the DB.
 * All HTML is sanitized via DOMPurify before rendering.
 */
interface EditableRichTextProps extends HTMLAttributes<HTMLDivElement> {
  fieldKey: string;
}

export function EditableRichText({
  fieldKey,
  className,
  ...rest
}: EditableRichTextProps) {
  const { content } = useContent();
  const scope = useItemScope();
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

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(row.value) }}
      {...rest}
    />
  );
}
