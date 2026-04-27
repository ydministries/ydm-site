"use client";

import { useContent } from "./ContentProvider";
import { useItemScope } from "./ItemProvider";
import { useAssets } from "./AssetProvider";
import type { HTMLAttributes } from "react";

/**
 * Reads a URL value from page_content (via fieldKey), then renders an <img>.
 * If a row in the assets table matches the URL, alt/width/height are pulled
 * from there. Otherwise the URL renders directly with empty alt and lazy
 * loading. Production never shows a placeholder — missing values render null.
 */
interface EditableImageProps extends HTMLAttributes<HTMLImageElement> {
  fieldKey: string;
  alt?: string;
}

export function EditableImage({
  fieldKey,
  alt,
  className,
  ...rest
}: EditableImageProps) {
  const { content } = useContent();
  const scope = useItemScope();
  const assets = useAssets();

  const resolvedKey = scope
    ? `${scope.prefix}.${scope.indexKey}.${fieldKey}`
    : fieldKey;

  const row = content.get(resolvedKey);
  const value = row?.value;

  if (!value) {
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
        >
          [MISSING IMAGE: {resolvedKey}]
        </div>
      );
    }
    return null;
  }

  // Try to find a matching assets row by storage_path or asset_key.
  const assetRow =
    [...assets.values()].find((a) => a.storage_path === value) ??
    assets.get(value);

  const resolvedAlt = alt ?? assetRow?.alt ?? "";
  const width = assetRow?.width ?? undefined;
  const height = assetRow?.height ?? undefined;

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={value}
      alt={resolvedAlt}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      className={className}
      {...rest}
    />
  );
}
