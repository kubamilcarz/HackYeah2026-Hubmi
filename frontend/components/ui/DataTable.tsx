"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { SearchField } from "@/components/ui/FormControls";
import { Badge, type TagVariant } from "@/components/ui/Tag";

export type DataTableRow = Record<string, string | number>;

export type DataTableColumn<Row extends DataTableRow> = {
  cellKind?: "text" | "status";
  key: keyof Row & string;
  label: string;
  sortable?: boolean;
  statusVariants?: Partial<Record<string, TagVariant>>;
};

type DataTableProps<Row extends DataTableRow> = {
  caption?: string;
  className?: string;
  columns: DataTableColumn<Row>[];
  emptyMessage?: string;
  heading: string;
  onSelectionChange?: (selectedRowKeys: string[]) => void;
  rowKey: keyof Row & string;
  rowSelectionLabel?: (row: Row) => string;
  rows: Row[];
  searchLabel?: string;
  selectable?: boolean;
};

type SortDirection = "ascending" | "descending";

function compareValues(left: string | number, right: string | number) {
  if (typeof left === "number" && typeof right === "number") return left - right;

  return String(left).localeCompare(String(right), "pl", { numeric: true, sensitivity: "base" });
}

function SortIndicator({ direction }: { direction?: SortDirection }) {
  if (direction === "ascending") return <span aria-hidden="true" className="data-table__sort-indicator">↑</span>;
  if (direction === "descending") return <span aria-hidden="true" className="data-table__sort-indicator">↓</span>;

  return <span aria-hidden="true" className="data-table__sort-indicator">↕</span>;
}

export function DataTable<Row extends DataTableRow>({
  caption,
  className,
  columns,
  emptyMessage = "Brak pasujących rekordów.",
  heading,
  onSelectionChange,
  rowKey,
  rowSelectionLabel = (row) => `Zaznacz wiersz: ${String(row[rowKey])}`,
  rows,
  searchLabel = "Szukaj w tabeli",
  selectable = false,
}: DataTableProps<Row>) {
  const generatedId = useId();
  const tableId = `data-table-${generatedId}`;
  const headingId = `${tableId}-heading`;
  const searchId = `${tableId}-search`;
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [sort, setSort] = useState<{ key: keyof Row & string; direction: SortDirection }>();
  const selectAllRef = useRef<HTMLInputElement>(null);

  const displayedRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filteredRows = normalizedQuery
      ? rows.filter((row) => columns.some((column) => String(row[column.key]).toLocaleLowerCase().includes(normalizedQuery)))
      : rows;

    if (!sort) return filteredRows;

    return [...filteredRows].sort((left, right) => {
      const result = compareValues(left[sort.key], right[sort.key]);
      return sort.direction === "ascending" ? result : -result;
    });
  }, [columns, query, rows, sort]);

  const displayedRowKeys = displayedRows.map((row) => String(row[rowKey]));
  const isAllSelected = displayedRowKeys.length > 0 && displayedRowKeys.every((key) => selectedRowKeys.includes(key));
  const isPartiallySelected = !isAllSelected && displayedRowKeys.some((key) => selectedRowKeys.includes(key));

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isPartiallySelected;
  }, [isPartiallySelected]);

  function updateSelection(nextSelection: string[]) {
    setSelectedRowKeys(nextSelection);
    onSelectionChange?.(nextSelection);
  }

  function toggleRowSelection(key: string) {
    updateSelection(selectedRowKeys.includes(key)
      ? selectedRowKeys.filter((selectedKey) => selectedKey !== key)
      : [...selectedRowKeys, key]);
  }

  function toggleAllRows() {
    if (isAllSelected) {
      updateSelection(selectedRowKeys.filter((key) => !displayedRowKeys.includes(key)));
      return;
    }

    updateSelection([...new Set([...selectedRowKeys, ...displayedRowKeys])]);
  }

  function toggleSort(key: keyof Row & string) {
    setSort((current) => ({
      key,
      direction: current?.key === key && current.direction === "ascending" ? "descending" : "ascending",
    }));
  }

  return (
    <div className={`data-table${className ? ` ${className}` : ""}`}>
      <div className="data-table__header">
        <h4 className="type-h3" id={headingId}>{heading}</h4>
        <button aria-controls={searchId} aria-expanded={isSearchOpen} className="data-table__search-toggle" onClick={() => setIsSearchOpen((open) => !open)} type="button">
          <MagnifyingGlass aria-hidden="true" size={20} weight="bold" />
          Szukaj
        </button>
        <div className={`data-table__search${isSearchOpen ? " data-table__search--open" : ""}`} id={searchId}>
          <SearchField aria-controls={tableId} hideLabel label={searchLabel} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj rekordów" value={query} />
        </div>
      </div>
      <div className="data-table__scroll">
        <table aria-labelledby={headingId} id={tableId}>
          {caption && <caption>{caption}</caption>}
          <thead>
            <tr>
              {selectable && <th className="data-table__selection-cell" scope="col"><input aria-label="Zaznacz wszystkie widoczne wiersze" checked={isAllSelected} className="data-table__checkbox" onChange={toggleAllRows} ref={selectAllRef} type="checkbox" /></th>}
              {columns.map((column) => {
                const direction = sort?.key === column.key ? sort.direction : undefined;

                return (
                  <th aria-sort={direction} key={column.key} scope="col">
                    {column.sortable ? (
                      <button aria-label={`Sortuj według: ${column.label}${direction ? `, obecnie ${direction === "ascending" ? "rosnąco" : "malejąco"}` : ""}`} className="data-table__sort-button" onClick={() => toggleSort(column.key)} type="button">
                        <span>{column.label}</span>
                        <SortIndicator direction={direction} />
                      </button>
                    ) : column.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {displayedRows.map((row) => (
              <tr key={String(row[rowKey])}>
                {selectable && <td className="data-table__selection-cell"><input aria-label={rowSelectionLabel(row)} checked={selectedRowKeys.includes(String(row[rowKey]))} className="data-table__checkbox" onChange={() => toggleRowSelection(String(row[rowKey]))} type="checkbox" /></td>}
                {columns.map((column) => <td key={column.key}>{column.cellKind === "status" ? <Badge label={String(row[column.key])} variant={column.statusVariants?.[String(row[column.key])] ?? "neutral"} /> : row[column.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {displayedRows.length === 0 && <p className="data-table__empty" role="status">{emptyMessage}</p>}
      </div>
    </div>
  );
}
