"use client";

import { ContentProvider } from "./ContentProvider";
import type { ContentRow } from "@/lib/content";
import type { ReactNode } from "react";

/**
 * Bridges the server→client serialization gap.
 * Server components pass content as a plain array (JSON-safe).
 * This wrapper reconstructs the Map for ContentProvider.
 */
interface ContentProviderWrapperProps {
  pageKey: string;
  entries: ContentRow[];
  children: ReactNode;
}

export function ContentProviderWrapper({
  pageKey,
  entries,
  children,
}: ContentProviderWrapperProps) {
  const content = new Map<string, ContentRow>();
  for (const row of entries) {
    content.set(row.field_key, row);
  }

  return (
    <ContentProvider pageKey={pageKey} content={content}>
      {children}
    </ContentProvider>
  );
}
