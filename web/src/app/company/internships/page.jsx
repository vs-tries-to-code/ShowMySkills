"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Edit3,
  Trash2,
  PlusCircle,
  MapPin,
  Banknote,
  Calendar,
  Users,
  Layers,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
  Building2,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Wallet,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { internshipService, authService, uploadService } from "@/services/apiClient";

const PREDEFINED_DEPARTMENTS = [
  "Engineering",
  "Design",
  "AI & Data",
  "Product",
  "Marketing",
];

const PREDEFINED_TRACKS = [
  "Development",
  "UI/UX & Product Design",
  "AI, Machine Learning & Data",
  "Product Management",
  "Growth & Technical Marketing",
];

const DEPARTMENT_TRACK_MAP = {
  Engineering: "Development",
  Design: "UI/UX & Product Design",
  "AI & Data": "AI, Machine Learning & Data",
  Product: "Product Management",
  Marketing: "Growth & Technical Marketing",
};

const PRESET_DURATIONS = ["1 Month", "2 Months", "3 Months", "6 Months"];

const parseDuration = (rawDuration) => {
  if (!rawDuration) return { choice: "", customVal: "", customUnit: "Months" };
  const trimmed = rawDuration.trim();
  if (PRESET_DURATIONS.includes(trimmed)) {
    return { choice: trimmed, customVal: "", customUnit: "Months" };
  }
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s+(weeks?|months?)$/i);
  if (match) {
    const unit = match[2].toLowerCase().startsWith("week") ? "Weeks" : "Months";
    return { choice: "custom", customVal: match[1], customUnit: unit };
  }
  return { choice: "custom", customVal: "", customUnit: "Months" };
};

