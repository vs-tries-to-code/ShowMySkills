"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Globe,
  Mail,
  Phone,
  Calendar,
  Users,
  Award,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Edit3,
  ArrowRight,
  Heart,
  Share2,
  Upload,
  Trash2,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { authService, apiRequest, uploadService } from "@/services/apiClient";

const EMPLOYEE_RANGES = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1,000",
  "1,001+",
];

const normalizeRange = (val) => {
  if (!val) return "";
  const cleaned = String(val)
    .replace(/ employees?/i, "")
    .replace(/-/g, "–")
    .trim();
  const match = EMPLOYEE_RANGES.find(
    (r) => r === cleaned || r.replace(/,/g, "") === cleaned.replace(/,/g, "")
  );
  return match || "";
};

const initialCompanyData = {
  name: "",
  tagline: "",
  logo: "",
  verified: false,
  establishedYear: "",
  industry: "",
  companySize: "",
  location: "",
  website: "",
  email: "",
  phone: "",
  about: "",
  stats: [
    { label: "Active Postings", value: "0 Roles" },
    { label: "Interns Hired", value: "0 Candidates" },
    { label: "PPO Conversion", value: "0% Rate" },
    { label: "Rating", value: "5.0 / 5.0" },
  ],
  techStack: [],
  perks: [],
  activeJobs: [],
  awards: [],
};

