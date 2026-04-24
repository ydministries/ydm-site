"use client";

import { useContent } from "./ContentProvider";
import { useItemScope } from "./ItemProvider";
import type { HTMLAttributes } from "react";

/**
 * Renders an image from the assets table via an asset_key reference
 * stored in page_content. The field's value is the asset_key string
 * (e.g. "home.hero.bg"), which will be resolved to a storage URL
 * once the assets table is populated (Step 3).
 *
 * For now, renders a placeholder with the asset_key for debugging.
 * <img src="..."> is forbidden in page files — use this component.
 */
interface EditableImageProps extends HTMLAttributes<HTMLElement> {
  fieldKey: string;
  alt?: string;
}

export function EditableImage({
  fieldKey,
  alt: _alt,
  className,
  ...rest
}: EditableImageProps) {
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
          style={{
            color: "red",
            fontWeight: "bold",
            border: "2px dashed red",
            padding: "1rem",
            textAlign: "center",
          }}
          {...rest}
        >
          [MISSING IMAGE: {resolvedKey}]
        </div>
      );
    }
    return null;
  }

  // Until assets table is wired, show the asset_key as a placeholder
  return (
    <div
      className={`flex items-center justify-center bg-ydm-ink/10 ${className ?? ""}`}
      {...rest}
    >
      <span className="text-sm text-ydm-ink/40">
        [asset: {row.value}]
      </span>
    </div>
  );
}
