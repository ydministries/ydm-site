"use client";

import Link from "next/link";
import { useContent } from "./ContentProvider";
import type { HTMLAttributes } from "react";

/**
 * Editable link — reads both href and label from page_content.
 *
 * Convention: the href field_key ends in ".href" and the label
 * field_key ends in ".label". Pass the base prefix as fieldKey
 * (e.g. "hero.cta_primary") and this component reads both
 * "{fieldKey}.href" and "{fieldKey}.label".
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
