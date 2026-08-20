import { useState, useEffect, useMemo } from "react";

/**
 * Client-side pagination for the dashboard panels (lists are fetched in full).
 * Returns the current page's slice plus controls. Automatically snaps back to a
 * valid page when the underlying list shrinks (e.g. after filtering/deletion).
 */
export default function usePagination(items, perPage = 10) {
  const list = Array.isArray(items) ? items : [];
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(list.length / perPage));
  useEffect(() => { if (page > pageCount) setPage(1); }, [pageCount, page]);
  const pageItems = useMemo(
    () => list.slice((page - 1) * perPage, (page - 1) * perPage + perPage),
    [list, page, perPage]
  );
  return { pageItems, page, setPage, pageCount, total: list.length };
}
