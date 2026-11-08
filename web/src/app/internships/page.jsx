"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  Bookmark,
  Check,
  RotateCcw,
  MapPin,
  CalendarDays,
  Wallet,
  Monitor,
  ExternalLink,
  Trash2,
  CheckCircle,
  Briefcase,
  Building2,
  BadgeCheck,
} from "lucide-react";

import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import InternshipCard from "@/features/internships/InternshipCard";
import { tokenStorage } from "@/services/apiClient";
import {
  formatStipend,
  mapInternship,
  shuffleInternships,
  deduplicateInternships,
  extractStudentStatusSets,
  filterCycleInternships,
  buildInternshipQueryParams,
  determineEmptyReason,
  fetchUserStatusSets,
  removeSavedAndRejectInternship,
} from "@/lib/internshipDeck";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Persist an internship action through the authenticated backend API.
async function saveInternshipAction(internshipId, action) {
  const token = tokenStorage.getAccessToken();

  if (!token) {
    throw new Error("Please log in before saving internship actions.");
  }

  const response = await fetch(
    `${API_URL}/internship-actions/${internshipId}/action`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action }),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to save internship action.");
  }

  return result.data;
}

const EMPTY_FILTERS = {
  mode: "",
  location: "",
  skill: "",
  verified: "",
};

