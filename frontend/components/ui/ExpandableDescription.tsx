"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";

export type ExpandableDescriptionProps = { collapseLabel?: string; description: string; expandLabel?: string; previewLength?: number };

function previewText(description: string, previewLength: number) {
  if (description.length <= previewLength) return description;
  const ending = description.lastIndexOf(" ", previewLength);
  return `${description.slice(0, ending > 0 ? ending : previewLength)}…`;
}

/** A compact summary that can reveal a longer explanation in place. */
export function ExpandableDescription({ collapseLabel = "Pokaż mniej", description, expandLabel = "Czytaj więcej", previewLength = 180 }: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const descriptionId = useId();
  const isExpandable = description.length > previewLength;

  return <div className="expandable-description"><p className="type-body" id={descriptionId}>{expanded || !isExpandable ? description : previewText(description, previewLength)}</p>{isExpandable && <Button aria-controls={descriptionId} aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} variant="tertiary">{expanded ? collapseLabel : expandLabel}</Button>}</div>;
}
