"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import type { ReactNode } from "react";

type PaginationCommonProps = {
  ariaLabel?: string;
  className?: string;
  currentPage: number;
  pageCount: number;
};

type PaginationButtonProps = PaginationCommonProps & {
  getPageHref?: never;
  onPageChange: (page: number) => void;
};

type PaginationLinkProps = PaginationCommonProps & {
  getPageHref: (page: number) => string;
  onPageChange?: never;
};

export type PaginationProps = PaginationButtonProps | PaginationLinkProps;

type PageItem = number | "ellipsis";

function getPageItems(currentPage: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (currentPage <= 4) return [1, 2, 3, 4, 5, "ellipsis", pageCount];
  if (currentPage >= pageCount - 3) return [1, "ellipsis", pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount];

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", pageCount];
}

export function Pagination({
  ariaLabel = "Paginacja",
  className,
  currentPage,
  pageCount,
  ...navigation
}: PaginationProps) {
  const safePageCount = Math.max(1, pageCount);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safePageCount);
  const pageItems = getPageItems(safeCurrentPage, safePageCount);
  const getPageHref = "getPageHref" in navigation ? navigation.getPageHref : undefined;
  const onPageChange = "onPageChange" in navigation ? navigation.onPageChange : undefined;
  function pageClassName(current: boolean) {
    return `pagination__page${current ? " pagination__page--current" : ""}`;
  }

  function renderPageControl(page: number, label: string, content: ReactNode, current = false) {
    if (getPageHref) {
      return <a aria-current={current ? "page" : undefined} aria-label={label} className={pageClassName(current)} href={getPageHref(page)}>{content}</a>;
    }

    return <button aria-current={current ? "page" : undefined} aria-label={label} className={pageClassName(current)} onClick={() => onPageChange?.(page)} type="button">{content}</button>;
  }

  return (
    <nav aria-label={ariaLabel} className={`pagination${className ? ` ${className}` : ""}`}>
      <ol className="pagination__list">
        <li>{safeCurrentPage === 1 ? <span aria-disabled="true" className="pagination__page pagination__page--disabled"><CaretLeft aria-hidden="true" size={20} weight="bold" /></span> : renderPageControl(safeCurrentPage - 1, "Poprzednia strona", <CaretLeft aria-hidden="true" size={20} weight="bold" />)}</li>
        {pageItems.map((item, index) => item === "ellipsis"
          ? <li aria-hidden="true" className="pagination__ellipsis" key={`ellipsis-${index}`}>…</li>
          : <li key={item}>{renderPageControl(item, item === safeCurrentPage ? `Strona ${item}, bieżąca` : `Przejdź do strony ${item}`, item, item === safeCurrentPage)}</li>)}
        <li>{safeCurrentPage === safePageCount ? <span aria-disabled="true" className="pagination__page pagination__page--disabled"><CaretRight aria-hidden="true" size={20} weight="bold" /></span> : renderPageControl(safeCurrentPage + 1, "Następna strona", <CaretRight aria-hidden="true" size={20} weight="bold" />)}</li>
      </ol>
    </nav>
  );
}
