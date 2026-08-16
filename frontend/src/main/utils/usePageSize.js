import { useState } from "react";

// Reusable hook that manages a page size value, persisting the selection to
// localStorage under `storageKey` so that it is remembered across visits to
// the same table. If the stored value is missing or not one of `options`,
// `defaultPageSize` is used (and localStorage is updated to match).
export default function usePageSize({
  storageKey,
  options = [20, 50, 100, 200, 500],
  defaultPageSize = 20,
}) {
  const getInitialPageSize = () => {
    const storedValue = parseInt(localStorage.getItem(storageKey), 10);
    if (options.includes(storedValue)) {
      return storedValue;
    }
    localStorage.setItem(storageKey, defaultPageSize);
    return defaultPageSize;
  };

  const [pageSize, setPageSize] = useState(getInitialPageSize);

  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    localStorage.setItem(storageKey, newPageSize);
  };

  return [pageSize, handlePageSizeChange];
}
