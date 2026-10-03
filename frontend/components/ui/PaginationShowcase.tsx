"use client";

import { useState } from "react";
import { Pagination } from "@/components/ui/Pagination";

export function PaginationShowcase() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <section aria-labelledby="pagination-heading">
      <h3 className="type-h3" id="pagination-heading">Paginacja</h3>
      <p className="type-caption mt-1 text-[var(--content-muted)]">Numer strony i przyciski poprzednia/następna są dostępne z klawiatury. Wielokropek oznacza pominięty zakres stron.</p>
      <Pagination className="mt-5" currentPage={currentPage} onPageChange={setCurrentPage} pageCount={12} />
    </section>
  );
}