export default function InternshipsPage() {
  const [cards, setCards] = useState([]);
  const [allInternships, setAllInternships] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [emptyDeckReason, setEmptyDeckReason] = useState(null);

  const [activeTab, setActiveTab] = useState("Internships");
  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [showFilters, setShowFilters] = useState(false);

  const [buttonSwipeDirection, setButtonSwipeDirection] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [myActions, setMyActions] = useState([]);
  const [loadingActions, setLoadingActions] = useState(false);

  // Reject confirmation dialog for currently saved internships
  const [rejectConfirmCard, setRejectConfirmCard] = useState(null);
  const [isRejectingSaved, setIsRejectingSaved] = useState(false);

  // Track card IDs already presented in the current browsing cycle to prevent duplicates across pages
  const seenIdsInCycleRef = useRef(new Set());

  // Fetch user's saved and accepted actions
  const fetchMyActions = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setMyActions([]);
      return;
    }

    try {
      setLoadingActions(true);
      const response = await fetch(`${API_URL}/internship-actions/my-actions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return;

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setMyActions(result.data);
      }
    } catch (error) {
      console.error("Failed to load user actions:", error);
    } finally {
      setLoadingActions(false);
    }
  }, []);

  // Fetch active internships starting from page 1, annotating saved/applied markers and optionally shuffling
  const fetchInternships = useCallback(async (filterValues = {}, shouldShuffle = false) => {
    try {
      setLoading(true);
      setApiError("");
      setButtonSwipeDirection(null);

      const token = tokenStorage.getAccessToken();
      const statusSets = await fetchUserStatusSets(API_URL, token);

      const activeSearch = (filterValues.search !== undefined ? filterValues.search : searchQuery).trim();

      const queryString = buildInternshipQueryParams({
        page: 1,
        limit: 10,
        filters: filterValues,
        search: activeSearch,
      });

      const url = `${API_URL}/internships${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.data)) {
        throw new Error("Invalid API response");
      }

      const paginationData = data.pagination || {
        page: 1,
        limit: 10,
        total: data.data.length,
        totalPages: 1,
        hasNextPage: false,
      };

      const mapped = data.data
        .filter((item) => item._id)
        .map((item) => mapInternship(item, statusSets));

      const deckCards = shouldShuffle ? shuffleInternships(mapped) : mapped;

      // Reset seen IDs for the new browsing cycle
      seenIdsInCycleRef.current = new Set(deckCards.map((c) => c.id));

      setAllInternships(deckCards);
      setCards(deckCards);
      setPagination(paginationData);

      const hasActiveFilters = Boolean(
        activeSearch ||
        filterValues.mode ||
        filterValues.location?.trim() ||
        filterValues.skill?.trim() ||
        filterValues.verified
      );

      const reason = determineEmptyReason({
        totalAvailable: paginationData.total != null ? paginationData.total : deckCards.length,
        deckCount: deckCards.length,
        hasFilters: hasActiveFilters,
      });
      setEmptyDeckReason(reason);
    } catch (error) {
      console.warn("Backend API unreachable:", error);
      setAllInternships([]);
      setCards([]);
      setApiError("Unable to load internships from database server.");
      setEmptyDeckReason("error");
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchInternships();
    fetchMyActions();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && tabParam.toLowerCase() === "saved") {
        setActiveTab("Saved");
      }
    }
  }, [fetchInternships, fetchMyActions]);

  // Load next batch when deck is running low
  const loadMoreInternships = useCallback(async () => {
    if (loadingMore || loading || !pagination.hasNextPage) return;

    try {
      setLoadingMore(true);
      const nextPage = pagination.page + 1;
      const token = tokenStorage.getAccessToken();
      const statusSets = await fetchUserStatusSets(API_URL, token);

      const queryString = buildInternshipQueryParams({
        page: nextPage,
        limit: pagination.limit || 10,
        filters,
        search: searchQuery,
      });

      const url = `${API_URL}/internships${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) return;

      const data = await response.json();
      if (!data.success || !Array.isArray(data.data)) return;

      const nextPagination = data.pagination || {
        page: nextPage,
        limit: 10,
        total: data.data.length,
        totalPages: nextPage,
        hasNextPage: false,
      };

      const mapped = data.data
        .filter((item) => item._id)
        .map((item) => mapInternship(item, statusSets));

      const newlyEligible = filterCycleInternships(mapped, seenIdsInCycleRef.current);
      const uniqueNewCards = deduplicateInternships(newlyEligible, seenIdsInCycleRef.current);

      for (const card of uniqueNewCards) {
        seenIdsInCycleRef.current.add(card.id);
      }

      if (uniqueNewCards.length > 0) {
        setCards((prev) => [...prev, ...uniqueNewCards]);
        setAllInternships((prev) => [...prev, ...uniqueNewCards]);
      }

      setPagination(nextPagination);
    } catch (error) {
      console.warn("Failed to load more internships:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [pagination, loadingMore, loading, filters, searchQuery]);

  // Local search keeps the displayed cards responsive while typing.
  const query = searchQuery.trim().toLowerCase();

  const filteredCards = cards.filter((card) => {
    if (!query) return true;

    return (
      card.roleTitle.toLowerCase().includes(query) ||
      card.companyName.toLowerCase().includes(query) ||
      card.skills.some((skill) => skill.toLowerCase().includes(query))
    );
  });

  // Filtered saved and accepted items
  const savedItems = myActions.filter(
    (item) => item.saved && item.internship && typeof item.internship === "object"
  );
  const acceptedItems = myActions.filter(
    (item) =>
      item.decision === "accepted" &&
      item.internship &&
      typeof item.internship === "object"
  );

  const filteredSavedItems = savedItems.filter((item) => {
    if (!query) return true;
    const intern = item.internship;
    const role = (intern.role || "").toLowerCase();
    const company = (intern.company || "").toLowerCase();
    const skills = Array.isArray(intern.skills) ? intern.skills : [];
    return (
      role.includes(query) ||
      company.includes(query) ||
      skills.some((s) => s.toLowerCase().includes(query))
    );
  });

  const filteredAcceptedItems = acceptedItems.filter((item) => {
    if (!query) return true;
    const intern = item.internship;
    const role = (intern.role || "").toLowerCase();
    const company = (intern.company || "").toLowerCase();
    const skills = Array.isArray(intern.skills) ? intern.skills : [];
    return (
      role.includes(query) ||
      company.includes(query) ||
      skills.some((s) => s.toLowerCase().includes(query))
    );
  });


  const showToast = (message) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  // Persist card swipes before removing cards from the current deck.
  const handleCardSwipe = async (direction) => {
    if (buttonSwipeDirection || rejectConfirmCard || isRejectingSaved) return;

    const activeCard = filteredCards[0];
    if (!activeCard) return;

    const actionMap = {
      right: "accepted",
      left: "rejected",
      save: "saved",
    };
    const action = actionMap[direction];
    if (!action) return;

    // If student chooses Reject/Skip on an internship that is currently saved, show confirmation dialog
    if (action === "rejected" && activeCard.isSaved) {
      setRejectConfirmCard(activeCard);
      return;
    }

    try {
      if (action === "accepted" && activeCard.isApplied) {
        showToast(`Already applied to ${activeCard.roleTitle}`);
      } else {
        await saveInternshipAction(activeCard.id, action);
        const messages = {
          right: `Interested in ${activeCard.roleTitle}`,
          left: `Skipped ${activeCard.roleTitle}`,
          save: `Saved ${activeCard.roleTitle}`,
        };
        showToast(messages[direction]);
      }

      setCards((previousCards) => {
        const remaining = previousCards.filter((card) => card.id !== activeCard.id);
        if (remaining.length <= 2 && pagination.hasNextPage && !loadingMore) {
          loadMoreInternships();
        }
        return remaining;
      });
      fetchMyActions();
    } catch (error) {
      showToast(error.message || "Unable to save internship action.");
    }
  };

  // Persist button actions and keep the existing swipe animation.
  const triggerButtonSwipe = async (direction) => {
    if (
      loading ||
      apiError ||
      !filteredCards.length ||
      buttonSwipeDirection ||
      rejectConfirmCard ||
      isRejectingSaved
    ) {
      return;
    }

    const activeCard = filteredCards[0];
    const actionMap = {
      right: "accepted",
      left: "rejected",
      save: "saved",
    };
    const action = actionMap[direction];
    if (!action) return;

    // If student chooses Reject/Skip on an internship that is currently saved, show confirmation dialog
    if (action === "rejected" && activeCard.isSaved) {
      setRejectConfirmCard(activeCard);
      return;
    }

    setButtonSwipeDirection(direction);

    try {
      if (action === "accepted" && activeCard.isApplied) {
        showToast(`Already applied to ${activeCard.roleTitle}`);
      } else {
        await saveInternshipAction(activeCard.id, action);
        const messages = {
          right: `Interested in ${activeCard.roleTitle}`,
          left: `Skipped ${activeCard.roleTitle}`,
          save: `Saved ${activeCard.roleTitle}`,
        };
        showToast(messages[direction]);
      }

      setCards((previousCards) => {
        const remaining = previousCards.filter((card) => card.id !== activeCard.id);
        if (remaining.length <= 2 && pagination.hasNextPage && !loadingMore) {
          loadMoreInternships();
        }
        return remaining;
      });
      fetchMyActions();
    } catch (error) {
      showToast(error.message || "Unable to save internship action.");
    } finally {
      setButtonSwipeDirection(null);
    }
  };

  // Dialog actions for rejecting a saved internship
  const handleKeepSaved = () => {
    setRejectConfirmCard(null);
  };

  const handleConfirmRemoveFromSavedAndReject = async () => {
    if (!rejectConfirmCard || isRejectingSaved) return;
    setIsRejectingSaved(true);

    try {
      await removeSavedAndRejectInternship(
        rejectConfirmCard.id,
        saveInternshipAction
      );

      showToast(`Removed from Saved and skipped ${rejectConfirmCard.roleTitle}`);

      setCards((previousCards) => {
        const remaining = previousCards.filter(
          (card) => card.id !== rejectConfirmCard.id
        );
        if (remaining.length <= 2 && pagination.hasNextPage && !loadingMore) {
          loadMoreInternships();
        }
        return remaining;
      });

      fetchMyActions();
      setRejectConfirmCard(null);
    } catch (error) {
      showToast(error.message || "Unable to reject saved internship.");
    } finally {
      setIsRejectingSaved(false);
    }
  };

  // Unsave an internship and update views
  const handleUnsave = async (internshipId, roleTitle) => {
    try {
      await saveInternshipAction(internshipId, "unsaved");
      showToast(`Removed "${roleTitle}" from saved`);
      await fetchMyActions();
      await fetchInternships(filters, false);
    } catch (error) {
      showToast(error.message || "Unable to unsave internship.");
    }
  };

  // Accept / express interest from saved view
  const handleAcceptFromSaved = async (internshipId, roleTitle) => {
    try {
      await saveInternshipAction(internshipId, "accepted");
      showToast(`Interested in "${roleTitle}"`);
      await fetchMyActions();
      await fetchInternships(filters, false);
    } catch (error) {
      showToast(error.message || "Unable to accept internship.");
    }
  };

  // Apply the selected filters and search term.
  const handleApplyFilters = async () => {
    setShowFilters(false);

    await fetchInternships(
      {
        ...filters,
        search: searchQuery,
      },
      false
    );
  };

  // Clear filters and reload the default listing.
  const handleResetFilters = async () => {
    setFilters({ ...EMPTY_FILTERS });
    setSearchQuery("");
    setShowFilters(false);

    await fetchInternships({ ...EMPTY_FILTERS, search: "" }, false);
  };

  // Reload the discovery deck starting from page 1, shuffling available eligible internships.
  const handleReloadDeck = async () => {
    try {
      setIsReloading(true);
      await fetchInternships(filters, true);
      await fetchMyActions();
    } finally {
      setIsReloading(false);
    }
  };

  const actionsDisabled =
    loading ||
    Boolean(apiError) ||
    filteredCards.length === 0 ||
    Boolean(rejectConfirmCard) ||
    isRejectingSaved;

  return (
    <div className="h-screen bg-[#F7F9F9] flex overflow-hidden">
      <DashboardSidebar />

      <div className="flex-1 md:ml-[220px] ml-0 flex flex-col h-screen overflow-hidden relative">
        <DashboardHeader />

        {/* Toast notifications */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
            >
              <CheckCircle className="w-3.5 h-3.5 text-[#4B9C93]" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-0 overflow-y-auto min-h-0">
          {/* ──── Search Bar & Filter Button (Sticky) ──── */}
          <div className="sticky top-0 z-20 bg-[#F7F9F9] pt-3 sm:pt-4 pb-2 sm:pb-3 w-full max-w-3xl mx-auto shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Input Container */}
            <div className="flex-1 relative flex items-center bg-white border-2 border-[#E5E6E5] rounded-full h-11 sm:h-12 px-4 sm:px-5 shadow-xs focus-within:border-[#4B9C93] focus-within:ring-2 focus-within:ring-[#4B9C93]/15 transition-all">
              <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#292D32] shrink-0" strokeWidth={2} />
              <input
                id="internship-search"
                type="text"
                placeholder="Search internships, roles, companies, skills..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleApplyFilters();
                  }
                }}
                className="w-full bg-transparent pl-2.5 sm:pl-3 pr-2 text-xs sm:text-sm font-medium text-[#101828] placeholder:text-[#67727A]/80 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Circular Filter Button */}
            {activeTab === "Internships" && (
              <button
                id="filter-btn"
                type="button"
                aria-label="Toggle filters"
                aria-expanded={showFilters}
                onClick={() => setShowFilters((previous) => !previous)}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-[#E5E6E5] bg-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:border-[#4B9C93] hover:bg-[#F8FAFC] transition-all ${
                  showFilters ? "border-[#4B9C93] ring-2 ring-[#4B9C93]/20" : ""
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-[#292D32]" strokeWidth={2} />
              </button>
            )}
            </div>
          </div>

          {/* Filter panel (Discovery Feed only) — mobile = fixed modal, desktop = inline */}
          {activeTab === "Internships" && showFilters && (
            <>
              {/* Mobile backdrop */}
              <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
                onClick={() => setShowFilters(false)}
              />
            </>
          )}
          <AnimatePresence>
            {activeTab === "Internships" && showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -8 }}
                className="fixed sm:relative inset-x-4 top-24 sm:inset-x-auto sm:top-auto w-auto sm:w-full sm:max-w-[600px] overflow-hidden sm:mb-6 z-50 sm:z-auto"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">
                      Filter Internships
                    </h3>

                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      aria-label="Close filters"
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Work mode */}
                    <div>
                      <label
                        htmlFor="filter-mode"
                        className="block text-xs font-semibold text-gray-600 mb-2"
                      >
                        Work Mode
                      </label>

                      <select
                        id="filter-mode"
                        value={filters.mode}
                        onChange={(event) =>
                          setFilters((previous) => ({
                            ...previous,
                            mode: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#4B9C93]"
                      >
                        <option value="">All modes</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">On-site</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label
                        htmlFor="filter-location"
                        className="block text-xs font-semibold text-gray-600 mb-2"
                      >
                        Location
                      </label>

                      <input
                        id="filter-location"
                        type="text"
                        value={filters.location}
                        onChange={(event) =>
                          setFilters((previous) => ({
                            ...previous,
                            location: event.target.value,
                          }))
                        }
                        placeholder="e.g. Noida, Remote"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#4B9C93]"
                      />
                    </div>

                    {/* Skills */}
                    <div>
                      <label
                        htmlFor="filter-skill"
                        className="block text-xs font-semibold text-gray-600 mb-2"
                      >
                        Skill
                      </label>

                      <input
                        id="filter-skill"
                        type="text"
                        value={filters.skill}
                        onChange={(event) =>
                          setFilters((previous) => ({
                            ...previous,
                            skill: event.target.value,
                          }))
                        }
                        placeholder="e.g. React, Java, Python"
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#4B9C93]"
                      />
                    </div>

                    {/* Verification */}
                    <div>
                      <label
                        htmlFor="filter-verified"
                        className="block text-xs font-semibold text-gray-600 mb-2"
                      >
                        Company Verification
                      </label>

                      <select
                        id="filter-verified"
                        value={filters.verified}
                        onChange={(event) =>
                          setFilters((previous) => ({
                            ...previous,
                            verified: event.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#4B9C93]"
                      >
                        <option value="">All companies</option>
                        <option value="true">Verified only</option>
                      </select>
                    </div>
                  </div>

                  {/* Filter actions */}
                  <div className="flex gap-3 mt-5">
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      disabled={loading}
                      className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Reset
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      disabled={loading}
                      className="flex-1 rounded-full bg-[#4B9C93] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3d867e] disabled:opacity-50"
                    >
                      {loading ? "Applying..." : "Apply Filters"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>


          {/* ──────────────── TAB CONTENT ──────────────── */}
          {activeTab === "Internships" ? (
            <div className="w-full flex flex-col items-center justify-start sm:justify-center my-auto py-2 shrink-0 min-h-0">
              {/* Internship Swipe Deck */}
              <div className="relative w-full max-w-[360px] sm:max-w-[400px] md:max-w-[430px] lg:max-w-[450px] h-[410px] sm:h-[420px] md:h-[440px] max-h-[calc(100vh-230px)] mb-3 sm:mb-5 flex items-center justify-center shrink-0">
                {loading || loadingMore ? (
                  <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
                    <div className="w-8 h-8 border-4 border-[#4B9C93]/20 border-t-[#4B9C93] rounded-full animate-spin" />
                    {isReloading ? "Reloading internships..." : loadingMore ? "Loading more internships..." : "Loading internships..."}
                  </div>
                ) : apiError ? (
                  <div className="w-full h-full bg-white rounded-2xl p-6 text-center shadow-lg flex flex-col items-center justify-center">
                    <p className="text-sm text-red-600 mb-4">{apiError}</p>

                    <button
                      type="button"
                      onClick={() => handleReloadDeck()}
                      className="px-5 py-2 rounded-full bg-[#4B9C93] text-white text-xs sm:text-sm font-semibold hover:bg-[#3d867e] flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Try Again
                    </button>
                  </div>
                ) : filteredCards.length > 0 ? (
                  <AnimatePresence>
                    {filteredCards.slice(0, 3).map((internship, index) => (
                      <InternshipCard
                        key={internship.id}
                        internship={internship}
                        isTopCard={index === 0}
                        indexOffset={index}
                        onSwipe={handleCardSwipe}
                        swipeDirection={
                          index === 0 ? buttonSwipeDirection : null
                        }
                      />
                    ))}
                  </AnimatePresence>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full h-full aspect-square bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-xl shadow-black/5 flex flex-col items-center justify-center text-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#E6F7F3] border border-[#4B9C93]/20 flex items-center justify-center text-[#4B9C93] mb-3">
                      <CheckCircle className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                      {emptyDeckReason === "no_filter_matches" || searchQuery
                        ? "No matches found"
                        : "All caught up! 🎉"}
                    </h3>

                    <p className="text-xs sm:text-sm text-gray-500 max-w-[320px] mb-4 leading-relaxed">
                      {emptyDeckReason === "no_filter_matches" || searchQuery
                        ? "No internships match your current search or filters. Try adjusting your filters or reload to check for opportunities."
                        : "No more new internships in the discovery deck. You can reload the list to review the opportunities again."}
                    </p>

                    <button
                      id="reload-deck-btn"
                      type="button"
                      onClick={handleReloadDeck}
                      disabled={loading || isReloading}
                      className="px-5 py-2 rounded-full bg-[#4B9C93] text-white text-xs sm:text-sm font-semibold hover:bg-[#3d867e] active:scale-95 shadow-md shadow-[#4B9C93]/25 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${isReloading ? "animate-spin" : ""}`} />
                      {isReloading ? "Reloading..." : "Reload Internships"}
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-6 sm:gap-8 shrink-0 z-10 pt-1 pb-2">
                {/* Skip */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    id="action-skip"
                    type="button"
                    onClick={() => triggerButtonSwipe("left")}
                    disabled={actionsDisabled}
                    aria-label="Skip internship"
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white border-2 border-red-400 flex items-center justify-center text-red-400 shadow-md shadow-red-100/50 transition-all duration-200 ${
                      actionsDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-red-50 hover:scale-110 active:scale-95 cursor-pointer"
                    }`}
                  >
                    <X className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.5} />
                  </button>
                  <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    Skip
                  </span>
                </div>

                {/* Save */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    id="action-save"
                    type="button"
                    onClick={() => triggerButtonSwipe("save")}
                    disabled={actionsDisabled}
                    aria-label="Save internship"
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-400 shadow-md shadow-gray-100/50 transition-all duration-200 ${
                      actionsDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-gray-50 hover:border-gray-400 hover:text-gray-600 hover:scale-110 active:scale-95 cursor-pointer"
                    }`}
                  >
                    <Bookmark className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2} />
                  </button>
                  <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    Save
                  </span>
                </div>

                {/* Accept */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    id="action-accept"
                    type="button"
                    onClick={() => triggerButtonSwipe("right")}
                    disabled={actionsDisabled}
                    aria-label="Accept internship"
                    className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white border-2 border-[#4B9C93] flex items-center justify-center text-[#4B9C93] shadow-md shadow-[#4B9C93]/10 transition-all duration-200 ${
                      actionsDisabled
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:bg-[#E6F7F3] hover:scale-110 active:scale-95 cursor-pointer"
                    }`}
                  >
                    <Check className="w-5 h-5 sm:w-5.5 sm:h-5.5" strokeWidth={2.5} />
                  </button>
                  <span className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    Accept
                  </span>
                </div>
              </div>

              {/* Progress indicators */}
              <div className="flex items-center gap-1.5 mb-1 shrink-0">
                {allInternships.map((internship) => {
                  const isRemaining = cards.some(
                    (card) => card.id === internship.id
                  );

                  const isCurrent =
                    filteredCards.length > 0 &&
                    filteredCards[0].id === internship.id;

                  return (
                    <div
                      key={internship.id}
                      title={internship.roleTitle}
                      className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                        isCurrent
                          ? "w-5 sm:w-6 bg-[#4B9C93]"
                          : !isRemaining
                          ? "w-1 sm:w-1.5 bg-[#4B9C93]/40"
                          : "w-1 sm:w-1.5 bg-gray-200"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ) : activeTab === "Saved" ? (
            /* ──────────────── SAVED INTERNSHIPS VIEW ──────────────── */
            <div className="w-full max-w-[720px] flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Saved Internships
                  </h2>
                  <p className="text-xs text-gray-500">
                    Opportunities you bookmarked to review or apply later.
                  </p>
                </div>
                <span className="text-xs font-semibold bg-[#E6F7F3] text-[#4B9C93] px-3 py-1 rounded-full">
                  {filteredSavedItems.length} Saved
                </span>
              </div>

              {loadingActions ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
                  <div className="w-8 h-8 border-4 border-[#4B9C93]/20 border-t-[#4B9C93] rounded-full animate-spin" />
                  Loading your saved internships...
                </div>
              ) : filteredSavedItems.length > 0 ? (
                filteredSavedItems.map((item) => {
                  const intern = item.internship;
                  const isAccepted = item.decision === "accepted";

                  return (
                    <motion.div
                      key={intern._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-base truncate">
                            {intern.role || "Internship"}
                          </h3>
                          {intern.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#4B9C93] bg-[#E6F7F3] px-2 py-0.5 rounded-full">
                              <BadgeCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-gray-600 mb-2">
                          {intern.company || "Company"}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                          <span className="inline-flex items-center gap-1">
                            <Monitor className="w-3.5 h-3.5 text-gray-400" />
                            {intern.mode || "remote"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {intern.location || "Remote"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5 text-gray-400" />
                            {formatStipend(intern)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                            {intern.duration || "N/A"}
                          </span>
                        </div>

                        {/* Skills */}
                        {Array.isArray(intern.skills) && intern.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {intern.skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="text-[10px] font-semibold text-[#4B9C93] bg-[#E6F7F3] px-2.5 py-0.5 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {intern.skills.length > 4 && (
                              <span className="text-[10px] text-gray-400 self-center">
                                +{intern.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {isAccepted ? (
                          <span className="text-xs font-semibold text-[#4B9C93] bg-[#E6F7F3] px-3.5 py-2 rounded-full flex items-center gap-1.5 border border-[#4B9C93]/20">
                            <CheckCircle className="w-4 h-4" />
                            Accepted
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              handleAcceptFromSaved(intern._id, intern.role)
                            }
                            className="px-4 py-2 bg-[#4B9C93] text-white text-xs font-semibold rounded-full hover:bg-[#3d867e] active:scale-95 transition-all shadow-sm shadow-[#4B9C93]/20 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept / Apply
                          </button>
                        )}

                        {intern.applicationUrl && (
                          <a
                            href={intern.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-200 rounded-full transition-all"
                            title="Visit external application portal"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleUnsave(intern._id, intern.role)
                          }
                          className="px-3 py-2 text-red-500 hover:bg-red-50 hover:border-red-300 border border-red-200 text-xs font-semibold rounded-full transition-all flex items-center gap-1 cursor-pointer"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Unsave
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#E6F7F3] flex items-center justify-center text-[#4B9C93] mb-4">
                    <Bookmark className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    No saved internships
                  </h3>
                  <p className="text-sm text-gray-500 max-w-[320px] mb-5">
                    Click the bookmark button on any internship card in the Discovery Deck to save it here.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Internships")}
                    className="px-6 py-2.5 rounded-full bg-[#4B9C93] text-white text-sm font-semibold hover:bg-[#3d867e] transition-all"
                  >
                    Go to Discovery Deck
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === "Accepted" ? (
            /* ──────────────── ACCEPTED INTERNSHIPS VIEW ──────────────── */
            <div className="w-full max-w-[720px] flex flex-col gap-4 mb-8">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Accepted / Interested Roles
                  </h2>
                  <p className="text-xs text-gray-500">
                    Internships where you swiped right or accepted interest.
                  </p>
                </div>
                <span className="text-xs font-semibold bg-[#E6F7F3] text-[#4B9C93] px-3 py-1 rounded-full">
                  {filteredAcceptedItems.length} Accepted
                </span>
              </div>

              {loadingActions ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-sm text-gray-500">
                  <div className="w-8 h-8 border-4 border-[#4B9C93]/20 border-t-[#4B9C93] rounded-full animate-spin" />
                  Loading your accepted internships...
                </div>
              ) : filteredAcceptedItems.length > 0 ? (
                filteredAcceptedItems.map((item) => {
                  const intern = item.internship;

                  return (
                    <motion.div
                      key={intern._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-base truncate">
                            {intern.role || "Internship"}
                          </h3>
                          {intern.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#4B9C93] bg-[#E6F7F3] px-2 py-0.5 rounded-full">
                              <BadgeCheck className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-medium text-gray-600 mb-2">
                          {intern.company || "Company"}
                        </p>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-3">
                          <span className="inline-flex items-center gap-1">
                            <Monitor className="w-3.5 h-3.5 text-gray-400" />
                            {intern.mode || "remote"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {intern.location || "Remote"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Wallet className="w-3.5 h-3.5 text-gray-400" />
                            {formatStipend(intern)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                            {intern.duration || "N/A"}
                          </span>
                        </div>

                        {/* Skills */}
                        {Array.isArray(intern.skills) && intern.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {intern.skills.map((skill) => (
                              <span
                                key={skill}
                                className="text-[10px] font-semibold text-[#4B9C93] bg-[#E6F7F3] px-2.5 py-0.5 rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Status / Links */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <span className="text-xs font-semibold text-[#4B9C93] bg-[#E6F7F3] px-3.5 py-2 rounded-full flex items-center gap-1.5 border border-[#4B9C93]/20">
                          <CheckCircle className="w-4 h-4" />
                          Accepted / Interested
                        </span>

                        {intern.applicationUrl && (
                          <a
                            href={intern.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-full transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Apply on Portal
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-white rounded-2xl p-10 border border-gray-200 shadow-sm text-center flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-[#E6F7F3] flex items-center justify-center text-[#4B9C93] mb-4">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    No accepted internships yet
                  </h3>
                  <p className="text-sm text-gray-500 max-w-[320px] mb-5">
                    Swipe right or click Accept on internships in the Discovery Deck to express interest.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("Internships")}
                    className="px-6 py-2.5 rounded-full bg-[#4B9C93] text-white text-sm font-semibold hover:bg-[#3d867e] transition-all"
                  >
                    Go to Discovery Deck
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ──────────────── JOBS / COMPANIES PLACEHOLDER ──────────────── */
            <div className="w-full max-w-[600px] bg-white rounded-2xl p-10 border border-gray-200 shadow-sm text-center flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-[#E6F7F3] flex items-center justify-center text-[#4B9C93] mb-4">
                {activeTab === "Jobs" ? (
                  <Briefcase className="w-7 h-7" />
                ) : (
                  <Building2 className="w-7 h-7" />
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {activeTab === "Jobs"
                  ? "Jobs Feed Coming Soon"
                  : "Company Directory Coming Soon"}
              </h3>
              <p className="text-sm text-gray-500 max-w-[320px] mb-5">
                We are currently focusing on internship discovery. Check back soon for full-time {activeTab.toLowerCase()}.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("Internships")}
                className="px-6 py-2.5 rounded-full bg-[#4B9C93] text-white text-sm font-semibold hover:bg-[#3d867e] transition-all"
              >
                Back to Discovery Deck
              </button>
            </div>
          )}
        </main>

        {/* Confirmation dialog for rejecting a saved internship */}
        <AnimatePresence>
          {rejectConfirmCard && (
            <div
              id="reject-saved-dialog-backdrop"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
              onClick={(e) => {
                if (e.target === e.currentTarget && !isRejectingSaved) {
                  handleKeepSaved();
                }
              }}
            >
              <motion.div
                id="reject-saved-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reject-saved-title"
                aria-describedby="reject-saved-message"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                    <Bookmark className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <h3
                      id="reject-saved-title"
                      className="font-bold text-gray-900 text-base"
                    >
                      Remove from Saved?
                    </h3>
                    <p
                      id="reject-saved-message"
                      className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed"
                    >
                      This internship is saved. Rejecting it will remove it from Saved. Continue?
                    </p>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    id="keep-saved-btn"
                    type="button"
                    disabled={isRejectingSaved}
                    onClick={handleKeepSaved}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors cursor-pointer disabled:opacity-50 text-center"
                  >
                    Keep Saved
                  </button>
                  <button
                    id="confirm-remove-saved-reject-btn"
                    type="button"
                    disabled={isRejectingSaved}
                    onClick={handleConfirmRemoveFromSavedAndReject}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors shadow-sm shadow-red-200 cursor-pointer disabled:opacity-50 text-center"
                  >
                    {isRejectingSaved ? "Removing & Rejecting..." : "Remove from Saved & Reject"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}