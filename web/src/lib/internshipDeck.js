/**
 * Internship Deck Logic & Utilities
 * Handles deck reload, shuffle, deduplication, status annotation (saved/applied), pagination, and empty state categorization.
 */

// Format stipend range or single amount
export function formatStipend(item) {
  if (!item) return "Unpaid";
  if (
    item.compensationType === "unpaid" ||
    item.stipend === "Unpaid" ||
    item.stipendText === "Unpaid"
  ) {
    return "Unpaid";
  }
  if (item.compensationType === "skill-based") return "Skill-based";

  const min = item.stipendMin;
  const max = item.stipendMax;

  if (item.stipendMode === "fixed" && min != null && min > 0) {
    return `₹${Number(min).toLocaleString("en-IN")}`;
  }
  if (min != null && max != null && (min > 0 || max > 0)) {
    return `₹${Number(min).toLocaleString("en-IN")} - ₹${Number(
      max
    ).toLocaleString("en-IN")}`;
  }
  if (item.stipendText) return item.stipendText;
  if (item.stipend) return item.stipend;
  if (min != null && min > 0) {
    return `₹${Number(min).toLocaleString("en-IN")}`;
  }
  if (item.compensationType === "flexible") return "Flexible";
  return "Unpaid";
}

// Convert backend internship fields into the card format.
export function mapInternship(
  item,
  { savedIds = new Set(), appliedIds = new Set(), acceptedIds = new Set() } = {}
) {
  if (!item) return null;
  const id = String(item._id || item.id || "");
  const stipend = formatStipend(item);

  return {
    id,
    companyName: item.company || "Unknown Company",
    companyLogo: item.companyLogo || "",
    posterImage: item.posterImage || "",
    companyLogoText: item.company?.toUpperCase() || "COMPANY",
    companyLogoSubText: "",
    roleTitle: item.role || "Internship",
    location: item.location || (item.mode === "remote" ? "Remote" : "Location not specified"),
    mode: item.mode || "onsite",
    stipend,
    duration: item.duration || "Not specified",
    skills: Array.isArray(item.skills) ? item.skills : [],
    // Genuine company verification badge only: never derive or enable isVerified from accepted/interested action history
    isVerified: Boolean(item.isVerified),
    isSaved: savedIds instanceof Set ? savedIds.has(id) : Boolean(item.isSaved),
    isApplied: appliedIds instanceof Set ? appliedIds.has(id) : Boolean(item.isApplied),
    isAccepted: acceptedIds instanceof Set ? acceptedIds.has(id) : Boolean(item.isAccepted),
    jobType: item.employmentType || "Internship",
    postedTime: item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-IN")
      : "Recently posted",
    description:
      item.responsibilities || item.description || "No description available.",
    applicationUrl: item.applicationUrl || "",
    department: item.department || "",
    track: item.track || "",
  };
}

/**
 * Shuffles an array of internships using Fisher-Yates algorithm.
 * Returns a new shuffled array without mutating the original.
 */
