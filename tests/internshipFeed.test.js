import test from "node:test";
import assert from "node:assert/strict";
import {
  buildInternshipPageQuery,
  clearDiscoveryFilters,
  createPageRequestRegistry,
  getDiscoveryViewState,
  getDiscoveryErrorMessage,
  getNextInternshipPage,
  isValidInternshipPage,
  mergeUniqueInternships,
  retryDiscoveryPage,
  shouldPrefetchInternships,
  getSwipeDirection,
} from "../web/src/features/internships/feedUtils.mjs";

test("discovery state distinguishes loading, errors, empty, no matches, and cards", () => {
  const base = {
    loading: false,
    searchPending: false,
    error: "",
    hasCards: false,
    hasActiveFilters: false,
    loadingMore: false,
    hasNextPage: false,
  };

  assert.equal(getDiscoveryViewState({ ...base, loading: true }), "loading");
  assert.equal(getDiscoveryViewState({ ...base, searchPending: true }), "loading");
  assert.equal(getDiscoveryViewState({ ...base, error: "failed" }), "error");
  assert.equal(getDiscoveryViewState({ ...base, hasActiveFilters: true }), "noMatches");
  assert.equal(getDiscoveryViewState({ ...base, hasActiveFilters: true, hasNextPage: true }), "checkingMore");
  assert.equal(getDiscoveryViewState({ ...base, hasActiveFilters: true, loadingMore: true }), "checkingMore");
  assert.equal(getDiscoveryViewState({ ...base, hasCards: true }), "cards");
  assert.equal(getDiscoveryViewState({ ...base, loadingMore: true }), "checkingMore");
  assert.equal(getDiscoveryViewState(base), "empty");
});

test("retry requests page one again with the active filters", async () => {
  const calls = [];
  const filters = { mode: "remote", search: "React" };
  const fetchPage = (...args) => calls.push(args);

  retryDiscoveryPage(fetchPage, filters);
  assert.deepEqual(calls, [[filters, 1, false]]);
});

test("discovery errors stay generic and do not expose API details", () => {
  assert.equal(
    getDiscoveryErrorMessage(new Error("INVALID_RESPONSE")),
    "Internship results could not be displayed. Please try again."
  );
  assert.equal(
    getDiscoveryErrorMessage(new Error("Mongo host secret.internal failed")),
    "We couldn’t load internships right now. Check your connection and try again."
  );
});

test("clearing filters resets filter and search state and reloads page one", async () => {
  const events = [];
  const emptyFilters = { mode: "", location: "", skill: "", verified: "" };
  const fetchPage = (...args) => events.push(["fetch", ...args]);
  const setters = Object.fromEntries(
    ["setFilters", "setSearchQuery", "setSearchPending", "setShowFilters", "setAppliedFilters"].map(
      (name) => [name, (value) => events.push([name, value])]
    )
  );

  await clearDiscoveryFilters({ ...setters, fetchInternships: fetchPage, emptyFilters });
  assert.deepEqual(events, [
    ["setFilters", emptyFilters],
    ["setSearchQuery", ""],
    ["setSearchPending", false],
    ["setShowFilters", false],
    ["setAppliedFilters", { ...emptyFilters, search: "" }],
    ["fetch", { ...emptyFilters, search: "" }, 1, false],
  ]);
});

test("page query and response validation preserve backend pagination metadata", () => {
  const query = buildInternshipPageQuery(
    { mode: "remote", location: " Pune ", search: " React ", skill: "", verified: "true" },
    2,
    10
  );
  assert.equal(query.toString(), "page=2&limit=10&mode=remote&location=Pune&verified=true&search=React");
  assert.equal(isValidInternshipPage({ success: true, data: [], pagination: { hasNextPage: false } }), true);
  assert.equal(isValidInternshipPage({ success: true, data: [], pagination: {} }), false);
  assert.equal(isValidInternshipPage({ success: false, data: [], pagination: { hasNextPage: false } }), false);
});

test("next-page selection respects hasNextPage and the card prefetch threshold", () => {
  assert.equal(getNextInternshipPage(1, true), 2);
  assert.equal(getNextInternshipPage(3, false), null);
  const base = {
    activeTab: "Internships", loading: false, loadingMore: false,
    hasNextPage: true, error: "", loadMoreError: false,
    searchPending: false, cardsRemaining: 3,
  };
  assert.equal(shouldPrefetchInternships(base), true);
  assert.equal(shouldPrefetchInternships({ ...base, cardsRemaining: 4 }), false);
  assert.equal(shouldPrefetchInternships({ ...base, loadingMore: true }), false);
  assert.equal(shouldPrefetchInternships({ ...base, hasNextPage: false }), false);
  assert.equal(shouldPrefetchInternships({ ...base, activeTab: "Saved" }), false);
});

test("page request registry blocks concurrent duplicate requests", () => {
  const registry = createPageRequestRegistry();
  assert.equal(registry.begin(4, 2), true);
  assert.equal(registry.begin(4, 2), false);
  registry.finish(4, 2);
  assert.equal(registry.begin(4, 2), true);
});

test("failed next-page request retains the current page and the same page can retry", async () => {
  const registry = createPageRequestRegistry();
  let currentPage = 1;
  let attempts = 0;
  const loadPage = async () => {
    const nextPage = getNextInternshipPage(currentPage, true);
    if (!registry.begin(4, nextPage)) return false;
    try {
      attempts += 1;
      if (attempts === 1) throw new Error("network failure");
      currentPage = nextPage;
      return true;
    } finally {
      registry.finish(4, nextPage);
    }
  };

  await assert.rejects(loadPage, /network failure/);
  assert.equal(currentPage, 1);
  assert.equal(await loadPage(), true);
  assert.equal(currentPage, 2);
  assert.equal(attempts, 2);
  assert.equal(registry.begin(5, 2), true);
  registry.clear();
  assert.equal(registry.begin(4, 2), true);
});

test("page appends retain existing cards and remove duplicate IDs", () => {
  const previous = [{ id: "a" }, { id: "b" }];
  const next = [{ id: "b" }, { id: "c" }, { id: "c" }, {}];
  assert.deepEqual(mergeUniqueInternships(previous, next), [
    { id: "a" }, { id: "b" }, { id: "c" },
  ]);
});

test("horizontal swipe thresholds support both touch and mouse drag input", () => {
  assert.equal(getSwipeDirection(111, 0), "right");
  assert.equal(getSwipeDirection(0, 401), "right");
  assert.equal(getSwipeDirection(-111, 0), "left");
  assert.equal(getSwipeDirection(0, -401), "left");
  assert.equal(getSwipeDirection(80, 100), null);
});
