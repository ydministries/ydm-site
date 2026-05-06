"use client";

interface RoleSelectProps {
  defaultValue: "admin" | "bishop";
}

/**
 * Tiny client component — auto-submits the parent form when the role
 * dropdown changes. Lives in /admin/users/page.tsx as a per-row control.
 * The form's `action` is the server action `updateRoleAction`; we just
 * trigger submission on change so the admin doesn't need a save button.
 */
export function RoleSelect({ defaultValue }: RoleSelectProps) {
  return (
    <select
      name="role"
      defaultValue={defaultValue}
      onChange={(e) => e.currentTarget.form?.requestSubmit()}
      className="rounded border border-ydm-line bg-ydm-cream px-2 py-1 font-accent text-[10px] uppercase tracking-wider text-ydm-ink"
    >
      <option value="bishop">Bishop</option>
      <option value="admin">Admin</option>
    </select>
  );
}
