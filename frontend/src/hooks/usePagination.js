import { useState, useMemo } from "react";

export function usePagination(dataList, itemsPerPage = 5) {
  const [currentPage, setCurrentPage] = useState(1);

  // Ensure dataList is an array
  const safeList = Array.isArray(dataList) ? dataList : [];

  const totalPages = Math.ceil(safeList.length / itemsPerPage) || 1;

  // Make sure current page is valid when data changes
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedData = useMemo(() => {
    const start = (validPage - 1) * itemsPerPage;
    return safeList.slice(start, start + itemsPerPage);
  }, [safeList, validPage, itemsPerPage]);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const next = () => goToPage(validPage + 1);
  const prev = () => goToPage(validPage - 1);

  return {
    currentPage: validPage,
    totalPages,
    paginatedData,
    goToPage,
    next,
    prev,
    startIndex: (validPage - 1) * itemsPerPage,
    endIndex: Math.min(validPage * itemsPerPage, safeList.length),
    totalItems: safeList.length,
  };
}
