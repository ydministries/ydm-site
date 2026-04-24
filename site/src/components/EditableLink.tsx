"use client";

import Link from "next/link";
import { useContent } from "./ContentProvider";
import type { HTMLAttributes } from "react";

/**
 * EditableLink — renders an anchor whose label and href come from a paired set of DB rows.
 * fieldKey is a PREFIX. The component reads:
 *   `${fieldKey}.label` → visible text
 *   `${fieldKey}.href`  → destination URL
 * Example: <EditableLink fieldKey="cta.primary" /> reads cta.primary.label + cta.primary.href.
 *
 * Zero-fallback: missing either row → dev placeholder, prod warn.
 * Do NOT add labelKey/hrefKey/children/fallback props — this interface is intentional.
 */
interface EditableLinkProps extends HTMLAttributes<HTMLAnchorElement> {
  fieldKey: string;
}

export function EditableLink({
  fieldKey,
  className,
  ...rest
}: EditableLinkProps) {
  const { content } = useContent();
  const hrefRow = content.get(`${fieldKey}.href`);
  const labelRow = content.get(`${fieldKey}.label`);

  if (!hrefRow || !labelRow) {
    if (process.env.NODE_ENV === "development") {
      return (
        <span
          className={className}
          style={{ color: "red", fontWeight: "bold" }}
          {...rest}
        >
          [MISSING LINK: {fieldKey}]
        </span>
      );
    }
    return null;
  }

  const href = hrefRow.value;
  const label = labelRow.value;

  // External links
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className} {...rest}>
      {label}
    </Link>
  );
}