export default function CompanyProfilePage() {
  const [company, setCompany] = useState(initialCompanyData);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: company.name,
    tagline: company.tagline,
    logo: company.logo,
    establishedYear: company.establishedYear,
    companySize: company.companySize,
    location: company.location,
    website: company.website,
    email: company.email,
    phone: company.phone,
    about: company.about,
  });

  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [logoSuccess, setLogoSuccess] = useState("");
  const fileInputRef = useRef(null);

  const [employeeCountType, setEmployeeCountType] = useState("range");
  const [selectedRange, setSelectedRange] = useState("");
  const [exactCount, setExactCount] = useState("");
  const [companySizeError, setCompanySizeError] = useState("");
  const [yearError, setYearError] = useState("");

  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser(null).then((user) => {
      if (isMounted && user) {
        const logo = user.companyProfile?.logo || user.profileIcon || "";
        const name = user.companyProfile?.companyName || user.name || "";
        const tagline = user.companyProfile?.tagline || user.headline || "";
        const email = user.email || "";
        const location = user.location || "";
        const website = user.companyProfile?.website || user.website || "";
        const about = user.companyProfile?.aboutCompany || user.bio || "";
        const phone = user.phone || "";
        const establishedYear =
          user.companyProfile?.establishedYear !== undefined &&
          user.companyProfile.establishedYear !== null
            ? String(user.companyProfile.establishedYear)
            : "";
        const companySize = user.companyProfile?.companySize || "";
        const verified =
          user.companyProfile?.isVerified !== undefined
            ? user.companyProfile.isVerified
            : false;

        const matchedRange = normalizeRange(companySize);
        if (matchedRange) {
          setEmployeeCountType("range");
          setSelectedRange(matchedRange);
          setExactCount("");
        } else if (companySize && /^\d+$/.test(companySize.replace(/ employees?/i, "").trim())) {
          setEmployeeCountType("exact");
          setSelectedRange("");
          setExactCount(companySize.replace(/ employees?/i, "").trim());
        }

        setCompany((prev) => ({
          ...prev,
          name: name || prev.name,
          tagline: tagline || prev.tagline,
          logo: logo !== undefined ? logo : prev.logo,
          verified: verified ?? prev.verified,
          email: email || prev.email,
          location: location || prev.location,
          website: website || prev.website,
          about: about || prev.about,
          phone: phone || prev.phone,
          establishedYear: establishedYear,
          companySize: companySize,
        }));
        setFormData((prev) => ({
          ...prev,
          name: name || prev.name,
          tagline: tagline || prev.tagline,
          logo: logo !== undefined ? logo : prev.logo,
          email: email || prev.email,
          location: location || prev.location,
          website: website || prev.website,
          about: about || prev.about,
          phone: phone || prev.phone,
          establishedYear: establishedYear,
          companySize: companySize,
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const resetEmployeeCountInputs = (targetSize) => {
    const sizeStr = targetSize || "";
    const matched = normalizeRange(sizeStr);
    if (matched) {
      setEmployeeCountType("range");
      setSelectedRange(matched);
      setExactCount("");
    } else if (sizeStr && /^\d+$/.test(sizeStr.replace(/ employees?/i, "").trim())) {
      setEmployeeCountType("exact");
      setSelectedRange("");
      setExactCount(sizeStr.replace(/ employees?/i, "").trim());
    } else {
      setEmployeeCountType("range");
      setSelectedRange("");
      setExactCount("");
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleCancelEdit();
    } else {
      resetEmployeeCountInputs(company.companySize);
      setFormData({
        name: company.name,
        tagline: company.tagline,
        logo: company.logo,
        location: company.location,
        website: company.website,
        email: company.email,
        phone: company.phone,
        about: company.about,
        establishedYear: company.establishedYear || "",
        companySize: company.companySize || "",
      });
      setLogoError("");
      setLogoSuccess("");
      setYearError("");
      setCompanySizeError("");
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    resetEmployeeCountInputs(company.companySize);
    setFormData({
      name: company.name,
      tagline: company.tagline,
      logo: company.logo,
      location: company.location,
      website: company.website,
      email: company.email,
      phone: company.phone,
      about: company.about,
      establishedYear: company.establishedYear || "",
      companySize: company.companySize || "",
    });
    setLogoError("");
    setLogoSuccess("");
    setYearError("");
    setCompanySizeError("");
    setIsEditing(false);
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setLogoError("Invalid file format. Only JPEG, PNG, WebP, and SVG images are allowed.");
      setLogoSuccess("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoError("File size exceeds 5MB limit.");
      setLogoSuccess("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setLogoError("");
    setLogoUploading(true);
    try {
      const res = await uploadService.uploadCompanyLogo(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, logo: url }));
        setLogoSuccess("Logo uploaded successfully");
        setTimeout(() => setLogoSuccess(""), 3000);
      } else {
        throw new Error("Upload did not return a valid URL");
      }
    } catch (err) {
      setLogoError(err?.message || "Failed to upload company logo");
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: "" }));
    setLogoError("");
    setLogoSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validate Establishment Year (optional; if entered, must be valid 4-digit year)
    if (formData.establishedYear) {
      const yr = Number(formData.establishedYear);
      const currentYear = new Date().getFullYear();
      if (!Number.isInteger(yr) || yr < 1800 || yr > currentYear) {
        setYearError(`Please enter a valid 4-digit year between 1800 and ${currentYear}.`);
        return;
      }
    }

    // Validate Exact employee count (optional; if entered, must be whole number > 0)
    if (employeeCountType === "exact" && exactCount) {
      const num = Number(exactCount);
      if (!Number.isInteger(num) || num <= 0) {
        setCompanySizeError("Exact employee count must be a whole number greater than zero.");
        return;
      }
    }

    // Determine final companySize value
    let finalCompanySize = "";
    if (employeeCountType === "range") {
      finalCompanySize = selectedRange;
    } else if (employeeCountType === "exact" && exactCount) {
      finalCompanySize = String(Number(exactCount));
    }

    const payload = {
      ...formData,
      establishedYear: formData.establishedYear ? Number(formData.establishedYear) : null,
      companySize: finalCompanySize,
    };

    setCompany((prev) => ({
      ...prev,
      ...payload,
    }));
    setIsEditing(false);
    setEditSuccess(true);
    try {
      await apiRequest("/auth/me", "PUT", payload);
    } catch {}
    setTimeout(() => setEditSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex">
      <DashboardSidebar />

      <div className="flex-1 md:ml-[220px] ml-0 flex flex-col min-h-screen relative">
        <DashboardHeader
          title="Company Profile"
          subtitle="Manage your public organization persona, culture showcase, and internship offerings"
        />

        <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Banner Header Card */}
          <div className="relative rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            {/* Gradient Top Banner */}
            <div className="min-h-[12rem] sm:min-h-[13.5rem] bg-gradient-to-br from-[#4B9C93] via-[#3d867e] to-[#255e57] relative p-6 flex flex-col justify-between overflow-hidden">
              {/* Subtle decorative shapes */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-teal-200/5 blur-3xl" />
                <svg
                  className="absolute inset-0 w-full h-full opacity-[0.06]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="banner-dots" width="28" height="28" patternUnits="userSpaceOnUse">
                      <circle cx="2" cy="2" r="1.5" fill="#FFFFFF" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#banner-dots)" />
                </svg>
              </div>

              {/* Banner Top Row */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Verified Enterprise Partner</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleEdit}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-gray-800 text-xs sm:text-sm font-semibold shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-[#4B9C93]" />
                    <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
                  </button>
                </div>
              </div>

              {/* Company Name & Tagline inside Green Banner */}
              <div className="relative z-10 pt-4 pb-14 sm:pb-2 sm:pl-[148px] text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                    {company.name}
                  </h1>
                  {company.verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                      Verified
                    </span>
                  )}
                </div>
                {company.tagline && (
                  <p className="text-xs sm:text-sm text-teal-50/90 max-w-2xl font-medium leading-relaxed">
                    {company.tagline}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Bar */}
            <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-14">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left flex-1 min-w-0">
                {/* Logo Box */}
                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-white p-2 shadow-lg border flex items-center justify-center shrink-0 relative transition-all ${
                    isEditing
                      ? "border-[#4B9C93] ring-2 ring-[#4B9C93]/30 cursor-pointer group"
                      : "border-gray-100"
                  }`}
                  {...(isEditing
                    ? {
                        role: "button",
                        tabIndex: 0,
                        "aria-label": (isEditing ? formData.logo : company.logo)
                          ? "Change company logo"
                          : "Upload company logo",
                        onClick: () => !logoUploading && fileInputRef.current?.click(),
                        onKeyDown: (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (!logoUploading) fileInputRef.current?.click();
                          }
                        },
                      }
                    : {})}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleLogoFileChange}
                    className="hidden"
                    disabled={!isEditing || logoUploading}
                    aria-hidden="true"
                  />

                  {/* Remove logo button while editing */}
                  {isEditing && formData.logo && !logoUploading && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLogo();
                      }}
                      className="absolute -top-1.5 -right-1.5 p-1.5 rounded-full bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 shadow-sm z-10 cursor-pointer transition-all"
                      title="Remove logo"
                      aria-label="Remove logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {(isEditing ? formData.logo : company.logo) ? (
                    <div className="w-full h-full rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center bg-white relative">
                      <img
                        src={isEditing ? formData.logo : company.logo}
                        alt={`${(isEditing ? formData.name : company.name) || "Company"} logo`}
                        className="w-full h-full object-contain p-1"
                      />
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
                          <Upload className="w-5 h-5 mb-1" />
                          <span className="text-[10px] font-bold">Change Logo</span>
                        </div>
                      )}
                      {isEditing && logoUploading && (
                        <div className="absolute inset-0 bg-white/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-[#4B9C93] p-1 text-center">
                          <div className="w-5 h-5 border-2 border-[#4B9C93]/30 border-t-[#4B9C93] rounded-full animate-spin mb-1" />
                          <span className="text-[10px] font-bold">Uploading...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-[#E6F7F3] to-teal-50 border border-[#4B9C93]/20 flex flex-col items-center justify-center text-[#4B9C93] relative overflow-hidden">
                      {isEditing ? (
                        <>
                          {logoUploading ? (
                            <div className="flex flex-col items-center justify-center text-[#4B9C93]">
                              <div className="w-5 h-5 border-2 border-[#4B9C93]/30 border-t-[#4B9C93] rounded-full animate-spin mb-1" />
                              <span className="text-[10px] font-bold">Uploading...</span>
                            </div>
                          ) : (
                            <>
                              <div className="w-8 h-8 rounded-full bg-[#4B9C93]/15 flex items-center justify-center mb-1 group-hover:bg-[#4B9C93] group-hover:text-white transition-colors">
                                <Upload className="w-4 h-4" />
                              </div>
                              <span className="text-[10px] font-bold tracking-wider uppercase text-[#4B9C93]">
                                Upload Logo
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Building2 className="w-12 h-12" />
                          <span className="text-[10px] font-bold tracking-wider mt-1 uppercase text-[#4B9C93]/90">
                            Partner
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Company detail items in the white section */}
                <div className="pt-2 sm:pt-0 pb-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-2 text-xs font-medium text-gray-500">
                    {company.location ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#4B9C93]" />
                        <span>{company.location}</span>
                      </span>
                    ) : null}
                    {company.companySize ? (
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#4B9C93]" />
                        <span>
                          {company.companySize.toLowerCase().includes("employee")
                            ? company.companySize
                            : /^\d+$/.test(company.companySize.trim())
                            ? `${company.companySize.trim()} employees`
                            : `${company.companySize} employees`}
                        </span>
                      </span>
                    ) : null}
                    {company.establishedYear ? (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#4B9C93]" />
                        <span>Est. {company.establishedYear}</span>
                      </span>
                    ) : null}
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-[#4B9C93] hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{company.website.replace("https://", "")}</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {!isEditing && (
                <div className="flex items-center justify-center gap-3 shrink-0">
                  <Link
                    href="/company/applications"
                    className="px-5 py-2.5 rounded-2xl bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                  >
                    View All Candidates
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            {!isEditing && (
              <div className="border-t border-gray-100 bg-gray-50/70 grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 py-3.5 px-6">
                {company.stats.map((st, i) => (
                  <div key={i} className="text-center py-1">
                    <p className="text-base sm:text-lg font-extrabold text-gray-900">{st.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{st.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {editSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Company profile details updated successfully!
            </div>
          )}

          {/* Edit Form Modal/Drawer if editing */}
          {isEditing && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#4B9C93]/30 shadow-md">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#4B9C93]" />
                Update Organization Profile
              </h3>

              {logoError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span>{logoError}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Company Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Tagline / Mission</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Establishment Year <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                    placeholder="e.g. 2018"
                    value={formData.establishedYear || ""}
                    onChange={(e) => {
                      setYearError("");
                      setFormData({ ...formData, establishedYear: e.target.value });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4B9C93]"
                  />
                  {yearError && (
                    <p className="text-xs text-rose-600 font-medium mt-1">{yearError}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Recruitment Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">
                    Employee Count <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-gray-700">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="employeeCountType"
                        value="range"
                        checked={employeeCountType === "range"}
                        onChange={() => {
                          setEmployeeCountType("range");
                          setExactCount("");
                          setCompanySizeError("");
                          setFormData((prev) => ({ ...prev, companySize: selectedRange }));
                        }}
                        className="w-4 h-4 text-[#4B9C93] focus:ring-[#4B9C93] accent-[#4B9C93]"
                      />
                      <span>Choose a range</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="employeeCountType"
                        value="exact"
                        checked={employeeCountType === "exact"}
                        onChange={() => {
                          setEmployeeCountType("exact");
                          setSelectedRange("");
                          setCompanySizeError("");
                          setFormData((prev) => ({ ...prev, companySize: exactCount }));
                        }}
                        className="w-4 h-4 text-[#4B9C93] focus:ring-[#4B9C93] accent-[#4B9C93]"
                      />
                      <span>Enter exact count</span>
                    </label>

                    {(selectedRange || exactCount) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRange("");
                          setExactCount("");
                          setCompanySizeError("");
                          setFormData((prev) => ({ ...prev, companySize: "" }));
                        }}
                        className="text-[11px] text-gray-500 hover:text-gray-800 underline cursor-pointer ml-auto"
                      >
                        Clear employee count
                      </button>
                    )}
                  </div>

                  {employeeCountType === "range" ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                      {EMPLOYEE_RANGES.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => {
                            const nextVal = selectedRange === range ? "" : range;
                            setSelectedRange(nextVal);
                            setCompanySizeError("");
                            setFormData((prev) => ({ ...prev, companySize: nextVal }));
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                            selectedRange === range
                              ? "bg-[#E6F7F3] border-[#4B9C93] text-[#0D9488] shadow-xs"
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="pt-1">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g. 42"
                        value={exactCount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setExactCount(val);
                          if (val === "") {
                            setCompanySizeError("");
                            setFormData((prev) => ({ ...prev, companySize: "" }));
                          } else {
                            const num = Number(val);
                            if (!Number.isInteger(num) || num <= 0) {
                              setCompanySizeError("Exact employee count must be a whole number greater than zero.");
                            } else {
                              setCompanySizeError("");
                              setFormData((prev) => ({ ...prev, companySize: String(num) }));
                            }
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4B9C93]"
                      />
                      {companySizeError && (
                        <p className="text-xs text-rose-600 font-medium mt-1">{companySizeError}</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">About Company</label>
                  <textarea
                    rows={4}
                    value={formData.about}
                    onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-bold shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
            {[
              { id: "overview", label: "Overview & Culture" },
              { id: "postings", label: `Active Openings (${company.activeJobs.length})` },
              { id: "perks", label: "Perks & Mentorship" },
              { id: "awards", label: "Certifications & Awards" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#4B9C93] text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">About Our Company</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {company.about}
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Primary Technology Stack</h3>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {company.techStack.length === 0 ? (
                      <p className="text-xs text-gray-400">No technology stack specified yet.</p>
                    ) : (
                      company.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1.5 rounded-xl bg-[#E6F7F3] text-[#0D9488] font-bold text-xs border border-[#0D9488]/20"
                        >
                          {tech}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
                    Contact & Hiring Team
                  </h3>
                  <div className="space-y-3 text-xs sm:text-sm text-gray-700">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-[#4B9C93]" />
                      <a href={`mailto:${company.email || ""}`} className="hover:underline">
                        {company.email || "Contact via portal"}
                      </a>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="w-4 h-4 text-[#4B9C93]" />
                      <span>{company.phone || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-[#4B9C93]" />
                      <a href={company.website || "#"} target="_blank" rel="noreferrer" className="hover:underline">
                        {company.website || "No website provided"}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#E6F7F3] to-teal-50 rounded-3xl p-6 border border-[#4B9C93]/20 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-[#4B9C93] text-white flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">Need Help Hiring?</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Our campus relations team can connect your job postings directly with top engineering colleges across India.
                  </p>
                  <Link
                    href="/help"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#4B9C93] hover:underline"
                  >
                    Contact Partner Support <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Postings */}
          {activeTab === "postings" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Current Open Internships</h3>
                <Link
                  href="/company/dashboard"
                  className="px-4 py-2 rounded-xl bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-bold transition-all"
                >
                  Post Another Role
                </Link>
              </div>

              {company.activeJobs.length === 0 ? (
                <div className="py-12 bg-white rounded-3xl border border-gray-100 text-center text-xs text-gray-400">
                  No active job openings posted yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {company.activeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:border-[#4B9C93]/40 transition-all"
                    >
                      <div className="space-y-2">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F7F3] text-[#0D9488]">
                          {job.type}
                        </span>
                        <h4 className="font-extrabold text-base text-gray-900">{job.title}</h4>
                        <p className="text-xs text-gray-500">{job.location} · {job.duration}</p>
                        <p className="text-xs font-bold text-[#4B9C93] pt-1">{job.stipend}</p>
                      </div>

                      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          <strong className="text-gray-900">{job.applicants}</strong> applicants
                        </span>
                        <Link
                          href={`/company/applications?role=${encodeURIComponent(job.title)}`}
                          className="text-xs font-bold text-[#4B9C93] hover:underline flex items-center gap-1"
                        >
                          Manage <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Perks */}
          {activeTab === "perks" && (
            <div>
              {company.perks.length === 0 ? (
                <div className="py-12 bg-white rounded-3xl border border-gray-100 text-center text-xs text-gray-400">
                  No company perks or benefits listed yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {company.perks.map((perk, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2.5"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{perk.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{perk.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Awards */}
          {activeTab === "awards" && (
            <div>
              {company.awards.length === 0 ? (
                <div className="py-12 bg-white rounded-3xl border border-gray-100 text-center text-xs text-gray-400">
                  No institutional awards or certifications added yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {company.awards.map((award, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-2.5"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">{award.name}</h4>
                      <p className="text-xs text-gray-500">Issued by {award.issuer} ({award.year})</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
