"use client";

import { AssetProvider } from "./AssetProvider";
import type { AssetRow } from "@/lib/content";
import type { ReactNode } from "react";

interface AssetProviderWrapperProps {
  entries: AssetRow[];
  children: ReactNode;
}

export function AssetProviderWrapper({
  entries,
  children,
}: AssetProviderWrapperProps) {
  const assets = new Map<string, AssetRow>();
  for (const row of entries) {
    assets.set(row.asset_key, row);
  }
  return <AssetProvider assets={assets}>{children}</AssetProvider>;
}
