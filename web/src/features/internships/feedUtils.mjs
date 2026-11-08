export function getDiscoveryViewState({
  loading,
  searchPending,
  error,
  hasCards,
  hasActiveFilters,
  loadingMore,
  hasNextPage,
}) {
  if (loading || searchPending) return "loading";
  if (error) return "error";
  if (hasCards) return "cards";
  if (loadingMore || hasNextPage) return "checkingMore";
  if (hasActiveFilters) return "noMatches";
  return "empty";
}

export function retryDiscoveryPage(fetchInternships, filters) {
  return fetchInternships(filters, 1, false);
}

export function clearDiscoveryFilters({
  setFilters,
  setSearchQuery,
  setSearchPending,
  setShowFilters,
  setAppliedFilters,
  fetchInternships,
  emptyFilters,
}) {
  const clearedFilters = { ...emptyFilters, search: "" };
  setFilters({ ...emptyFilters });
  setSearchQuery("");
  setSearchPending(false);
  setShowFilters(false);
  setAppliedFilters(clearedFilters);
  return fetchInternships(clearedFilters, 1, false);
}

export function buildInternshipPageQuery(filters, page, limit) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));

  for (const key of ["mode", "location", "skill", "verified", "search"]) {
    const value = filters[key];
    if (typeof value === "string" && value.trim()) {
      params.set(key, value.trim());
    }
  }

  return params;
}

export function isValidInternshipPage(data) {
  return Boolean(
    data?.success &&
      Array.isArray(data.data) &&
      data.data.every(
        (item) => item && typeof item === "object" && item._id
      ) &&
      typeof data.pagination?.hasNextPage === "boolean"
  );
}

export function getDiscoveryErrorMessage(error) {
  return error?.message === "INVALID_RESPONSE"
    ? "Internship results could not be displayed. Please try again."
    : "We couldn’t load internships right now. Check your connection and try again.";
}

export function mergeUniqueInternships(existing, incoming) {
  const seenIds = new Set(existing.map((item) => item.id));
  return [
    ...existing,
    ...incoming.filter((item) => {
      if (!item?.id || seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    }),
  ];
}

export function getNextInternshipPage(currentPage, hasNextPage) {
  return hasNextPage ? currentPage + 1 : null;
}

export function shouldPrefetchInternships({
  activeTab,
  loading,
  loadingMore,
  hasNextPage,
  error,
  loadMoreError,
  searchPending,
  cardsRemaining,
}) {
  return Boolean(
    activeTab === "Internships" &&
      !loading &&
      !loadingMore &&
      hasNextPage &&
      !error &&
      !loadMoreError &&
      !searchPending &&
      cardsRemaining <= 3
  );
}

export function createPageRequestRegistry() {
  const requests = new Set();
  const keyFor = (version, page) => `${version}:${page}`;

  return {
    begin(version, page) {
      const key = keyFor(version, page);
      if (requests.has(key)) return false;
      requests.add(key);
      return true;
    },
    finish(version, page) {
      requests.delete(keyFor(version, page));
    },
    clear() {
      requests.clear();
    },
  };
}

export function getSwipeDirection(offsetX, velocityX) {
  if (offsetX > 110 || velocityX > 400) return "right";
  if (offsetX < -110 || velocityX < -400) return "left";
  return null;
}
