"use client";

import { createContext, useContext, type ReactNode } from "react";

interface ItemCtx {
  /** The list prefix, e.g. "beliefs" */
  prefix: string;
  /** The numeric index (0-based for sorting) */
  index: number;
  /** The raw index string as it appears in DB keys — "1", "item1", etc. */
  indexKey: string;
}

const ItemContext = createContext<ItemCtx | null>(null);

export function ItemProvider({
  prefix,
  index,
  indexKey,
  children,
}: {
  prefix: string;
  index: number;
  indexKey: string;
  children: ReactNode;
}) {
  return (
    <ItemContext.Provider value={{ prefix, index, indexKey }}>
      {children}
    </ItemContext.Provider>
  );
}

export function useItemScope(): ItemCtx | null {
  return useContext(ItemContext);
}
