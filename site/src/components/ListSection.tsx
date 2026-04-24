"use client";

import { EditableList } from "./EditableList";
import { EditableContent } from "./EditableContent";
import { EditableRichText } from "./EditableRichText";
import { EditableLink } from "./EditableLink";

/**
 * Pre-built list section variants for codegen output.
 * These are client components that wrap EditableList with
 * render callbacks, avoiding the server→client function prop issue.
 */

/** Link-pair list: each item has .href + .label */
export function LinkList({
  itemPrefix,
  className,
}: {
  itemPrefix: string;
  className?: string;
}) {
  return (
    <EditableList
      itemPrefix={itemPrefix}
      className={className}
      render={() => <EditableLink />}
    />
  );
}

/** Text list: each item has a .label */
export function TextList({
  itemPrefix,
  className,
}: {
  itemPrefix: string;
  className?: string;
}) {
  return (
    <EditableList
      itemPrefix={itemPrefix}
      className={className}
      render={() => <EditableContent fieldKey="label" as="li" />}
    />
  );
}

/** Content block list: each item has .title + .body */
export function ContentBlockList({
  itemPrefix,
  subKeys,
  className,
}: {
  itemPrefix: string;
  subKeys: Array<{ key: string; as: string; type: "text" | "richtext" | "link" }>;
  className?: string;
}) {
  return (
    <EditableList
      itemPrefix={itemPrefix}
      className={className}
      render={() => (
        <div>
          {subKeys.map((sk) => {
            if (sk.type === "link") return <EditableLink key={sk.key} />;
            if (sk.type === "richtext")
              return <EditableRichText key={sk.key} fieldKey={sk.key} />;
            const Tag = sk.as as "h3" | "p" | "span";
            return (
              <EditableContent key={sk.key} fieldKey={sk.key} as={Tag} />
            );
          })}
        </div>
      )}
    />
  );
}