export function shuffleInternships(items) {
  if (!Array.isArray(items) || items.length <= 1) {
    return Array.isArray(items) ? [...items] : [];
  }
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Deduplicates an array of internship objects by their ID,
 * ensuring no duplicates within the array and excluding any ID in existingIds.
 */
export function deduplicateInternships(items, existingIds = new Set()) {
  if (!Array.isArray(items)) return [];
  const seen = existingIds instanceof Set ? new Set(existingIds) : new Set(existingIds || []);
  const unique = [];

  for (const item of items) {
    if (!item) continue;
    const id = String(item.id || item._id || "");
    if (id && !seen.has(id)) {
      seen.add(id);
      unique.push(item);
    }
  }

  return unique;
}

/**
 * Extracts student action and application status sets:
 * - savedIds: internships marked saved (saved === true)
 * - appliedIds: internships applied to via applications
 * - acceptedIds: internships marked accepted/interested
 *
 * NOTE: These sets are used for status badging (showing "Saved" badge on cards)
 * and duplicate application prevention. Active internships are NOT excluded based on this history.
 */
export function extractStudentStatusSets(actions = [], applications = []) {
  const savedIds = new Set();
  const acceptedIds = new Set();
  const appliedIds = new Set();

  if (Array.isArray(actions)) {
    for (const item of actions) {
      if (!item) continue;
      const intern = item.internship;
      const id = typeof intern === "string" ? intern : intern?._id || intern?.id;
      if (!id) continue;

      if (item.saved === true) savedIds.add(String(id));
      if (item.decision === "accepted") acceptedIds.add(String(id));
    }
  }

  if (Array.isArray(applications)) {
    for (const app of applications) {
      if (!app) continue;
      const intern = app.internship;
      const id = typeof intern === "string" ? intern : intern?._id || intern?.id;
      if (id) appliedIds.add(String(id));
    }
  }

  return { savedIds, acceptedIds, appliedIds };
}

/**
 * Filters incoming internships for the current deck cycle.
 * Only deduplicates against already seen/present items in the current deck cycle.
 * Does NOT exclude items based on past actions (accepted, saved, rejected/skipped).
 */
export function filterCycleInternships(items, seenInCycle = new Set()) {
  if (!Array.isArray(items)) return [];
  const seenSet = seenInCycle instanceof Set ? seenInCycle : new Set(seenInCycle || []);

  const seenInBatch = new Set();
  const eligible = [];

  for (const item of items) {
    if (!item) continue;
    const id = String(item.id || item._id || "");
    if (!id) continue;
    // Do not repeat cards already shown in the current browsing cycle
    if (seenSet.has(id)) continue;
    // Deduplicate within the incoming batch
    if (seenInBatch.has(id)) continue;

    seenInBatch.add(id);
    eligible.push(item);
  }

  return eligible;
}

/**
 * Builds query parameters for fetching internships.
 */
export function buildInternshipQueryParams({
  page = 1,
  limit = 10,
  filters = {},
  search = "",
} = {}) {
  const params = new URLSearchParams();

  if (page) params.set("page", String(page));
  if (limit) params.set("limit", String(limit));

  if (filters.mode) params.set("mode", filters.mode);
  if (filters.location?.trim()) params.set("location", filters.location.trim());
  if (filters.skill?.trim()) params.set("skill", filters.skill.trim());
  if (filters.verified) params.set("verified", filters.verified);
  if (filters.department?.trim()) params.set("department", filters.department.trim());
  if (filters.track?.trim()) params.set("track", filters.track.trim());

  const searchTerm = (search || filters.search || "").trim();
  if (searchTerm) params.set("search", searchTerm);

  return params.toString();
}

/**
 * Categorizes why the deck is empty to display the most helpful state.
 */
export function determineEmptyReason({
  totalAvailable = 0,
  deckCount = 0,
  hasFilters = false,
  apiError = null,
} = {}) {
  if (apiError) return "error";
  if (deckCount > 0) return null;
  if (hasFilters) return "no_filter_matches";
  if (totalAvailable === 0) return "no_internships";
  return "exhausted";
}

/**
 * Fetch action and application records from the server to compute status sets.
 */
export async function fetchUserStatusSets(apiUrl, token, customFetch = fetch) {
  if (!token) {
    return { savedIds: new Set(), acceptedIds: new Set(), appliedIds: new Set() };
  }

  try {
    const headers = { Authorization: `Bearer ${token}` };

    const [actionsRes, appsRes] = await Promise.all([
      customFetch(`${apiUrl}/internship-actions/my-actions`, { headers }).catch(() => null),
      customFetch(`${apiUrl}/applications/my-applications`, { headers }).catch(() => null),
    ]);

    let actions = [];
    let applications = [];

    if (actionsRes && actionsRes.ok) {
      const data = await actionsRes.json();
      if (data.success && Array.isArray(data.data)) {
        actions = data.data;
      }
    }

    if (appsRes && appsRes.ok) {
      const data = await appsRes.json();
      if (data.success && Array.isArray(data.data)) {
        applications = data.data;
      }
    }

    return extractStudentStatusSets(actions, applications);
  } catch (error) {
    console.warn("Unable to fetch user status sets:", error);
    return { savedIds: new Set(), acceptedIds: new Set(), appliedIds: new Set() };
  }
}

/**
 * Un-saves an internship and marks it rejected, keeping both states in sync in the backend.
 * Does not alter or delete unrelated action or application history.
 */
export async function removeSavedAndRejectInternship(internshipId, saveActionFn) {
  if (!internshipId || typeof saveActionFn !== "function") return;
  // 1. Remove saved state
  await saveActionFn(internshipId, "unsaved");
  // 2. Mark rejected
  await saveActionFn(internshipId, "rejected");
}
