"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { AssetRow } from "@/lib/content";

const AssetContext = createContext<Map<string, AssetRow>>(new Map());

export function useAssets() {
  return useContext(AssetContext);
}

interface AssetProviderProps {
  assets: Map<string, AssetRow>;
  children: ReactNode;
}

/**
 * Provides page-scoped assets to EditableImage children.
 * Assets are serialized from server as entries, reconstructed here.
 */
export function AssetProvider({ assets, children }: AssetProviderProps) {
  return (
    <AssetContext.Provider value={assets}>{children}</AssetContext.Provider>
  );
}
