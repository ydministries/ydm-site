"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { AdminEditModal } from "./AdminEditModal";
import { AdminBadge } from "./AdminBadge";

export type EditValueType = "text" | "html";

export interface EditTarget {
  pageKey: string;
  fieldKey: string;
  currentValue: string;
  valueType: EditValueType;
}

interface CtxValue {
  isAdmin: boolean;
  openEdit: (target: EditTarget) => void;
}

const Ctx = createContext<CtxValue>({
  isAdmin: false,
  openEdit: () => {},
});

export function useAdminEdit(): CtxValue {
  return useContext(Ctx);
}

export function AdminEditProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<EditTarget | null>(null);

  const openEdit = useCallback(
    (t: EditTarget) => {
      if (!isAdmin) return;
      setTarget(t);
    },
    [isAdmin],
  );

  const close = useCallback(() => setTarget(null), []);

  return (
    <Ctx.Provider value={{ isAdmin, openEdit }}>
      {children}
      {isAdmin && <AdminBadge />}
      {isAdmin && target && (
        <AdminEditModal target={target} onClose={close} />
      )}
    </Ctx.Provider>
  );
}