export default function CompanyInternshipsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Confirmation Modal State (Close, Reopen, Delete)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // "close" | "reopen" | "delete"
    internship: null,
    processing: false,
    deleteConfirmed: false,
  });

  // Edit Posting Modal State
  const [editModal, setEditModal] = useState({
    isOpen: false,
    internship: null,
    role: "",
    department: "Engineering",
    track: "Development",
    customDepartment: "",
    customTrack: "",
    isCustomDepartment: false,
    isCustomTrack: false,
    mode: "remote",
    location: "",
    durationChoice: "",
    customDurationValue: "",
    customDurationUnit: "Months",
    skills: "",
    compensationType: "paid",
    stipendMode: "range",
    stipendMin: "",
    stipendMax: "",
    description: "",
    posterImage: "",
    posterUploading: false,
    saving: false,
    errors: {},
  });

  // Create Posting Modal State
  const [createModal, setCreateModal] = useState({
    isOpen: false,
    role: "",
    department: "Engineering",
    track: "Development",
    customDepartment: "",
    customTrack: "",
    isCustomDepartment: false,
    isCustomTrack: false,
    mode: "remote",
    location: "",
    durationChoice: "",
    customDurationValue: "",
    customDurationUnit: "Months",
    skills: "",
    compensationType: "paid",
    stipendMode: "range",
    stipendMin: "",
    stipendMax: "",
    description: "",
    posterImage: "",
    posterUploading: false,
    saving: false,
    errors: {},
  });

  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Fetch company postings
  const fetchCompanyPostings = async (user) => {
    try {
      setLoading(true);
      setError(null);
      const userId = user?.id || user?._id;
      const res = await internshipService.list({
        postedBy: userId,
        status: "all",
        limit: 50,
      });

      if (Array.isArray(res)) {
        setInternships(res);
      } else {
        setInternships([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to load your internship postings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    authService
      .getCurrentUser()
      .then((user) => {
        if (!isMounted) return;
        setCurrentUser(user);
        if (user && user.role === "company") {
          fetchCompanyPostings(user);
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err?.message || "Authentication required");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered internships based on search query and status tab
  const filteredInternships = internships.filter((item) => {
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesStatus;

    const matchesSearch =
      (item.role || "").toLowerCase().includes(q) ||
      (item.department || "").toLowerCase().includes(q) ||
      (item.track || "").toLowerCase().includes(q) ||
      (Array.isArray(item.skills) &&
        item.skills.some((s) => (s || "").toLowerCase().includes(q)));

    return matchesStatus && matchesSearch;
  });

  // Action: Open Confirmation Modal
  const handleOpenConfirm = (internship, type) => {
    // Prevent opening delete confirmation for an Open/Active posting
    if (type === "delete" && internship?.status === "active") {
      alert("Cannot delete an active internship posting. Please close the posting first.");
      return;
    }

    setConfirmModal({
      isOpen: true,
      type,
      internship,
      processing: false,
      deleteConfirmed: false,
    });
  };

  // Action: Close or Reopen Posting
  const handleExecuteStatusChange = async () => {
    const { internship, type } = confirmModal;
    if (!internship) return;

    setConfirmModal((prev) => ({ ...prev, processing: true }));
    const id = internship._id || internship.id;
    const newStatus = type === "close" ? "closed" : "active";

    try {
      await internshipService.update(id, { status: newStatus });

      setInternships((prev) =>
        prev.map((i) =>
          (i._id || i.id) === id ? { ...i, status: newStatus } : i
        )
      );

      showToast(
        type === "close"
          ? "Internship closed. Students can no longer apply."
          : "Internship reopened and active for student applications."
      );
      setConfirmModal({
        isOpen: false,
        type: null,
        internship: null,
        processing: false,
        deleteConfirmed: false,
      });
    } catch (err) {
      alert(err?.message || "Failed to update posting status");
      setConfirmModal((prev) => ({ ...prev, processing: false }));
    }
  };

  // Action: Delete Posting
  const handleExecuteDelete = async () => {
    const { internship, deleteConfirmed } = confirmModal;
    if (!internship) return;

    if (internship.status === "active") {
      alert("Cannot delete an active internship posting. Please close the posting first.");
      return;
    }

    if (!deleteConfirmed) {
      alert("Please confirm that you understand candidate application details will be deleted.");
      return;
    }

    setConfirmModal((prev) => ({ ...prev, processing: true }));
    const id = internship._id || internship.id;

    try {
      await internshipService.delete(id);
      setInternships((prev) => prev.filter((i) => (i._id || i.id) !== id));
      showToast("Internship posting permanently deleted.");
      setConfirmModal({
        isOpen: false,
        type: null,
        internship: null,
        processing: false,
        deleteConfirmed: false,
      });
    } catch (err) {
      alert(err?.message || "Failed to delete internship posting");
      setConfirmModal((prev) => ({ ...prev, processing: false }));
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (internship) => {
    const isPredefinedDept = PREDEFINED_DEPARTMENTS.includes(internship.department || "");
    const isPredefinedTrk = PREDEFINED_TRACKS.includes(internship.track || "");
    const parsedDur = parseDuration(internship.duration);

    const compType =
      internship.compensationType ||
      (internship.stipendText === "Unpaid" || internship.stipend === "Unpaid"
        ? "unpaid"
        : internship.stipendMin > 0
        ? "paid"
        : "paid");

    setEditModal({
      isOpen: true,
      internship,
      role: internship.role || "",
      department: isPredefinedDept ? internship.department : "custom",
      track: isPredefinedTrk ? internship.track : "custom",
      customDepartment: isPredefinedDept ? "" : internship.department || "",
      customTrack: isPredefinedTrk ? "" : internship.track || "",
      isCustomDepartment: !isPredefinedDept && Boolean(internship.department),
      isCustomTrack: !isPredefinedTrk && Boolean(internship.track),
      mode: internship.mode || "remote",
      location: internship.mode === "remote" ? "" : internship.location || "",
      durationChoice: parsedDur.choice,
      customDurationValue: parsedDur.customVal,
      customDurationUnit: parsedDur.customUnit,
      skills: Array.isArray(internship.skills) ? internship.skills.join(", ") : "",
      compensationType: compType,
      stipendMode: internship.stipendMode || "range",
      stipendMin: internship.stipendMin != null && internship.stipendMin > 0 ? String(internship.stipendMin) : "",
      stipendMax: internship.stipendMax != null && internship.stipendMax > 0 ? String(internship.stipendMax) : "",
      description: internship.description || "",
      posterImage: internship.posterImage || "",
      posterUploading: false,
      saving: false,
      errors: {},
    });
  };

  // Validate Posting Form State
  const validateForm = (formState) => {
    const errors = {};

    if (!formState.role.trim()) {
      errors.role = "Role title is required";
    }

    const finalDepartment = formState.isCustomDepartment
      ? formState.customDepartment.trim()
      : formState.department;
    if (!finalDepartment) {
      errors.department = "Department cannot be empty";
    }

    const finalTrack = formState.isCustomTrack
      ? formState.customTrack.trim()
      : formState.track;
    if (!finalTrack) {
      errors.track = "Track cannot be empty";
    }

    // Location validation: required for onsite/hybrid, disabled/cleared for remote
    if (formState.mode === "onsite" || formState.mode === "hybrid") {
      if (!formState.location.trim()) {
        errors.location = "Location is required for Onsite and Hybrid work modes";
      }
    }

    // Duration validation: required, reject blank, 0, or negative
    if (!formState.durationChoice) {
      errors.duration = "Duration is required";
    } else if (formState.durationChoice === "custom") {
      const val = Number(formState.customDurationValue);
      if (!formState.customDurationValue.toString().trim() || !Number.isFinite(val) || val <= 0) {
        errors.duration = "Please enter a positive duration value (e.g. 10 Weeks or 4 Months)";
      }
    }

    // Required skills validation: mandatory, at least one skill
    const skillsArray = formState.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skillsArray.length === 0) {
      errors.skills = "At least one required skill must be provided";
    }

    // Compensation validation
    if (formState.compensationType === "paid") {
      const min = formState.stipendMin !== "" ? Number(formState.stipendMin) : NaN;
      const max = formState.stipendMax !== "" ? Number(formState.stipendMax) : NaN;
      if (!Number.isFinite(min) || (formState.stipendMode === "range" && !Number.isFinite(max))) {
        errors.stipend = formState.stipendMode === "fixed" ? "A valid monthly stipend amount is required" : "Both minimum and maximum monthly stipend amounts are required for Paid internships";
      } else if (min < 0 || (formState.stipendMode === "range" && max < 0)) {
        errors.stipend = "Stipend amounts cannot be negative";
      } else if (formState.stipendMode === "range" && min > max) {
        errors.stipend = "Minimum stipend cannot exceed maximum stipend";
      }
    } else if (formState.compensationType === "flexible") {
      const hasMin = formState.stipendMin !== "" && formState.stipendMin !== null;
      const hasMax = formState.stipendMax !== "" && formState.stipendMax !== null;
      if (hasMin || hasMax) {
        const min = Number(formState.stipendMin);
        const max = Number(formState.stipendMax);
        if (Number.isNaN(min) || Number.isNaN(max)) {
          errors.stipend = "Both minimum and maximum stipend amounts must be specified if entered";
        } else if (min < 0 || max < 0) {
          errors.stipend = "Stipend amounts cannot be negative";
        } else if (max <= min) {
          errors.stipend = "Maximum stipend must be greater than minimum stipend";
        }
      }
    }

    return { errors, isValid: Object.keys(errors).length === 0 };
  };

  // Build Payload
  const buildPayload = (formState, companyName) => {
    const finalDepartment = formState.isCustomDepartment
      ? formState.customDepartment.trim()
      : formState.department;
    const finalTrack = formState.isCustomTrack
      ? formState.customTrack.trim()
      : formState.track;

    const resolvedDuration =
      formState.durationChoice === "custom"
        ? `${Number(formState.customDurationValue)} ${formState.customDurationUnit}`
        : formState.durationChoice;

    const skillsArray = formState.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      role: formState.role.trim(),
      company: companyName,
      department: finalDepartment,
      track: finalTrack,
      mode: formState.mode,
      location: formState.mode === "remote" ? "" : formState.location.trim(),
      duration: resolvedDuration,
      skills: skillsArray,
      description: formState.description.trim(),
      compensationType: formState.compensationType,
      stipendMode: formState.stipendMode,
      posterImage: formState.posterImage || "",
    };

    if (formState.compensationType === "paid") {
      const min = Number(formState.stipendMin);
      const max = Number(formState.stipendMax);
      payload.stipendMin = min;
      if (formState.stipendMode === "range") payload.stipendMax = max;
      payload.stipendText = formState.stipendMode === "fixed" ? `₹${min.toLocaleString("en-IN")} / month` : `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")} / month`;
      payload.stipend = payload.stipendText;
    } else if (formState.compensationType === "unpaid") {
      payload.stipendMin = 0;
      payload.stipendMax = 0;
      payload.stipendText = "Unpaid";
      payload.stipend = "Unpaid";
    } else if (formState.compensationType === "flexible") {
      if (formState.stipendMin !== "" && formState.stipendMax !== "") {
        const min = Number(formState.stipendMin);
        const max = Number(formState.stipendMax);
        payload.stipendMin = min;
        payload.stipendMax = max;
        payload.stipendText = `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")} / month (Flexible)`;
        payload.stipend = payload.stipendText;
      } else {
        payload.stipendMin = 0;
        payload.stipendMax = 0;
        payload.stipendText = "Flexible";
        payload.stipend = "Flexible";
      }
    }

    return payload;
  };

  // Image Upload Handler
  const handleUploadFile = async (e, setModalState) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(file.type)) {
      alert("Invalid format. Please upload JPEG, PNG, or WebP.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File exceeds maximum size of 5MB.");
      return;
    }

    setModalState((prev) => ({
      ...prev,
      posterUploading: true,
      errors: { ...prev.errors, poster: "" },
    }));

    try {
      const res = await uploadService.uploadInternshipPoster(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setModalState((prev) => ({
          ...prev,
          posterImage: url,
          posterUploading: false,
        }));
      } else {
        throw new Error("Upload did not return a valid URL");
      }
    } catch (err) {
      setModalState((prev) => ({
        ...prev,
        posterUploading: false,
        errors: { ...prev.errors, poster: err?.message || "Failed to upload image" },
      }));
    }
  };

  // Save Edit
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const { errors, isValid } = validateForm(editModal);

    if (!isValid) {
      setEditModal((prev) => ({ ...prev, errors }));
      return;
    }

    setEditModal((prev) => ({ ...prev, saving: true }));
    const id = editModal.internship._id || editModal.internship.id;
    const companyName = editModal.internship.company || currentUser?.companyProfile?.companyName || "My Company";
    const payload = buildPayload(editModal, companyName);

    try {
      const updated = await internshipService.update(id, payload);
      setInternships((prev) =>
        prev.map((item) =>
          (item._id || item.id) === id ? { ...item, ...payload, ...updated } : item
        )
      );
      showToast("Internship posting updated successfully.");
      setEditModal((prev) => ({ ...prev, isOpen: false, saving: false }));
    } catch (err) {
      setEditModal((prev) => ({
        ...prev,
        saving: false,
        errors: { submit: err?.message || "Failed to update internship" },
      }));
    }
  };

  // Save Create
  const handleSaveCreate = async (e) => {
    e.preventDefault();
    const { errors, isValid } = validateForm(createModal);

    if (!isValid) {
      setCreateModal((prev) => ({ ...prev, errors }));
      return;
    }

    setCreateModal((prev) => ({ ...prev, saving: true }));
    const companyName = currentUser?.companyProfile?.companyName || currentUser?.name || "My Company";
    const payload = {
      ...buildPayload(createModal, companyName),
      status: "active",
    };

    try {
      const res = await internshipService.create(payload);
      const createdItem = res?.data || res || payload;
      setInternships((prev) => [createdItem, ...prev]);
      showToast("Internship posting published successfully!");

      setCreateModal({
        isOpen: false,
        role: "",
        department: "Engineering",
        track: "Development",
        customDepartment: "",
        customTrack: "",
        isCustomDepartment: false,
        isCustomTrack: false,
        mode: "remote",
        location: "",
        durationChoice: "",
        customDurationValue: "",
        customDurationUnit: "Months",
        skills: "",
        compensationType: "paid",
        stipendMode: "range",
        stipendMin: "",
        stipendMax: "",
        description: "",
        posterImage: "",
        posterUploading: false,
        saving: false,
        errors: {},
      });
    } catch (err) {
      setCreateModal((prev) => ({
        ...prev,
        saving: false,
        errors: { submit: err?.message || "Failed to publish internship opening" },
      }));
    }
  };

  // Format Display Stipend for company management list
  const formatCardStipend = (item) => {
    if (item.compensationType === "unpaid" || item.stipend === "Unpaid" || item.stipendText === "Unpaid") {
      return "Unpaid";
    }
    const min = item.stipendMin;
    const max = item.stipendMax;
    if (min != null && max != null && (min > 0 || max > 0)) {
      return `₹${Number(min).toLocaleString("en-IN")} - ₹${Number(max).toLocaleString("en-IN")}/mo`;
    }
    if (item.stipendText) return item.stipendText;
    if (item.stipend) return item.stipend;
    if (item.compensationType === "flexible") return "Flexible";
    return "Unpaid";
  };

  const activeCount = internships.filter((i) => i.status === "active").length;
  const closedCount = internships.filter((i) => i.status !== "active").length;
  const totalApplicants = internships.reduce((sum, item) => sum + (item.applicantsCount || 0), 0);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <DashboardSidebar />

      <div className="flex-1 md:ml-[220px] ml-0 flex flex-col min-w-0 overflow-y-auto">
        <DashboardHeader />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[#2b8a78] text-[11px] font-semibold mb-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company Hiring Center</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-[#4B9C93]" />
                Manage Internship Postings
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Oversee your active listings, edit requirements, manage open/closed status, and monitor candidate inflow.
              </p>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-xs transition-all animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{toastMessage}</span>
              </div>
              <button
                onClick={() => setToastMessage("")}
                className="text-emerald-700 hover:text-emerald-900 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Postings
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {internships.length}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Active & Open
              </p>
              <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
                {activeCount}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Closed / Archived
              </p>
              <p className="text-xl font-extrabold text-slate-500 mt-0.5">
                {closedCount}
              </p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Applicants
              </p>
              <p className="text-xl font-extrabold text-[#4B9C93] mt-0.5">
                {totalApplicants}
              </p>
            </div>
          </div>

          {/* Role Check Alert if not company */}
          {currentUser && currentUser.role !== "company" && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Company Authorization Required</p>
                <p className="text-amber-800 mt-0.5">
                  You are currently logged in with the <strong>{currentUser.role}</strong> role. Only verified company accounts can create and modify recruiter postings.
                </p>
              </div>
            </div>
          )}

          {/* Main Posting Action */}
          <div className="flex items-center justify-end">
            <button
              id="company-new-posting-btn"
              type="button"
              onClick={() => setCreateModal((prev) => ({ ...prev, isOpen: true }))}
              className="inline-flex items-center gap-2 bg-[#4B9C93] hover:bg-[#3d867e] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Posting</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by role title, department, track, or required skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-[#4B9C93] text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All ({internships.length})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === "active"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Open / Active ({activeCount})
                </button>
                <button
                  onClick={() => setStatusFilter("closed")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === "closed"
                      ? "bg-slate-700 text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Closed ({closedCount})
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 shadow-xs">
              <div className="w-10 h-10 border-4 border-[#4B9C93]/20 border-t-[#4B9C93] rounded-full animate-spin mx-auto" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Loading your postings</h3>
                <p className="text-xs text-slate-500 mt-1">Retrieving company internship listings...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Failed to load postings</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
              <button
                onClick={() => currentUser && fetchCompanyPostings(currentUser)}
                className="mt-2 px-4 py-2 bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredInternships.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">
                {searchQuery.trim() || statusFilter !== "all"
                  ? "No matching internship postings"
                  : "No internship postings yet"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {searchQuery.trim() || statusFilter !== "all"
                  ? "Try resetting your search query or status filter to see other opportunities."
                  : "Publish an internship role to begin matching with verified student candidates."}
              </p>
              {searchQuery.trim() || statusFilter !== "all" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                  className="inline-block mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : (
                <button
                  onClick={() => setCreateModal((prev) => ({ ...prev, isOpen: true }))}
                  className="inline-block mt-2 px-4 py-2 bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Create First Opening
                </button>
              )}
            </div>
          )}

          {/* Postings List */}
          {!loading && !error && filteredInternships.length > 0 && (
            <div className="space-y-4">
              {filteredInternships.map((internship) => {
                const id = internship._id || internship.id;
                const isOpen = internship.status === "active";
                const datePosted = internship.createdAt
                  ? new Date(internship.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recently";

                return (
                  <div
                    key={id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Poster or Logo Thumbnail */}
                        {internship.posterImage ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                            <img
                              src={internship.posterImage}
                              alt={internship.role}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-xl border border-slate-200 shrink-0 bg-teal-50 text-[#2b8a78] flex items-center justify-center font-bold text-lg select-none">
                            {(internship.company || "C").slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-bold text-base text-slate-900">
                              {internship.role}
                            </h3>
                            {/* Status Badge */}
                            {isOpen ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Open & Accepting Applications
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                <XCircle className="w-3.5 h-3.5" />
                                Closed
                              </span>
                            )}
                          </div>

                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                            <span className="font-semibold text-[#4B9C93]">
                              {internship.department || "General"}
                              {internship.track && ` • ${internship.track}`}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {internship.mode === "remote"
                                ? "Remote"
                                : `${internship.location || "Onsite"} (${internship.mode || "onsite"})`}
                            </span>
                            <span>•</span>
                            <span className="font-medium text-slate-700">
                              {formatCardStipend(internship)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {internship.duration || "N/A"}
                            </span>
                            <span>•</span>
                            <span>Posted {datePosted}</span>
                          </div>
                        </div>
                      </div>

                      {/* Applicants Counter pill */}
                      <div className="self-start sm:self-auto flex items-center gap-2">
                        <Link
                          href={`/company/applications?internshipId=${id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                          title="View received student applications"
                        >
                          <Users className="w-3.5 h-3.5 text-slate-500" />
                          <span>{internship.applicantsCount || 0} Applicants</span>
                        </Link>
                      </div>
                    </div>

                    {/* Skills tags */}
                    {Array.isArray(internship.skills) && internship.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {internship.skills.slice(0, 6).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                        {internship.skills.length > 6 && (
                          <span className="text-[11px] text-slate-400 font-medium pl-1">
                            +{internship.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        {/* View Action */}
                        <Link
                          href={`/internships/${id}`}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 inline-flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Full Posting</span>
                        </Link>

                        {/* Edit Action */}
                        <button
                          onClick={() => handleOpenEdit(internship)}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Edit</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Close / Reopen Action */}
                        {isOpen ? (
                          <button
                            id={`close-posting-btn-${id}`}
                            onClick={() => handleOpenConfirm(internship, "close")}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Close Posting</span>
                          </button>
                        ) : (
                          <>
                            <button
                              id={`reopen-posting-btn-${id}`}
                              onClick={() => handleOpenConfirm(internship, "reopen")}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Reopen Posting</span>
                            </button>

                            {/* Delete Action — only available for closed postings */}
                            <button
                              id={`delete-posting-btn-${id}`}
                              onClick={() => handleOpenConfirm(internship, "delete")}
                              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                              title="Permanently Delete Posting"
                              aria-label="Delete Posting"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-scale-in">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  confirmModal.type === "close"
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : confirmModal.type === "delete"
                    ? "bg-red-50 text-red-600 border border-red-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {confirmModal.type === "close" ? (
                  <XCircle className="w-5 h-5" />
                ) : confirmModal.type === "delete" ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-900">
                  {confirmModal.type === "close"
                    ? "Close Internship Posting?"
                    : confirmModal.type === "delete"
                    ? "Permanently Delete Posting?"
                    : "Reopen Internship Posting?"}
                </h3>
                <p id="confirm-modal-warning" className="text-xs text-slate-500 leading-relaxed">
                  {confirmModal.type === "close"
                    ? `Closing "${confirmModal.internship?.role}" means students will no longer be able to discover or submit applications for this role.`
                    : confirmModal.type === "delete"
                    ? "Deleting this post will permanently remove its details and the details of candidates who applied."
                    : `Reopening "${confirmModal.internship?.role}" will make it visible in student searches and accept new applications.`}
                </p>
              </div>
            </div>

            {/* Checkbox confirmation required specifically for permanent delete */}
            {confirmModal.type === "delete" && (
              <label
                htmlFor="delete-confirm-checkbox"
                className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 cursor-pointer text-xs text-amber-900 select-none hover:bg-amber-100/60 transition-colors"
              >
                <input
                  type="checkbox"
                  id="delete-confirm-checkbox"
                  required
                  checked={confirmModal.deleteConfirmed || false}
                  onChange={(e) =>
                    setConfirmModal((prev) => ({
                      ...prev,
                      deleteConfirmed: e.target.checked,
                    }))
                  }
                  className="mt-0.5 rounded border-amber-300 text-red-600 focus:ring-red-500 cursor-pointer shrink-0"
                />
                <span className="leading-snug">
                  I understand that deleting this post will permanently remove its details and the details of candidates who applied.
                </span>
              </label>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                id="confirm-modal-cancel-btn"
                disabled={confirmModal.processing}
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    type: null,
                    internship: null,
                    processing: false,
                    deleteConfirmed: false,
                  })
                }
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                id={confirmModal.type === "delete" ? "confirm-delete-btn" : "confirm-action-btn"}
                disabled={
                  confirmModal.processing ||
                  (confirmModal.type === "delete" && !confirmModal.deleteConfirmed)
                }
                onClick={
                  confirmModal.type === "delete"
                    ? handleExecuteDelete
                    : handleExecuteStatusChange
                }
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold transition-colors ${
                  confirmModal.type === "delete" && !confirmModal.deleteConfirmed
                    ? "opacity-40 cursor-not-allowed bg-red-600"
                    : "cursor-pointer"
                } ${
                  confirmModal.type === "close"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : confirmModal.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#4B9C93] hover:bg-[#3d867e]"
                }`}
              >
                {confirmModal.processing
                  ? "Saving..."
                  : confirmModal.type === "close"
                  ? "Confirm & Close"
                  : confirmModal.type === "delete"
                  ? "Confirm & Delete"
                  : "Confirm & Reopen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Internship Modal */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#4B9C93]" />
                <h3 className="font-bold text-base text-slate-900">
                  Edit Internship Posting
                </h3>
              </div>
              <button
                onClick={() => setEditModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editModal.errors?.submit && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {editModal.errors.submit}
                </div>
              )}

              {/* Role Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  value={editModal.role}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  placeholder="e.g. Senior Frontend Developer Intern"
                />
                {editModal.errors?.role && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {editModal.errors.role}
                  </p>
                )}
              </div>

              {/* Department & Track */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={editModal.department}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setEditModal((prev) => ({
                          ...prev,
                          department: "custom",
                          isCustomDepartment: true,
                        }));
                      } else {
                        setEditModal((prev) => ({
                          ...prev,
                          department: val,
                          isCustomDepartment: false,
                          customDepartment: "",
                          track: DEPARTMENT_TRACK_MAP[val] || prev.track,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  >
                    {PREDEFINED_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                    <option value="custom">+ Custom Department</option>
                  </select>
                  {editModal.isCustomDepartment && (
                    <input
                      type="text"
                      placeholder="Specify custom department"
                      value={editModal.customDepartment}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          customDepartment: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                    />
                  )}
                  {editModal.errors?.department && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {editModal.errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Track *
                  </label>
                  <select
                    value={editModal.track}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setEditModal((prev) => ({
                          ...prev,
                          track: "custom",
                          isCustomTrack: true,
                        }));
                      } else {
                        setEditModal((prev) => ({
                          ...prev,
                          track: val,
                          isCustomTrack: false,
                          customTrack: "",
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  >
                    {PREDEFINED_TRACKS.map((trk) => (
                      <option key={trk} value={trk}>
                        {trk}
                      </option>
                    ))}
                    <option value="custom">+ Custom Track</option>
                  </select>
                  {editModal.isCustomTrack && (
                    <input
                      type="text"
                      placeholder="Specify custom track"
                      value={editModal.customTrack}
                      onChange={(e) =>
                        setEditModal((prev) => ({
                          ...prev,
                          customTrack: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                    />
                  )}
                  {editModal.errors?.track && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {editModal.errors.track}
                    </p>
                  )}
                </div>
              </div>

              {/* Work Mode & Conditional Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Mode *
                  </label>
                  <select
                    value={editModal.mode}
                    onChange={(e) => {
                      const newMode = e.target.value;
                      setEditModal((prev) => ({
                        ...prev,
                        mode: newMode,
                        location: newMode === "remote" ? "" : prev.location,
                        errors: { ...prev.errors, location: "" },
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  >
                    <option value="remote">Remote</option>
                    <option value="onsite">On-Site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location {editModal.mode === "remote" ? "(Not applicable)" : "*"}
                  </label>
                  {editModal.mode === "remote" ? (
                    <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 italic">
                      Location disabled for Remote positions
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={editModal.location}
                      onChange={(e) =>
                        setEditModal((prev) => ({ ...prev, location: e.target.value }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                      placeholder="e.g. Bengaluru, India"
                    />
                  )}
                  {editModal.errors?.location && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {editModal.errors.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration: Presets or Custom */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Duration *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={editModal.durationChoice}
                    onChange={(e) =>
                      setEditModal((prev) => ({
                        ...prev,
                        durationChoice: e.target.value,
                        errors: { ...prev.errors, duration: "" },
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  >
                    <option value="">Select duration...</option>
                    {PRESET_DURATIONS.map((dur) => (
                      <option key={dur} value={dur}>
                        {dur}
                      </option>
                    ))}
                    <option value="custom">+ Custom Duration</option>
                  </select>

                  {editModal.durationChoice === "custom" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Value (e.g. 10)"
                        value={editModal.customDurationValue}
                        onChange={(e) =>
                          setEditModal((prev) => ({
                            ...prev,
                            customDurationValue: e.target.value,
                            errors: { ...prev.errors, duration: "" },
                          }))
                        }
                        className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                      />
                      <select
                        value={editModal.customDurationUnit}
                        onChange={(e) =>
                          setEditModal((prev) => ({
                            ...prev,
                            customDurationUnit: e.target.value,
                          }))
                        }
                        className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                      >
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                      </select>
                    </div>
                  )}
                </div>
                {editModal.errors?.duration && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {editModal.errors.duration}
                  </p>
                )}
              </div>

              {/* Compensation Choices */}
              <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">
                  Compensation Model *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "paid", label: "Paid" },
                    { id: "unpaid", label: "Unpaid" },
                    { id: "skill-based", label: "Skill-based" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setEditModal((prev) => ({
                          ...prev,
                          compensationType: type.id,
                          errors: { ...prev.errors, stipend: "" },
                        }))
                      }
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                        editModal.compensationType === type.id
                          ? "bg-[#4B9C93] text-white shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Paid: Required Min and Max */}
                {editModal.compensationType === "paid" && (
                  <div className="pt-2">
                    <div className="flex gap-3 mb-2 text-[11px] text-slate-600">
                      {["fixed", "range"].map((mode) => <label key={mode} className="flex items-center gap-1"><input type="radio" name="edit-stipend-mode" checked={editModal.stipendMode === mode} onChange={() => setEditModal((prev) => ({ ...prev, stipendMode: mode, stipendMax: mode === "fixed" ? "" : prev.stipendMax }))} />{mode === "fixed" ? "Fixed amount" : "Range"}</label>)}
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1.5">{editModal.stipendMode === "fixed" ? "Monthly Stipend (₹) *" : "Monthly Stipend Range (₹) *"}</p>
                    <div className={`grid ${editModal.stipendMode === "fixed" ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
                      <div>
                        <input
                          type="number"
                          min="0"
                          placeholder={editModal.stipendMode === "fixed" ? "Amount (e.g. 15000)" : "Min amount (e.g. 15000)"}
                          value={editModal.stipendMin}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              stipendMin: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                        />
                      </div>
                      {editModal.stipendMode === "range" && <div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Max amount (e.g. 25000)"
                          value={editModal.stipendMax}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              stipendMax: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                        />
                      </div>}
                    </div>
                  </div>
                )}

                {/* Unpaid notice */}
                {editModal.compensationType === "unpaid" && (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    This internship is Unpaid. No monetary stipend amount will be saved.
                  </p>
                )}
                {editModal.compensationType === "skill-based" && <p className="text-[11px] text-slate-500 italic pt-1">Skill-based compensation. No monetary stipend amount will be saved.</p>}

                {/* Flexible: Optional Range */}
                {editModal.compensationType === "flexible" && (
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      Monthly Stipend Range (₹) — <em>Optional</em>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Min (optional)"
                          value={editModal.stipendMin}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              stipendMin: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Max (optional)"
                          value={editModal.stipendMax}
                          onChange={(e) =>
                            setEditModal((prev) => ({
                              ...prev,
                              stipendMax: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editModal.errors?.stipend && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {editModal.errors.stipend}
                  </p>
                )}
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Skills (comma separated) *
                </label>
                <input
                  type="text"
                  value={editModal.skills}
                  onChange={(e) =>
                    setEditModal((prev) => ({ ...prev, skills: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  placeholder="e.g. React, Next.js, TypeScript, Tailwind CSS"
                />
                {editModal.errors?.skills && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {editModal.errors.skills}
                  </p>
                )}
              </div>

              {/* Optional Poster Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Poster Image (Optional)
                </label>

                {editModal.posterImage ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={editModal.posterImage}
                      alt="Poster Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal((prev) => ({ ...prev, posterImage: "" }))
                      }
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-900 text-white text-xs cursor-pointer"
                      title="Remove Poster"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-[#4B9C93] rounded-xl bg-slate-50 cursor-pointer transition-colors">
                    {editModal.posterUploading ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-4 h-4 border-2 border-[#4B9C93]/20 border-t-[#4B9C93] rounded-full animate-spin" />
                        <span>Uploading image...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-600">
                          Click to upload poster image
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG, or WebP (max 5MB)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => handleUploadFile(e, setEditModal)}
                      className="hidden"
                      disabled={editModal.posterUploading}
                    />
                  </label>
                )}
                {editModal.errors?.poster && (
                  <p className="text-[11px] text-rose-600">
                    {editModal.errors.poster}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Description & Scope
                </label>
                <textarea
                  rows={3}
                  value={editModal.description}
                  onChange={(e) =>
                    setEditModal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  placeholder="Describe internship responsibilities, mentorship structure, and project goals..."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModal.saving || editModal.posterUploading}
                  className="px-4 py-2 rounded-xl bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  {editModal.saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Internship Modal */}
      {createModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-[#4B9C93]" />
                <h3 className="font-bold text-base text-slate-900">
                  Post New Internship Opening
                </h3>
              </div>
              <button
                onClick={() => setCreateModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCreate} className="space-y-4">
              {createModal.errors?.submit && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {createModal.errors.submit}
                </div>
              )}

              {/* Role Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Title *
                </label>
                <input
                  type="text"
                  value={createModal.role}
                  onChange={(e) =>
                    setCreateModal((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  placeholder="e.g. Frontend Engineering Intern"
                />
                {createModal.errors?.role && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {createModal.errors.role}
                  </p>
                )}
              </div>

              {/* Department & Track */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={createModal.department}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setCreateModal((prev) => ({
                          ...prev,
                          department: "custom",
                          isCustomDepartment: true,
                        }));
                      } else {
                        setCreateModal((prev) => ({
                          ...prev,
                          department: val,
                          isCustomDepartment: false,
                          customDepartment: "",
                          track: DEPARTMENT_TRACK_MAP[val] || prev.track,
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  >
                    {PREDEFINED_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                    <option value="custom">+ Custom Department</option>
                  </select>
                  {createModal.isCustomDepartment && (
                    <input
                      type="text"
                      placeholder="Specify custom department"
                      value={createModal.customDepartment}
                      onChange={(e) =>
                        setCreateModal((prev) => ({
                          ...prev,
                          customDepartment: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                    />
                  )}
                  {createModal.errors?.department && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {createModal.errors.department}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Track *
                  </label>
                  <select
                    value={createModal.track}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "custom") {
                        setCreateModal((prev) => ({
                          ...prev,
                          track: "custom",
                          isCustomTrack: true,
                        }));
                      } else {
                        setCreateModal((prev) => ({
                          ...prev,
                          track: val,
                          isCustomTrack: false,
                          customTrack: "",
                        }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  >
                    {PREDEFINED_TRACKS.map((trk) => (
                      <option key={trk} value={trk}>
                        {trk}
                      </option>
                    ))}
                    <option value="custom">+ Custom Track</option>
                  </select>
                  {createModal.isCustomTrack && (
                    <input
                      type="text"
                      placeholder="Specify custom track"
                      value={createModal.customTrack}
                      onChange={(e) =>
                        setCreateModal((prev) => ({
                          ...prev,
                          customTrack: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                    />
                  )}
                  {createModal.errors?.track && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {createModal.errors.track}
                    </p>
                  )}
                </div>
              </div>

              {/* Work Mode & Conditional Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Mode *
                  </label>
                  <select
                    value={createModal.mode}
                    onChange={(e) => {
                      const newMode = e.target.value;
                      setCreateModal((prev) => ({
                        ...prev,
                        mode: newMode,
                        location: newMode === "remote" ? "" : prev.location,
                        errors: { ...prev.errors, location: "" },
                      }));
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  >
                    <option value="remote">Remote</option>
                    <option value="onsite">On-Site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location {createModal.mode === "remote" ? "(Not applicable)" : "*"}
                  </label>
                  {createModal.mode === "remote" ? (
                    <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 italic">
                      Location disabled for Remote positions
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={createModal.location}
                      onChange={(e) =>
                        setCreateModal((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                      placeholder="e.g. Bengaluru, India"
                    />
                  )}
                  {createModal.errors?.location && (
                    <p className="text-[11px] text-rose-600 mt-1">
                      {createModal.errors.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Duration: Presets or Custom */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Duration *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={createModal.durationChoice}
                    onChange={(e) =>
                      setCreateModal((prev) => ({
                        ...prev,
                        durationChoice: e.target.value,
                        errors: { ...prev.errors, duration: "" },
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  >
                    <option value="">Select duration...</option>
                    {PRESET_DURATIONS.map((dur) => (
                      <option key={dur} value={dur}>
                        {dur}
                      </option>
                    ))}
                    <option value="custom">+ Custom Duration</option>
                  </select>

                  {createModal.durationChoice === "custom" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="Value (e.g. 10)"
                        value={createModal.customDurationValue}
                        onChange={(e) =>
                          setCreateModal((prev) => ({
                            ...prev,
                            customDurationValue: e.target.value,
                            errors: { ...prev.errors, duration: "" },
                          }))
                        }
                        className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                      />
                      <select
                        value={createModal.customDurationUnit}
                        onChange={(e) =>
                          setCreateModal((prev) => ({
                            ...prev,
                            customDurationUnit: e.target.value,
                          }))
                        }
                        className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                      >
                        <option value="Weeks">Weeks</option>
                        <option value="Months">Months</option>
                      </select>
                    </div>
                  )}
                </div>
                {createModal.errors?.duration && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {createModal.errors.duration}
                  </p>
                )}
              </div>

              {/* Compensation Choices */}
              <div className="space-y-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700">
                  Compensation Model *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "paid", label: "Paid" },
                    { id: "unpaid", label: "Unpaid" },
                    { id: "skill-based", label: "Skill-based" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() =>
                        setCreateModal((prev) => ({
                          ...prev,
                          compensationType: type.id,
                          errors: { ...prev.errors, stipend: "" },
                        }))
                      }
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                        createModal.compensationType === type.id
                          ? "bg-[#4B9C93] text-white shadow-2xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Paid: Required Min and Max */}
                {createModal.compensationType === "paid" && (
                  <div className="pt-2">
                    <div className="flex gap-3 mb-2 text-[11px] text-slate-600">
                      {["fixed", "range"].map((mode) => <label key={mode} className="flex items-center gap-1"><input type="radio" name="create-stipend-mode" checked={createModal.stipendMode === mode} onChange={() => setCreateModal((prev) => ({ ...prev, stipendMode: mode, stipendMax: mode === "fixed" ? "" : prev.stipendMax }))} />{mode === "fixed" ? "Fixed amount" : "Range"}</label>)}
                    </div>
                    <p className="text-[11px] text-slate-500 mb-1.5">{createModal.stipendMode === "fixed" ? "Monthly Stipend (₹) *" : "Monthly Stipend Range (₹) *"}</p>
                    <div className={`grid ${createModal.stipendMode === "fixed" ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
                      <div>
                        <input
                          type="number"
                          min="0"
                          placeholder={createModal.stipendMode === "fixed" ? "Amount (e.g. 15000)" : "Min amount (e.g. 15000)"}
                          value={createModal.stipendMin}
                          onChange={(e) =>
                            setCreateModal((prev) => ({
                              ...prev,
                              stipendMin: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                        />
                      </div>
                      {createModal.stipendMode === "range" && <div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Max amount (e.g. 25000)"
                          value={createModal.stipendMax}
                          onChange={(e) =>
                            setCreateModal((prev) => ({
                              ...prev,
                              stipendMax: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                        />
                      </div>}
                    </div>
                  </div>
                )}

                {/* Unpaid notice */}
                {createModal.compensationType === "unpaid" && (
                  <p className="text-[11px] text-slate-500 italic pt-1">
                    This internship is Unpaid. No monetary stipend amount will be saved.
                  </p>
                )}
                {createModal.compensationType === "skill-based" && <p className="text-[11px] text-slate-500 italic pt-1">Skill-based compensation. No monetary stipend amount will be saved.</p>}

                {/* Flexible: Optional Range */}
                {createModal.compensationType === "flexible" && (
                  <div className="pt-2">
                    <p className="text-[11px] text-slate-500 mb-1.5">
                      Monthly Stipend Range (₹) — <em>Optional</em>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Min (optional)"
                          value={createModal.stipendMin}
                          onChange={(e) =>
                            setCreateModal((prev) => ({
                              ...prev,
                              stipendMin: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          placeholder="Max (optional)"
                          value={createModal.stipendMax}
                          onChange={(e) =>
                            setCreateModal((prev) => ({
                              ...prev,
                              stipendMax: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {createModal.errors?.stipend && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {createModal.errors.stipend}
                  </p>
                )}
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Skills (comma separated) *
                </label>
                <input
                  type="text"
                  value={createModal.skills}
                  onChange={(e) =>
                    setCreateModal((prev) => ({ ...prev, skills: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  placeholder="e.g. React, Node.js, TypeScript"
                />
                {createModal.errors?.skills && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    {createModal.errors.skills}
                  </p>
                )}
              </div>

              {/* Optional Poster Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Poster Image (Optional)
                </label>

                {createModal.posterImage ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={createModal.posterImage}
                      alt="Poster Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setCreateModal((prev) => ({ ...prev, posterImage: "" }))
                      }
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/70 hover:bg-slate-900 text-white text-xs cursor-pointer"
                      title="Remove Poster"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-[#4B9C93] rounded-xl bg-slate-50 cursor-pointer transition-colors">
                    {createModal.posterUploading ? (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="w-4 h-4 border-2 border-[#4B9C93]/20 border-t-[#4B9C93] rounded-full animate-spin" />
                        <span>Uploading image...</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-xs font-medium text-slate-600">
                          Click to upload poster image
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          PNG, JPG, or WebP (max 5MB)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => handleUploadFile(e, setCreateModal)}
                      className="hidden"
                      disabled={createModal.posterUploading}
                    />
                  </label>
                )}
                {createModal.errors?.poster && (
                  <p className="text-[11px] text-rose-600">
                    {createModal.errors.poster}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={createModal.description}
                  onChange={(e) =>
                    setCreateModal((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4B9C93]"
                  placeholder="Outline expectations, responsibilities, and mentorship..."
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() =>
                    setCreateModal((prev) => ({ ...prev, isOpen: false }))
                  }
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createModal.saving || createModal.posterUploading}
                  className="px-4 py-2 rounded-xl bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  {createModal.saving ? "Publishing..." : "Publish Opening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
