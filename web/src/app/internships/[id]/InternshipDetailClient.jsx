"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  MapPin,
  CalendarDays,
  Wallet,
  Monitor,
  BadgeCheck,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  Share2,
  Bookmark,
  AlertCircle,
  FileText,
} from "lucide-react";

import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import CompanyLogo from "@/components/CompanyLogo";
import { internshipService, applicationService } from "@/services/apiClient";

function formatStipend(item) {
  if (!item) return "Unpaid";
  if (
    item.compensationType === "unpaid" ||
    item.stipend === "Unpaid" ||
    item.stipendText === "Unpaid"
  ) {
    return "Unpaid";
  }
  const min = item.stipendMin;
  const max = item.stipendMax;
  if (min != null && max != null && (min > 0 || max > 0)) {
    return `₹${Number(min).toLocaleString("en-IN")} - ₹${Number(max).toLocaleString("en-IN")}/mo`;
  } else if (min != null && min > 0) {
    return `₹${Number(min).toLocaleString("en-IN")}/mo`;
  } else if (max != null && max > 0) {
    return `₹${Number(max).toLocaleString("en-IN")}/mo`;
  }
  if (item.stipendText) return item.stipendText;
  if (item.stipend) return item.stipend;
  if (item.compensationType === "flexible") return "Flexible";
  return "Unpaid";
}

