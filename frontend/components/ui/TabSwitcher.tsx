"use client";

import { useId, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

export type TabSwitcherItem = {
  disabled?: boolean;
  id: string;
  label: string;
  panel: ReactNode;
};

export type TabSwitcherProps = {
  defaultValue?: string;
  items: TabSwitcherItem[];
  label: string;
  onValueChange?: (value: string) => void;
  value?: string;
};

/**
 * An automatically activated horizontal tab list. Use it only when every
 * panel is available in the current view, not for URL navigation.
 */
export function TabSwitcher({ defaultValue, items, label, onValueChange, value }: TabSwitcherProps) {
  const id = useId();
  const firstEnabledValue = items.find((item) => !item.disabled)?.id ?? "";
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabledValue);
  const selectedValue = value ?? internalValue;

  function select(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
  }

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabledIndexes = items.map((item, itemIndex) => item.disabled ? -1 : itemIndex).filter((itemIndex) => itemIndex >= 0);
    const currentEnabledIndex = enabledIndexes.indexOf(index);
    if (currentEnabledIndex < 0) return;

    let targetIndex: number | undefined;
    if (event.key === "ArrowRight") targetIndex = enabledIndexes[(currentEnabledIndex + 1) % enabledIndexes.length];
    if (event.key === "ArrowLeft") targetIndex = enabledIndexes[(currentEnabledIndex - 1 + enabledIndexes.length) % enabledIndexes.length];
    if (event.key === "Home") targetIndex = enabledIndexes[0];
    if (event.key === "End") targetIndex = enabledIndexes[enabledIndexes.length - 1];
    if (targetIndex === undefined) return;

    event.preventDefault();
    const nextItem = items[targetIndex];
    select(nextItem.id);
    document.getElementById(`${id}-tab-${nextItem.id}`)?.focus();
  }

  return (
    <div className="tab-switcher">
      <div aria-label={label} className="tab-switcher__list" role="tablist">
        {items.map((item, index) => {
          const selected = selectedValue === item.id;
          const tabId = `${id}-tab-${item.id}`;
          const panelId = `${id}-panel-${item.id}`;

          return (
            <button
              aria-controls={panelId}
              aria-selected={selected}
              className="tab-switcher__tab"
              disabled={item.disabled}
              id={tabId}
              key={item.id}
              onClick={() => select(item.id)}
              onKeyDown={(event) => moveFocus(event, index)}
              role="tab"
              tabIndex={selected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          aria-labelledby={`${id}-tab-${item.id}`}
          className="tab-switcher__panel"
          hidden={selectedValue !== item.id}
          id={`${id}-panel-${item.id}`}
          key={item.id}
          role="tabpanel"
          tabIndex={0}
        >
          {item.panel}
        </div>
      ))}
    </div>
  );
}
