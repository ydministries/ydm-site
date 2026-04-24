"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ContentRow } from "@/lib/content";

interface ContentContextValue {
  pageKey: string;
  content: Map<string, ContentRow>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return ctx;
}

interface ContentProviderProps {
  pageKey: string;
  content: Map<string, ContentRow>;
  children: ReactNode;
}

/**
 * Page-level context provider. Loads all content rows for a page once,
 * making them available to all EditableContent children via context.
 *
 * Content is serialized from the server component as entries array,
 * then reconstructed into a Map on the client.
 */
export function ContentProvider({
  pageKey,
  content,
  children,
}: ContentProviderProps) {
  return (
    <ContentContext.Provider value={{ pageKey, content }}>
      {children}
    </ContentContext.Provider>
  );
}