export default function InternshipDetailClient({ id: propId }) {
  const routeParams = useParams();
  const internshipId = propId || routeParams?.id;

  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyNotes, setApplyNotes] = useState("");
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  useEffect(() => {
    if (!internshipId || internshipId === "preview") {
      setLoading(false);
      setError("Please select an internship to view details.");
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      internshipService.getById(internshipId).catch(() => null),
      applicationService.getMyApplications().catch(() => []),
    ])
      .then(([internshipData, myApps]) => {
        if (!isMounted) return;

        if (!internshipData) {
          setError("Internship not found or no longer available.");
          setInternship(null);
        } else {
          setInternship(internshipData);

          if (Array.isArray(myApps)) {
            const existing = myApps.find((a) => {
              const aInternshipId =
                typeof a.internship === "object"
                  ? a.internship?._id || a.internship?.id
                  : a.internship || a.internshipId;
              return String(aInternshipId) === String(internshipId);
            });
            if (existing) {
              setAlreadyApplied(true);
              setApplicationStatus(existing.status);
            }
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Failed to load internship details.");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [internshipId]);

  const handleApply = async () => {
    if (!internshipId) return;
    setApplying(true);
    try {
      await internshipService.apply(internshipId, applyNotes);
      setAlreadyApplied(true);
      setShowApplyModal(false);
      showToast("Application submitted successfully!");
    } catch (err) {
      showToast(err.message || "Failed to submit application.");
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
    if (!internshipId) return;
    try {
      await internshipService.toggleBookmark(internshipId);
      setIsBookmarked((prev) => !prev);
      showToast(isBookmarked ? "Removed from bookmarks" : "Bookmarked for later!");
    } catch (err) {
      showToast(err.message || "Action failed.");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <DashboardSidebar />

      <main className="flex-1 md:ml-[220px] flex flex-col min-w-0 pb-16">
        <DashboardHeader />

        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#4B9C93]" />
            {toastMessage}
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/student/applications"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Applications
              </Link>
              <Link
                href="/student/internships"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 text-xs font-medium transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Browse Deck
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Share Posting"
                aria-label="Share Posting"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleBookmark}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  isBookmarked
                    ? "border-[#4B9C93] bg-teal-50 text-[#4B9C93]"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
                title="Bookmark Internship"
                aria-label="Bookmark Internship"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 shadow-xs">
              <div className="w-10 h-10 border-4 border-[#4B9C93]/20 border-t-[#4B9C93] rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Loading internship details</h3>
                <p className="text-xs text-slate-500 mt-1">Retrieving posting from verified database...</p>
              </div>
            </div>
          )}

          {/* Not Found / Error State */}
          {!loading && (error || !internship) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-900">Internship Posting Not Found</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {error || "The internship listing you requested could not be found. It may have expired or been removed by the recruiter."}
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/student/applications"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Return to Applications
                </Link>
                <Link
                  href="/student/internships"
                  className="px-4 py-2 bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-semibold rounded-xl transition-colors shadow-2xs"
                >
                  Discover Open Internships
                </Link>
              </div>
            </div>
          )}

          {/* Main Internship Details */}
          {!loading && internship && (
            <>
              {/* Header Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {internship.posterImage && (
                  <div className="w-full h-48 sm:h-64 bg-slate-100 overflow-hidden border-b border-slate-200 relative">
                    <img
                      src={internship.posterImage}
                      alt={internship.role || "Internship Poster"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <CompanyLogo
                      src={internship.companyLogo}
                      companyName={internship.company}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shrink-0"
                      fallbackClassName="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-slate-200 shrink-0 bg-teal-50 text-[#2b8a78] flex items-center justify-center font-bold text-xl tracking-wider select-none"
                    />

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                          {internship.role}
                        </h1>
                        {internship.isVerified && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-[#2b8a78] border border-teal-200">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wider">
                          {internship.status || "Active"}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-[#4B9C93] flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        {internship.company}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {internship.location || "Remote"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Monitor className="w-4 h-4 text-slate-400 capitalize" />
                          {internship.mode || "remote"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {internship.duration || "3 Months"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Top Action */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    {alreadyApplied ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Applied {applicationStatus ? `(${applicationStatus})` : ""}
                      </div>
                    ) : internship.applicationUrl ? (
                      <a
                        href={internship.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs inline-flex items-center gap-2 text-center justify-center"
                      >
                        Apply on Portal
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowApplyModal(true)}
                        className="px-6 py-2.5 bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs inline-flex items-center gap-2 cursor-pointer text-center justify-center"
                      >
                        <Briefcase className="w-4 h-4" />
                        Apply Now
                      </button>
                    )}

                    <span className="text-[11px] text-slate-400">
                      Posted on {internship.createdAt ? new Date(internship.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                    </span>
                  </div>
                </div>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Stipend
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5 flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5 text-[#4B9C93]" />
                      {formatStipend(internship)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Work Modality
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5 capitalize flex items-center gap-1">
                      <Monitor className="w-3.5 h-3.5 text-[#4B9C93]" />
                      {internship.mode || "Remote"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Duration
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5 flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-[#4B9C93]" />
                      {internship.duration || "3 Months"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Employment
                    </p>
                    <p className="text-sm font-extrabold text-slate-800 mt-0.5 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-[#4B9C93]" />
                      {internship.employmentType || internship.jobType || "Internship"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

              {/* Main Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Role Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* About the Role */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#4B9C93]" />
                      About the Role
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {internship.description || "No detailed description provided for this opening."}
                    </p>
                  </div>

                  {/* Responsibilities */}
                  {Array.isArray(internship.responsibilities) && internship.responsibilities.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#4B9C93]" />
                        Key Responsibilities
                      </h2>
                      <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                        {internship.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4B9C93] mt-2 shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required Skills */}
                  {Array.isArray(internship.skills) && internship.skills.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
                      <h2 className="text-base font-bold text-slate-900">
                        Required Skills & Technologies
                      </h2>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {internship.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 rounded-xl bg-teal-50 text-[#2b8a78] border border-teal-100 text-xs font-semibold"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Perks & Benefits */}
                  {internship.perks && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
                      <h2 className="text-base font-bold text-slate-900">Perks & Benefits</h2>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {internship.perks}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Column: Company & Summary */}
                <div className="space-y-6">
                  {/* Company Info Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#4B9C93]" />
                      About the Company
                    </h3>

                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        src={internship.companyLogo}
                        companyName={internship.company}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        fallbackClassName="w-12 h-12 rounded-xl border border-slate-200 shrink-0 bg-teal-50 text-[#2b8a78] flex items-center justify-center font-bold text-sm select-none"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{internship.company}</h4>
                        <p className="text-xs text-slate-500">{internship.location || "Headquarters"}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {internship.about ||
                        `${internship.company} is an active employer on ShowMySkills hiring top student talent.`}
                    </p>
                  </div>

                  {/* Application Box */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Application Status</h3>
                    {alreadyApplied ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Application Active
                        </div>
                        <p className="text-emerald-700">
                          You have submitted your profile for this opportunity. Track progress on your Applications dashboard.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500">
                          Submit your candidate profile, verified skills, and resume directly to the hiring team.
                        </p>
                        {internship.applicationUrl ? (
                          <a
                            href={internship.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs inline-flex items-center justify-center gap-2"
                          >
                            Apply on Recruiter Portal
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowApplyModal(true)}
                            className="w-full py-2.5 bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Briefcase className="w-4 h-4" />
                            Submit Application
                          </button>
                        )}
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>ShowMySkills Verified</span>
                      <Link href="/student/applications" className="text-[#4B9C93] font-semibold hover:underline">
                        My Applications
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Apply Notes Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  Apply for {internship?.role}
                </h3>
                <p className="text-xs text-slate-500">
                  Your ShowMySkills verified profile, skills, and portfolio will be submitted to {internship?.company}.
                </p>
              </div>

              <div>
                <label htmlFor="apply-notes" className="text-xs font-semibold text-slate-700 block mb-1">
                  Add a note or cover letter (Optional)
                </label>
                <textarea
                  id="apply-notes"
                  rows={3}
                  value={applyNotes}
                  onChange={(e) => setApplyNotes(e.target.value)}
                  placeholder="Introduce yourself or highlight relevant projects..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  disabled={applying}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApply}
                  disabled={applying}
                  className="px-5 py-2 bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-bold rounded-xl transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {applying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Confirm Application"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

