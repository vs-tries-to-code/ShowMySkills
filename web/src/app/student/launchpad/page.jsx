"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  Banknote,
  X,
  ExternalLink,
  Building2,
  CheckCircle2,
  Share2,
  Globe,
  Briefcase,
  Clock,
} from "lucide-react";

import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { launchpadService } from "@/services/apiClient";

// Reusable Company Logo Component
function CompanyLogo({ logoType, companyName = "" }) {
  if (logoType === "visa") {
    return (
      <div className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl bg-[#1A1F71] flex items-center justify-center p-2 border border-blue-900 shadow-xs shrink-0">
        <span className="text-xl sm:text-2xl font-black italic tracking-wider text-white select-none">
          VIS<span className="text-[#F7B600]">A</span>
        </span>
      </div>
    );
  }

  if (logoType === "atlassian") {
    return (
      <div className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl bg-[#0052CC] flex items-center justify-center border border-blue-700 shadow-xs shrink-0">
        <svg className="w-7 h-7 sm:w-[42px] sm:h-[42px]" viewBox="0 0 32 32" fill="none">
          <path d="M15.4 6.7c-.4-.5-1.1-.6-1.6-.1L6.1 13.9c-.3.3-.5.7-.5 1.1 0 .9.7 1.6 1.6 1.6h5.8c.6 0 1.1-.3 1.4-.8l1-1.6c1.1-1.8 1.1-4.1 0-5.9v-.1c0-.5 0-.9 0-1.5z" fill="#2684FF"/>
          <path d="M16.6 25.3c.4.5 1.1.6 1.6.1l7.7-7.3c.3-.3.5-.7.5-1.1 0-.9-.7-1.6-1.6-1.6H19c-.6 0-1.1.3-1.4.8l-1 1.6c-1.1 1.8-1.1 4.1 0 5.9v.1c0 .5 0 .9 0 1.5z" fill="#FFFFFF"/>
        </svg>
      </div>
    );
  }

  if (logoType === "google") {
    return (
      <div className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-xs shrink-0">
        <svg className="w-7 h-7 sm:w-[42px] sm:h-[42px]" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
      </div>
    );
  }

  if (logoType === "microsoft") {
    return (
      <div className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl bg-[#2F2F2F] flex items-center justify-center border border-slate-700 shadow-xs shrink-0">
        <div className="grid grid-cols-2 gap-1 sm:gap-1.5 p-1.5 sm:p-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#F25022]" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#7FBA00]" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#00A4EF]" />
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[#FFB900]" />
        </div>
      </div>
    );
  }

  if (logoType === "vercel") {
    return (
      <div className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl bg-black flex items-center justify-center border border-slate-800 shadow-xs shrink-0">
        <svg className="w-7 h-6 sm:w-[40px] sm:h-[35px]" viewBox="0 0 116 100" fill="white">
          <path d="M57.5 0L115 100H0L57.5 0Z" />
        </svg>
      </div>
    );
  }

  if (logoType === "supabase") {
    return (
      <div className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl bg-[#1C1C1C] flex items-center justify-center border border-emerald-900/40 shadow-xs shrink-0">
        <svg className="w-7 h-7 sm:w-[42px] sm:h-[42px]" viewBox="0 0 109 113" fill="none">
          <path d="M63.7 110.3C61.3 113.4 56.2 111.7 56.1 107.8L54.7 67.2H97.7C103.5 67.2 106.7 60.5 103.1 55.9L48.2 2.7C45.8 -0.4 40.7 1.3 40.8 5.2L42.2 45.8H1.3C-4.5 45.8 -7.7 52.5 -4.1 57.1L50.8 110.3H63.7Z" fill="#3ECF8E" />
        </svg>
      </div>
    );
  }

  if (logoType === "uber") {
    return (
      <div className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl bg-black flex items-center justify-center border border-slate-800 shadow-xs shrink-0">
        <span className="text-sm sm:text-xl font-bold tracking-widest text-white">UBER</span>
      </div>
    );
  }

  if (logoType === "amazon") {
    return (
      <div className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl bg-[#232F3E] flex items-center justify-center border border-slate-700 shadow-xs shrink-0 flex-col">
        <span className="text-xs sm:text-sm font-bold text-white tracking-wider">amazon</span>
        <svg className="w-6 h-2 sm:w-[34px] sm:h-[10px] mt-0.5" viewBox="0 0 34 10" fill="none">
          <path d="M1 4C8 8.5 22 9 32 1.5" stroke="#FF9900" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="w-14 h-14 sm:w-[90px] sm:h-[90px] rounded-xl bg-[#4B9C93] text-white flex items-center justify-center text-sm sm:text-xl font-bold border border-[#4B9C93] shadow-xs shrink-0">
      {companyName ? companyName.slice(0, 2).toUpperCase() : "INT"}
    </div>
  );
}

export default function StudentLaunchpadPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleType, setSelectedRoleType] = useState("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  // Lazy load more on scroll — no dependency on filteredInternships to avoid TDZ error
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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    launchpadService.list({}).then((res) => {
      if (!isMounted) return;
      if (Array.isArray(res)) {
        const formatted = res.map((item, idx) => ({
          id: item._id || item.id || idx + 1,
          position: item.position,
          company: item.company,
          oneLiner: item.oneLiner,
          location: item.location || "",
          stipend: item.stipend || "",
          duration: item.duration || "",
          clicks: item.clicks || (item.clickCount != null ? `${item.clickCount} clicks` : ""),
          logoType: item.logoType || "generic",
          applyUrl: item.applyUrl,
          skills: item.skills || [],
          allSkills: item.allSkills || item.skills || [],
          about: item.about || "",
          perks: item.perks || "",
        }));
        setInternships(formatted);
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

  const toggleBookmark = (id, title) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        showToast(`Removed from saved internships`);
      } else {
        next.add(id);
        showToast(`Saved "${title}" to shortlisted jobs`);
      }
      return next;
    });
  };

  // Filter internships based on search query & filters
  const filteredInternships = useMemo(() => {
    return internships.filter((item) => {
      if (selectedRoleType !== "all" && !item.position.toLowerCase().includes(selectedRoleType.toLowerCase())) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.position.toLowerCase().includes(q) ||
        item.company.toLowerCase().includes(q) ||
        item.oneLiner.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.stipend.toLowerCase().includes(q) ||
        item.allSkills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [internships, searchQuery, selectedRoleType]);

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex">
      {/* ──── Sidebar ──── */}
      <DashboardSidebar />

      {/* ──── Main Content Area ──── */}
      <div className="flex-1 md:ml-[220px] ml-0 flex flex-col min-h-screen relative pb-12 w-full max-w-full overflow-x-hidden">
        {/* Top Header */}
        <DashboardHeader
          title="Launchpad Opportunities"
          subtitle="Explore verified engineering and product internships curated for you"
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
          <div className="sticky top-[52px] sm:top-[60px] z-20 bg-[#F7F9F9] px-3 sm:px-8 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-100/60 sm:border-b-0 shadow-xs sm:shadow-none">
            <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Search Input Container */}
            <div className="flex-1 relative flex items-center bg-white border-2 border-[#E5E6E5] rounded-full h-11 sm:h-16 px-3.5 sm:px-6 shadow-xs focus-within:border-[#4B9C93] focus-within:ring-2 focus-within:ring-[#4B9C93]/15 transition-all">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-[#292D32] shrink-0" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by position, company, location, stipend, skill..."
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
                aria-label="Filter internships"
                className={`w-11 h-11 sm:w-16 sm:h-16 rounded-full border-2 border-[#E5E6E5] bg-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:border-[#4B9C93] hover:bg-[#F8FAFC] transition-all ${
                  showFilterModal || selectedRoleType !== "all" ? "border-[#4B9C93] ring-2 ring-[#4B9C93]/20" : ""
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
                      <h4 className="text-sm font-bold text-gray-900">Filter Internships</h4>
                      <button
                        type="button"
                        onClick={() => setShowFilterModal(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="py-4 space-y-4">
                      {/* Domain Filter */}
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                          Domain / Track
                        </label>
                        <select
                          value={selectedRoleType}
                          onChange={(e) => setSelectedRoleType(e.target.value)}
                          className="w-full text-xs bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:border-[#4B9C93]"
                        >
                          <option value="all">All Disciplines</option>
                          <option value="Software">Software Engineering (SWE/SDE)</option>
                          <option value="Analytics">Consulting & Analytics (VCA)</option>
                          <option value="Frontend">Frontend & Frameworks</option>
                          <option value="Database">Database Systems</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRoleType("all");
                          setSearchQuery("");
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
          {(selectedRoleType !== "all" || searchQuery) && (
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
              {selectedRoleType !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs bg-[#CCFBF1] text-[#0D9488] font-medium px-2.5 py-1 rounded-full">
                  Domain: {selectedRoleType}
                  <button onClick={() => setSelectedRoleType("all")} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRoleType("all");
                }}
                className="text-xs text-[#4B9C93] hover:underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}
          </div>

          <div className="px-3 sm:px-8 pb-8">

          {/* ──── Internship Cards Grid ──── */}
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
                      <div className="h-5 bg-slate-200 rounded w-2/3" />
                      <div className="h-3.5 bg-slate-100 rounded w-1/4" />
                      <div className="h-3.5 bg-slate-100 rounded w-4/5" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-6 bg-slate-100 rounded w-1/3" />
                    <div className="h-7 bg-slate-200 rounded w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredInternships.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-8 max-w-xl mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#E6F7F3] text-[#4B9C93] flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No internships found</h3>
              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                No active roles match your search term or filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRoleType("all");
                }}
                className="px-5 py-2.5 bg-[#4B9C93] text-white text-xs font-semibold rounded-xl hover:bg-[#3d837b] transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 lg:gap-6">
              {filteredInternships.slice(0, visibleCount).map((item) => {
                const isBookmarked = bookmarkedIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E2E8F0] shadow-[0_4px_12px_0_rgba(15,23,42,0.02)] hover:shadow-md transition-all duration-200 p-4 sm:p-6 flex flex-col justify-between"
                  >
                    {/* Top Row: Company Logo + Info */}
                    <div className="flex items-start gap-3 sm:gap-5">
                      {/* Logo Group & Number of Clicks Badge */}
                      <div className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0">
                        <CompanyLogo logoType={item.logoType} companyName={item.company} />
                        <div className="h-5 px-1.5 sm:px-2 py-0.5 rounded-md bg-[#CCFBF1] flex items-center justify-center gap-1 whitespace-nowrap">
                          <MousePointerClick className="w-3 h-3 text-[#0D9488]" strokeWidth={2.2} />
                          <span className="text-[10px] font-bold text-[#0D9488] leading-none">
                            {item.clicks}
                          </span>
                        </div>
                      </div>

                      {/* Info Block */}
                      <div className="flex-1 min-w-0">
                        {/* Position Title & Bookmark */}
                        <div className="flex items-start justify-between gap-1.5">
                          <h3
                            onClick={() => setSelectedInternship(item)}
                            className="text-base sm:text-[18px] font-semibold text-[#0F172A] leading-snug truncate cursor-pointer hover:text-[#4B9C93] transition-colors"
                          >
                            {item.position}
                          </h3>
                          <button
                            type="button"
                            onClick={() => toggleBookmark(item.id, item.position)}
                            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark internship"}
                            className={`w-7 h-7 rounded-full border border-[#00BBA7] flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                              isBookmarked
                                ? "bg-[#00BBA7] text-white"
                                : "bg-[#F8FAFC] text-[#64748B] hover:text-[#00BBA7] hover:bg-[#E6F7F3]"
                            }`}
                          >
                            <Bookmark
                              className={`w-3.5 h-3.5 ${
                                isBookmarked ? "fill-white text-white" : "stroke-[2]"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Company Name */}
                        <p className="text-xs font-semibold text-[#4B9C93] mt-0.5">
                          {item.company}
                        </p>

                        {/* Short One-line Description */}
                        <p className="text-xs text-[#202121] mt-1 line-clamp-1 leading-relaxed">
                          {item.oneLiner}
                        </p>

                        {/* Details Meta: Location & Stipend */}
                        <div className="mt-1.5 sm:mt-2 space-y-1">
                          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#64748B] truncate">
                            <MapPin className="w-3 h-3 shrink-0 text-[#64748B]" strokeWidth={2} />
                            <span className="truncate">{item.location}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] pt-0.5 truncate">
                            <Banknote className="w-3.5 h-3.5 shrink-0 text-[#4B9C93]" strokeWidth={2} />
                            <span className="truncate text-[#0F172A]">{item.stipend}</span>
                            <span className="text-slate-300 font-normal">•</span>
                            <span className="text-[11px] text-[#64748B] font-normal">{item.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Skills/Tags + Apply Now */}
                    <div className="mt-3.5 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
                      {/* Skills/Tags Pill List */}
                      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                        {item.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-[11px] sm:text-xs font-medium text-[#475569] truncate"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Apply Now Button — Direct Redirection to Job Page */}
                      <a
                        href={item.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => launchpadService.recordClick(item.id)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-[#E2E8F0] bg-[#C5F1EC] hover:bg-[#b0eae3] text-xs font-semibold text-[#475569] hover:text-[#0F172A] flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 whitespace-nowrap"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3 h-3 text-[#475569]" strokeWidth={2} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ──── Lazy Loading Indicator ──── */}
          {visibleCount < filteredInternships.length && (
            <div className="flex justify-center items-center py-8">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-6 py-2.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs transition-all cursor-pointer"
              >
                Load More Opportunities
              </button>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* ──── Internship Detailed Modal ──── */}
      {selectedInternship && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <CompanyLogo logoType={selectedInternship.logoType} companyName={selectedInternship.company} />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {selectedInternship.position}
                  </h3>
                  <p className="text-xs font-bold text-[#4B9C93] mt-0.5">
                    {selectedInternship.company}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{selectedInternship.location}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInternship(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-6 space-y-6">
              {/* Stipend & Schedule Highlight Banner */}
              <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                    Monthly Stipend
                  </span>
                  <span className="text-base font-bold text-[#0F172A]">
                    {selectedInternship.stipend}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                    Duration & Batch
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedInternship.duration}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                    Candidate Activity
                  </span>
                  <span className="text-sm font-bold text-[#0D9488] flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    {selectedInternship.clicks}
                  </span>
                </div>
              </div>

              {/* Role Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Role Mission & Summary
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {selectedInternship.oneLiner}
                </p>
              </div>

              {/* Company & Team Context */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  About {selectedInternship.company}
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedInternship.about}
                </p>
              </div>

              {/* Skills & Qualifications */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Target Technical Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedInternship.allSkills || []).map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 bg-[#F8FAFC] border border-gray-200 rounded-full text-xs font-medium text-gray-700"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits & Perks */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Internship Perks & Benefits
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed bg-[#E6F7F3]/40 border border-[#4B9C93]/20 rounded-xl p-3">
                  {selectedInternship.perks}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  toggleBookmark(selectedInternship.id, selectedInternship.position);
                }}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {bookmarkedIds.has(selectedInternship.id) ? "Shortlisted" : "Shortlist"}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Shareable internship link copied to clipboard`);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
                <a
                  href={selectedInternship.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 bg-[#4B9C93] hover:bg-[#3d837b] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Apply Now</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
