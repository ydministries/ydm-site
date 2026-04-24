"use client";

import { useContent } from "./ContentProvider";
import type { HTMLAttributes } from "react";

/**
 * Renders richtext / html / markdown content from the DB.
 * Uses dangerouslySetInnerHTML — DOMPurify sanitization will be
 * added when isomorphic-dompurify is installed (Step 9).
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
  const row = content.get(fieldKey);

  if (!row) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div
          className={className}
          style={{ color: "red", fontWeight: "bold" }}
          {...rest}
        >
          [MISSING: {fieldKey}]
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: row.value }}
      {...rest}
    />
  );
}
