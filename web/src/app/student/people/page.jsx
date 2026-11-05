"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  X,
  ExternalLink,
  GraduationCap,
  CheckCircle2,
  Share2,
  MessageSquare,
} from "lucide-react";

import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import StudentRoleTag, { STUDENT_ROLE_TAGS } from "@/components/StudentRoleTag";
import { peopleService, apiRequest } from "@/services/apiClient";

export default function StudentPeoplePage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [minScore, setMinScore] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [starredIds, setStarredIds] = useState(new Set());
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  // Lazy load more on scroll — no dependency on filteredCandidates to avoid TDZ error
  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 300
      ) {
        setVisibleCount((prev) => prev + 6);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch real users from MongoDB via Express API
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    peopleService.list({ role: "student" }).then((data) => {
      if (!isMounted) return;
      if (Array.isArray(data)) {
        const formatted = data.map((u, i) => {
          const rawSkills = u.primarySkills && u.primarySkills.length > 0
            ? u.primarySkills
            : (u.skills ? u.skills.map((s) => (typeof s === "string" ? s : s.name)) : []);
          return {
            id: u._id || u.id || i + 1,
            name: u.name,
            tag: u.roleTag || "Student",
            role: u.headline || "Student Developer",
            college: u.college || "",
            department: u.branch || u.course || "",
            location: u.location || "",
            score: u.reputationScore ?? u.score ?? 0,
            avatar: u.profileIcon || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "Student")}&background=4B9C93&color=fff&size=180`,
            skills: rawSkills.slice(0, 2),
            allSkills: rawSkills,
            bio: u.bio || "",
            projects: u.projects || [],
          };
        });
        setCandidates(formatted);
      }
      setLoading(false);
    }).catch(() => {
      if (isMounted) setLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const toggleStar = (id, name) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast(`Removed star from ${name}`);
      } else {
        next.add(id);
        showToast(`Gave a star to ${name}! ⭐`);
      }
      return next;
    });

    // Fire API call asynchronously
    apiRequest(`/bookmarks/candidates/${id}`, "POST").catch(() => {});
  };

  // Filter candidates based on search & filters
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      // Role filter
      if (selectedRole !== "all" && c.role.toLowerCase() !== selectedRole.toLowerCase()) {
        return false;
      }
      // Score filter
      if (c.score < minScore) {
        return false;
      }
      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.college.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.tag?.toLowerCase().includes(q) ||
        c.allSkills.some((s) => s.toLowerCase().includes(q)) ||
        c.score.toString().includes(q)
      );
    });
  }, [candidates, searchQuery, selectedRole, minScore]);

  // Unique roles for filter dropdown
  const uniqueRoles = useMemo(() => {
    const roles = new Set(candidates.map((c) => c.role));
    return Array.from(roles);
  }, [candidates]);

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex">
      {/* ──── Sidebar ──── */}
      <DashboardSidebar />

      {/* ──── Main Content Area ──── */}
      <div className="flex-1 md:ml-[220px] ml-0 flex flex-col min-h-screen relative pb-12 w-full max-w-full overflow-x-hidden">
        {/* Top Header */}
        <DashboardHeader
          title="Community & Innovators"
          subtitle="Discover verified student engineers, contributors, and campus peers"
        />

        {/* Toast notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-[#4B9C93]" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 max-w-[1440px] w-full mx-auto">
          {/* ──── Search Bar & Filter Button — sticky below header ──── */}
          <div className="sticky top-[52px] sm:top-[60px] z-20 bg-[#F7F9F9] px-3 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Search Input Container */}
            <div className="flex-1 relative flex items-center bg-white border-2 border-[#E5E6E5] rounded-full h-11 sm:h-16 px-3.5 sm:px-6 shadow-xs focus-within:border-[#4B9C93] focus-within:ring-2 focus-within:ring-[#4B9C93]/15 transition-all">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#292D32] shrink-0" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates by skill, college, score..."
                className="w-full bg-transparent pl-2.5 sm:pl-4 pr-2 text-xs sm:text-[15px] font-medium text-[#101828] placeholder:text-[#67727A]/80 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Circular Filter Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterModal(!showFilterModal)}
                aria-label="Filter candidates"
                className={`w-11 h-11 sm:w-16 sm:h-16 rounded-full border-2 border-[#E5E6E5] bg-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:border-[#4B9C93] hover:bg-[#F8FAFC] transition-all ${
                  showFilterModal || selectedRole !== "all" || minScore > 0 ? "border-[#4B9C93] ring-2 ring-[#4B9C93]/20" : ""
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 sm:w-6 sm:h-6 text-[#292D32]" strokeWidth={2} />
              </button>

              {/* Filter Dropdown Popover / Modal on Mobile */}
              {showFilterModal && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
                    onClick={() => setShowFilterModal(false)}
                  />
                  <div className="fixed sm:absolute inset-x-4 top-24 sm:inset-x-auto sm:right-0 sm:top-18 w-auto sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <h4 className="text-sm font-bold text-gray-900">Filter Candidates</h4>
                      <button
                        type="button"
                        onClick={() => setShowFilterModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="py-4 space-y-4">
                      {/* Role Filter */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          Domain / Role
                        </label>
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-[#4B9C93]"
                        >
                          <option value="all">All Roles</option>
                          {uniqueRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Minimum Score */}
                      <div>
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
                          <span>Min Verification Score</span>
                          <span className="text-[#4B9C93] font-bold">{minScore} pts</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="85"
                          step="5"
                          value={minScore}
                          onChange={(e) => setMinScore(Number(e.target.value))}
                          className="w-full accent-[#4B9C93] cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRole("all");
                          setMinScore(0);
                        }}
                        className="text-xs font-semibold text-gray-500 hover:text-gray-800 px-3 py-1.5 cursor-pointer"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFilterModal(false)}
                        className="text-xs font-semibold bg-[#4B9C93] text-white px-4 py-2 rounded-xl hover:bg-[#3d837b] transition-colors cursor-pointer"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Active filter pills */}
          {(selectedRole !== "all" || minScore > 0 || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs text-gray-500 font-medium">Active filters:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-full text-gray-700">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedRole !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#CCFBF1] text-[#0D9488] font-medium px-2.5 py-1 rounded-full">
                  Skill Role: {selectedRole}
                  <button onClick={() => setSelectedRole("all")} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {minScore > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#CCFBF1] text-[#0D9488] font-medium px-2.5 py-1 rounded-full">
                  Score ≥ {minScore}
                  <button onClick={() => setMinScore(0)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRole("all");
                  setMinScore(0);
                }}
                className="text-xs text-[#4B9C93] hover:underline font-semibold ml-2 cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
          </div>

          <div className="px-3 sm:px-8 pb-8">

          {/* ──── Talent Grid ──── */}
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sk) => (
                <div
                  key={sk}
                  className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 flex flex-col justify-between animate-pulse"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-[84px] h-[84px] sm:w-[90px] sm:h-[90px] rounded-lg bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2.5">
                      <div className="h-5 bg-slate-200 rounded w-1/2" />
                      <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                      <div className="h-3.5 bg-slate-100 rounded w-2/3" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-6 bg-slate-100 rounded w-1/3" />
                    <div className="h-7 bg-slate-200 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-8 max-w-xl mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#E6F7F3] text-[#4B9C93] flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No candidates found</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                We couldn't find any student matches for your current filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRole("all");
                  setMinScore(0);
                }}
                className="px-5 py-2.5 bg-[#4B9C93] text-white text-xs font-semibold rounded-xl hover:bg-[#3d837b] transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
              {filteredCandidates.slice(0, visibleCount).map((candidate) => {
                const isStarred = starredIds.has(candidate.id);

                return (
                  <div
                    key={candidate.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_12px_0_rgba(15,23,42,0.02)] hover:shadow-md transition-all duration-200 p-4 sm:p-6 flex flex-col justify-between"
                  >
                    {/* Top Row: Avatar + Info */}
                    <div className="flex items-start gap-3 sm:gap-5">
                      {/* Avatar Group & Score Badge */}
                      <div className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0">
                        <img
                          src={candidate.avatar}
                          alt={candidate.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              candidate.name
                            )}&background=4B9C93&color=fff&size=180`;
                          }}
                          className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl object-cover bg-slate-100 border border-slate-100"
                        />
                        <div className="h-5 px-2 py-0.5 rounded-md bg-[#CCFBF1] flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[#5CA59D] text-[#5CA59D]" />
                          <span className="text-[10px] font-bold text-[#0D9488] leading-none">
                            {candidate.score + (isStarred ? 1 : 0)}
                          </span>
                        </div>
                      </div>

                      {/* Info Block */}
                      <div className="flex-1 min-w-0">
                        {/* Name & Give Star Button */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                            <h3 className="text-base sm:text-[18px] font-semibold text-[#0F172A] leading-snug">
                              {candidate.name}
                            </h3>
                            {candidate.tag && (
                              <StudentRoleTag tag={candidate.tag} size="xs" />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleStar(candidate.id, candidate.name)}
                            aria-label={isStarred ? "Remove star" : "Give star to candidate"}
                            title={isStarred ? "Starred" : "Give star"}
                            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              isStarred
                                ? "border-amber-400 bg-amber-400 text-white shadow-xs"
                                : "border-[#00BBA7] bg-[#F8FAFC] text-[#64748B] hover:text-amber-500 hover:border-amber-400 hover:bg-amber-50/50"
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                isStarred ? "fill-white text-white" : "stroke-[2]"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Role / Title */}
                        <p className="text-xs font-normal text-[#202121] mt-0.5 line-clamp-1">
                          {candidate.role}
                        </p>

                        {/* Details Meta */}
                        <div className="mt-1 space-y-0.5">
                          {candidate.college && (
                            <p className="text-xs sm:text-[13px] font-medium text-[#475569] line-clamp-1">
                              {candidate.college}
                            </p>
                          )}
                          {candidate.department && (
                            <p className="text-[11px] sm:text-xs text-[#64748B] line-clamp-1">
                              {candidate.department}
                            </p>
                          )}
                          {candidate.location && (
                            <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#64748B] pt-0.5">
                              <MapPin className="w-3 h-3 shrink-0 text-[#64748B]" strokeWidth={2} />
                              <span className="truncate">{candidate.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Skills + Chat & View Portfolio */}
                    <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">
                      {/* Skills Pill Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        {candidate.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-[11px] sm:text-xs font-medium text-[#475569]"
                          >
                            {skill}
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(candidate)}
                          className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#F8FAFC] text-[11px] sm:text-xs font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                        >
                          + More
                        </button>
                      </div>

                      {/* Chat & View Portfolio Buttons */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto">
                        <Link
                          href={`/student/chats?user=${candidate.id}&name=${encodeURIComponent(candidate.name)}`}
                          className="flex-1 sm:flex-none justify-center px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedCandidate(candidate)}
                          className="flex-1 sm:flex-none justify-center px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#C5F1EC] hover:bg-[#b0eae3] text-xs font-semibold text-[#475569] hover:text-[#0F172A] flex items-center gap-1 transition-all cursor-pointer shadow-xs whitespace-nowrap"
                        >
                          <span>Portfolio</span>
                          <ArrowRight className="w-3 h-3 text-[#475569]" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ──── Lazy Loading Indicator ──── */}
          {visibleCount < filteredCandidates.length && (
            <div className="flex justify-center items-center py-8">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-6 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs transition-all cursor-pointer"
              >
                Load More Innovators
              </button>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* ──── Candidate Portfolio Modal ──── */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <img
                  src={selectedCandidate.avatar}
                  alt={selectedCandidate.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedCandidate.name}
                    </h3>
                    {selectedCandidate.tag && (
                      <StudentRoleTag tag={selectedCandidate.tag} size="sm" />
                    )}
                    <div className="h-5 px-2 rounded-md bg-[#CCFBF1] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#5CA59D] text-[#5CA59D]" />
                      <span className="text-[10px] font-bold text-[#0D9488]">
                        {selectedCandidate.score + (starredIds.has(selectedCandidate.id) ? 1 : 0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <p className="text-xs font-semibold text-[#4B9C93]">
                      {selectedCandidate.role}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span>{selectedCandidate.location}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-6 space-y-6">
              {/* System Platform Role */}
              {selectedCandidate.tag && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <StudentRoleTag tag={selectedCandidate.tag} size="md" />
                    <div>
                      <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <span>Platform Role:</span>
                        <span className="text-[#0D9488] font-extrabold">{selectedCandidate.tag}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {STUDENT_ROLE_TAGS[selectedCandidate.tag]?.desc || "Assigned system role"}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full shrink-0 shadow-2xs">
                    Admin Assigned
                  </span>
                </div>
              )}

              {/* About */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  About
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedCandidate.bio}
                </p>
              </div>

              {/* Education */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Education & Department
                </h4>
                <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-3.5 flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-[#4B9C93] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900">
                      {selectedCandidate.college}
                    </h5>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedCandidate.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Skills */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Verified Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.allSkills.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-[#F8FAFC] border border-gray-200 rounded-full text-xs font-medium text-gray-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Projects */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Featured Projects
                </h4>
                <div className="space-y-2.5">
                  {selectedCandidate.projects.map((proj) => (
                    <div
                      key={proj.name}
                      className="border border-gray-200 rounded-xl p-3.5 hover:border-[#4B9C93]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-gray-900">{proj.name}</h5>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{proj.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  toggleStar(selectedCandidate.id, selectedCandidate.name);
                }}
                className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  starredIds.has(selectedCandidate.id)
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Star
                  className={`w-3.5 h-3.5 ${
                    starredIds.has(selectedCandidate.id)
                      ? "fill-amber-500 text-amber-500"
                      : ""
                  }`}
                />
                <span>
                  {starredIds.has(selectedCandidate.id) ? "Starred" : "Give Star"}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Candidate profile link copied to clipboard`);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <Link
                  href={`/student/chats?user=${selectedCandidate.id}&name=${encodeURIComponent(selectedCandidate.name)}`}
                  className="px-5 py-2 bg-[#4B9C93] hover:bg-[#3d837b] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
