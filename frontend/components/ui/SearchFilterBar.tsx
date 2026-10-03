"use client";

import type { ChangeEventHandler } from "react";
import { SlidersHorizontal } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/FormControls";

export type SearchFilterBarProps = {
  filterLabel?: string;
  onFiltersClick: () => void;
  onQueryChange: ChangeEventHandler<HTMLInputElement>;
  query: string;
  searchLabel?: string;
  searchPlaceholder?: string;
};

/** A search field paired with the action that narrows its result set. */
export function SearchFilterBar({
  filterLabel = "Filtry",
  onFiltersClick,
  onQueryChange,
  query,
  searchLabel = "Szukaj w zasobach",
  searchPlaceholder = "Szukaj w zasobach…",
}: SearchFilterBarProps) {
  return (
    <div className="search-filter-bar">
      <SearchField
        className="search-filter-bar__search"
        label={searchLabel}
        onChange={onQueryChange}
        placeholder={searchPlaceholder}
        value={query}
      />
      <Button className="search-filter-bar__filters" leadingIcon={SlidersHorizontal} onClick={onFiltersClick} variant="tertiary">
        {filterLabel}
      </Button>
    </div>
  );
}
