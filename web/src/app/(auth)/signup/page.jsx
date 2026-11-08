"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/apiClient";
import { getEmailVerificationPath } from "@/features/auth/authFlowUtils.mjs";

const signupRoleConfigs = {
  student: {
    title: "Student Sign up",
    tagline: "Create your account and start your\nskills with showmyskills",
    nameLabel: "Full Name",
    namePlaceholder: "e.g. Tara Joshi",
    emailLabel: "Email Address",
    emailPlaceholder: "you@university.edu",
    hasWebsite: false,
    illustration: "/Signup/Student.png",
    dashboardRoute: "/student/internships",
  },
  company: {
    title: "Company Sign up",
    tagline: "Select the candidates as per your\nrequirements with showmyskills",
    nameLabel: "Company Name",
    namePlaceholder: "e.g. XYZ Company",
    emailLabel: "Office Email Address",
    emailPlaceholder: "hello@xyzcompany.com",
    hasWebsite: true,
    websitePlaceholder: "e.g. https://xyzcompany.com",
    illustration: "/Signup/Company.png",
    dashboardRoute: "/company/dashboard",
  },
  college: {
    title: "College Sign up",
    tagline: "Improve placement outcomes and manage\nstudent talent with showmyskills",
    nameLabel: "College Name",
    namePlaceholder: "e.g. National Institute of Technology",
    emailLabel: "College Email Address",
    emailPlaceholder: "admin@college.edu",
    hasWebsite: true,
    websitePlaceholder: "e.g. https://university.edu",
    illustration: "/Signup/Company.png",
    dashboardRoute: "/college/dashboard",
  },
  admin: {
    title: "Admin Access Application",
    tagline: "Apply for administrator privileges.\nApplications are reviewed and granted by core admins.",
    nameLabel: "Applicant Full Name",
    namePlaceholder: "e.g. Jordan Hayes",
    emailLabel: "Applicant Email Address",
    emailPlaceholder: "admin.applicant@domain.com",
    hasWebsite: false,
    illustration: "/Signup/Admin.png",
    dashboardRoute: "/admin/dashboard",
  },
};

const COUNTRY_CODES = [
  { code: "+91", label: "+91 (India)" },
  { code: "+1", label: "+1 (US/Canada)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+61", label: "+61 (Australia)" },
  { code: "+65", label: "+65 (Singapore)" },
  { code: "+971", label: "+971 (UAE)" },
  { code: "+49", label: "+49 (Germany)" },
  { code: "+33", label: "+33 (France)" },
  { code: "+81", label: "+81 (Japan)" },
  { code: "+86", label: "+86 (China)" },
  { code: "+966", label: "+966 (Saudi Arabia)" },
  { code: "+60", label: "+60 (Malaysia)" },
  { code: "+62", label: "+62 (Indonesia)" },
  { code: "+92", label: "+92 (Pakistan)" },
  { code: "+880", label: "+880 (Bangladesh)" },
  { code: "+977", label: "+977 (Nepal)" },
  { code: "+94", label: "+94 (Sri Lanka)" },
];

const getApiBaseUrl = () => {
  const url =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  return url.replace(/\/$/, "");
};

/**
 * Six separate single-digit OTP boxes component.
 * Supports:
 * - Typing single digit & auto-focusing next box
 * - Backspace clearing & moving to previous box
 * - Arrow key navigation (ArrowLeft, ArrowRight)
 * - Pasting 6 digits across all boxes
 * - Numeric keypad on mobile devices
 */
function OtpBoxes({ value = "", onChange, disabled = false, idPrefix = "otp" }) {
  const inputsRef = useRef([]);

  // Extract up to 6 characters
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const handleChange = (index, e) => {
    if (disabled) return;
    const inputVal = e.target.value;
    const char = inputVal.slice(-1);

    if (!/^\d*$/.test(char)) return; // Allow only digits

    const newDigits = [...digits];
    newDigits[index] = char;
    const combined = newDigits.join("");
    onChange(combined);

    if (char && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (disabled) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = "";
        onChange(newDigits.join(""));
      } else if (index > 0) {
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < 5) inputsRef.current[index + 1]?.focus();
    } else if (e.key === "Delete") {
      e.preventDefault();
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
    }
  };

  const handlePaste = (e) => {
    if (disabled) return;
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    onChange(pasted);
    const targetIdx = Math.min(pasted.length, 5);
    inputsRef.current[targetIdx]?.focus();
  };

  return (
    <div
      className="flex items-center justify-between gap-1.5 sm:gap-2.5 w-full max-w-sm"
      onPaste={handlePaste}
    >
      {[0, 1, 2, 3, 4, 5].map((idx) => (
        <input
          key={idx}
          ref={(el) => (inputsRef.current[idx] = el)}
          id={`${idPrefix}-${idx}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[idx] || ""}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className="w-10 h-11 sm:w-11 sm:h-12 text-center text-lg sm:text-xl font-bold rounded-xl border border-[#DADADA] bg-[#F9FAFB] text-gray-900 focus:outline-none focus:border-[#4B9C93] focus:bg-white focus:ring-2 focus:ring-[#4B9C93]/20 disabled:bg-gray-100 disabled:text-gray-400 transition-all shadow-2xs"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

function getLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DateOfBirthPicker({ value, onChange }) {
  const containerRef = useRef(null);
  const today = new Date();
  const todayString = getLocalDateString(today);
  const currentYear = today.getFullYear();
  const initialViewDate = value
    ? new Date(`${value}T12:00:00`)
    : new Date(currentYear - 18, today.getMonth(), today.getDate());
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarCells = Array.from(
    { length: firstWeekday + daysInMonth },
    (_, index) => (index < firstWeekday ? null : index - firstWeekday + 1)
  );
  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;
  const displayValue = selectedDate && !Number.isNaN(selectedDate.getTime())
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      }).format(selectedDate)
    : "Select your date of birth";

  // Sync view year/month when value changes externally
  useEffect(() => {
    if (!value) return;
    const parsed = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

  // Handle click outside and Escape key to close picker
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        const trigger = document.getElementById("admin-dob-button");
        trigger?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const changeMonth = (offset) => {
    const next = new Date(viewYear, viewMonth + offset, 1);
    if (offset > 0 && isFutureMonth(next.getFullYear(), next.getMonth())) return;
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const isFutureMonth = (year, month) =>
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth());

  // Handle keyboard arrow keys inside calendar day grid
  const handleDayKeyDown = (day, event) => {
    let targetDay = null;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      targetDay = day - 1;
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      targetDay = day + 1;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      targetDay = day - 7;
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      targetDay = day + 7;
    }

    if (targetDay !== null && targetDay >= 1 && targetDay <= daysInMonth) {
      const targetDateString = getLocalDateString(new Date(viewYear, viewMonth, targetDay));
      if (targetDateString <= todayString) {
        const el = document.getElementById(`dob-day-${targetDay}`);
        el?.focus();
      }
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id="admin-dob-button"
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls="dob-calendar-popover"
        aria-required="true"
        onClick={() => setIsOpen((open) => !open)}
        className="w-full h-[40px] px-3.5 flex items-center justify-between rounded-lg border border-[#DADADA] bg-[#F9FAFB] text-left text-xs sm:text-sm text-[#1F2937] shadow-2xs hover:border-[#4B9C93] focus:outline-none focus:border-[#4B9C93] focus:bg-white focus:ring-2 focus:ring-[#4B9C93]/20 transition"
      >
        <span className={value ? "font-medium text-gray-900" : "text-[#4A5565]/70"}>
          {displayValue}
        </span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 text-[#4B9C93] shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {isOpen && (
        <div
          id="dob-calendar-popover"
          role="dialog"
          aria-modal="true"
          aria-label="Date of birth picker"
          className="absolute left-0 top-full z-50 mt-1.5 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-[0_16px_40px_rgba(15,23,42,0.18)]"
        >
          {/* Quick Month & Year Selectors */}
          <div className="mb-3 flex items-center gap-2">
            <select
              id="dob-month-select"
              aria-label="Month"
              value={viewMonth}
              onChange={(event) => setViewMonth(Number(event.target.value))}
              className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#4B9C93] focus:outline-none cursor-pointer"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index} disabled={isFutureMonth(viewYear, index)}>
                  {month}
                </option>
              ))}
            </select>
            <select
              id="dob-year-select"
              aria-label="Year"
              value={viewYear}
              onChange={(event) => {
                const year = Number(event.target.value);
                setViewYear(year);
                if (isFutureMonth(year, viewMonth)) setViewMonth(today.getMonth());
              }}
              className="h-9 w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs sm:text-sm font-semibold text-slate-800 focus:border-[#4B9C93] focus:outline-none cursor-pointer"
            >
              {Array.from({ length: currentYear - 1920 + 1 }, (_, index) => currentYear - index).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Weekday Labels */}
          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <span key={day} className="py-0.5">{day}</span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, index) => {
              if (!day) return <span key={`empty-${index}`} aria-hidden="true" />;
              const dateString = getLocalDateString(new Date(viewYear, viewMonth, day));
              const isFuture = dateString > todayString;
              const isSelected = dateString === value;
              const cellDate = new Date(viewYear, viewMonth, day);
              const formattedAriaLabel = new Intl.DateTimeFormat("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              }).format(cellDate);

              return (
                <button
                  key={dateString}
                  id={`dob-day-${day}`}
                  type="button"
                  disabled={isFuture}
                  aria-label={formattedAriaLabel}
                  aria-pressed={isSelected}
                  aria-disabled={isFuture}
                  onKeyDown={(e) => handleDayKeyDown(day, e)}
                  onClick={() => {
                    onChange(dateString);
                    setIsOpen(false);
                    const trigger = document.getElementById("admin-dob-button");
                    trigger?.focus();
                  }}
                  className={`h-8 sm:h-9 rounded-lg text-xs sm:text-sm transition flex items-center justify-center font-medium ${
                    isSelected
                      ? "bg-[#009689] font-bold text-white shadow-xs ring-2 ring-[#009689]/20"
                      : isFuture
                        ? "cursor-not-allowed text-slate-300 opacity-30"
                        : "text-slate-700 hover:bg-[#E8F5F3] hover:text-[#007E73] focus:bg-[#E8F5F3] focus:outline-none focus:ring-1 focus:ring-[#009689]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Bottom Toolbar: Prev, Notice, Next */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              disabled={viewYear === 1920 && viewMonth === 0}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            >
              ‹ Prev
            </button>
            <span className="text-[11px] text-slate-400 font-medium">Future dates locked</span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              disabled={isFutureMonth(viewYear, viewMonth + 1)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
            >
              Next ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") || "student";
  const previewParam = searchParams.get("preview");

  // Development environment check (never active in production)
  const isDev = process.env.NODE_ENV !== "production";

  const [activeRole, setActiveRole] = useState(
    signupRoleConfigs[initialRole] ? initialRole : "student"
  );

  // Standard Student / Company Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Student Specific Form State
  const [studentCollege, setStudentCollege] = useState("");
  const [studentGraduationYear, setStudentGraduationYear] = useState("");
  const [studentCollegeId, setStudentCollegeId] = useState("");
  const [studentCollegeIdFile, setStudentCollegeIdFile] = useState(null);
  const [studentCollegeIdPreview, setStudentCollegeIdPreview] = useState(null);
  const [studentFileError, setStudentFileError] = useState("");
  const [studentCountryCode, setStudentCountryCode] = useState("+91");
  const [studentPhone, setStudentPhone] = useState("");

  // Student Email Verification State
  const [studentOtp, setStudentOtp] = useState("");
  const [studentOtpSent, setStudentOtpSent] = useState(false);
  const [studentOtpSending, setStudentOtpSending] = useState(false);
  const [studentOtpCountdown, setStudentOtpCountdown] = useState(0);
  const [studentOtpVerifying, setStudentOtpVerifying] = useState(false);
  const [studentEmailVerified, setStudentEmailVerified] = useState(false);
  const [studentVerificationToken, setStudentVerificationToken] = useState("");
  const [studentOtpMsg, setStudentOtpMsg] = useState("");
  const [studentOtpError, setStudentOtpError] = useState("");

  const studentFileInputRef = useRef(null);

  // Admin Flow State
  const [adminStep, setAdminStep] = useState(1);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminDob, setAdminDob] = useState("");

  // Page 1 OTP State
  const [applicantOtp, setApplicantOtp] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [sendingApplicantOtp, setSendingApplicantOtp] = useState(false);
  const [applicantOtpCountdown, setApplicantOtpCountdown] = useState(0);
  const [applicantOtpMsg, setApplicantOtpMsg] = useState("");
  const [applicantOtpError, setApplicantOtpError] = useState("");
  const [verifyingApplicantOtp, setVerifyingApplicantOtp] = useState(false);

  // Page 2 State
  const [officialOtp, setOfficialOtp] = useState("");
  const [sendingOfficialOtp, setSendingOfficialOtp] = useState(false);
  const [officialOtpCountdown, setOfficialOtpCountdown] = useState(0);
  const [officialOtpMsg, setOfficialOtpMsg] = useState("");
  const [officialOtpError, setOfficialOtpError] = useState("");
  const [recommendedBy, setRecommendedBy] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [submittingAdminApp, setSubmittingAdminApp] = useState(false);
  const [adminAppSuccess, setAdminAppSuccess] = useState(false);
  const [adminAppError, setAdminAppError] = useState("");

  // Preview Mode State (Development only)
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const fileInputRef = useRef(null);

  // Development-only preview initialization via URL parameter
  useEffect(() => {
    if (!isDev) return; // Strict guard: NEVER run preview bypass in production

    if (
      activeRole === "admin" &&
      (previewParam === "step2" ||
        previewParam === "page2" ||
        previewParam === "true")
    ) {
      setAdminName("Jordan Hayes (Sample Preview)");
      setAdminEmail("jordan.preview@showmyskills.dev");
      setAdminPhone("+91 98765 43210");
      setAdminDob("1996-03-22");
      setIsEmailVerified(true);
      setVerificationToken("dev_sample_preview_token");
      setAdminStep(2);
      setIsPreviewMode(true);
    }
  }, [isDev, activeRole, previewParam]);

  // Activate preview manually from Page 1 in development
  const handleActivateDevPreview = () => {
    if (!isDev) return;
    setAdminName("Jordan Hayes (Sample Preview)");
    setAdminEmail("jordan.preview@showmyskills.dev");
    setAdminPhone("+91 98765 43210");
    setAdminDob("1996-03-22");
    setIsEmailVerified(true);
    setVerificationToken("dev_sample_preview_token");
    setAdminStep(2);
    setIsPreviewMode(true);
  };

  // Cooldown timers
  useEffect(() => {
    if (studentOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setStudentOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [studentOtpCountdown]);

  useEffect(() => {
    if (applicantOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setApplicantOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [applicantOtpCountdown]);

  useEffect(() => {
    if (officialOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOfficialOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [officialOtpCountdown]);

  const config = signupRoleConfigs[activeRole];

  // Student Flow Handlers
  const handleStudentEmailChange = (val) => {
    setEmail(val);
    if (studentEmailVerified || studentOtpSent) {
      setStudentEmailVerified(false);
      setStudentOtpSent(false);
      setStudentVerificationToken("");
      setStudentOtpMsg("");
      setStudentOtpError("");
      setStudentOtp("");
    }
  };

  const handleSendStudentOtp = async () => {
    setStudentOtpError("");
    setStudentOtpMsg("");

    const emailTrimmed = email.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setStudentOtpError("Please enter a valid email address first.");
      return;
    }

    setStudentOtpSending(true);
    try {
      const res = await authService.sendSignupOtp(emailTrimmed.toLowerCase());
      setStudentOtpSent(true);
      setStudentOtpCountdown(60);
      setStudentOtpMsg(res?.message || "Verification code sent to your email.");
    } catch (err) {
      setStudentOtpError(
        err.message || "Failed to send verification code. Please try again."
      );
    } finally {
      setStudentOtpSending(false);
    }
  };

  const handleVerifyStudentOtp = async () => {
    setStudentOtpError("");
    setStudentOtpMsg("");

    const cleanOtp = studentOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setStudentOtpError("Please enter the 6-digit verification code.");
      return;
    }

    setStudentOtpVerifying(true);
    try {
      const res = await authService.verifySignupOtp(
        email.trim().toLowerCase(),
        cleanOtp
      );
      setStudentEmailVerified(true);
      setStudentVerificationToken(res.verificationToken || "verified");
      setStudentOtpMsg("Email verified successfully!");
    } catch (err) {
      setStudentOtpError(
        err.message || "Invalid or expired verification code."
      );
    } finally {
      setStudentOtpVerifying(false);
    }
  };

  const handleStudentCollegeIdSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setStudentFileError("Only JPG, PNG, and PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStudentFileError("File size must be less than 5MB.");
      return;
    }

    setStudentFileError("");
    setStudentCollegeIdFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setStudentCollegeIdPreview(uploadEvent.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setStudentCollegeIdPreview(null);
    }
  };

  const handleRemoveStudentCollegeId = () => {
    setStudentCollegeIdFile(null);
    setStudentCollegeIdPreview(null);
    setStudentFileError("");
    if (studentFileInputRef.current) {
      studentFileInputRef.current.value = "";
    }
  };

  // Standard Student / Company Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (activeRole === "student") {
      if (!studentEmailVerified) {
        setError("Please verify your email address before creating your account.");
        return;
      }

      if (!studentCollege.trim()) {
        setError("College or University name is required");
        return;
      }

      if (!studentGraduationYear) {
        setError("Graduation year is required");
        return;
      }

      if (!studentCollegeId.trim()) {
        setError("College ID / Roll Number is required");
        return;
      }

      const cleanPhone = studentPhone.trim().replace(/^0+/, "");
      if (!cleanPhone) {
        setError("Phone number is required");
        return;
      }

      const formattedPhone = `${studentCountryCode}${cleanPhone}`;

      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("name", fullName.trim());
        formData.append("email", email.trim().toLowerCase());
        formData.append("phone", formattedPhone);
        formData.append("password", password);
        formData.append("role", "student");
        formData.append("college", studentCollege.trim());
        formData.append("graduationYear", String(studentGraduationYear));
        formData.append("collegeId", studentCollegeId.trim());
        if (studentVerificationToken) {
          formData.append("verificationToken", studentVerificationToken);
        }
        if (studentCollegeIdFile) {
          formData.append("collegeIdFile", studentCollegeIdFile);
        }

        const res = await authService.register(formData);
        const token = res?.data?.accessToken || res?.data?.token || res?.token;
        if (token) {
          localStorage.setItem("showmyskills_token", token);
          localStorage.setItem(
            "showmyskills_user",
            JSON.stringify(res.data?.user || res.data || res.user || { name: fullName, email, role: "student" })
          );
        }
        setTimeout(() => {
          setLoading(false);
          router.push(config.dashboardRoute);
        }, 400);
      } catch (err) {
        setLoading(false);
        setError(err.message || "Failed to create account. Please try again.");
      }
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: fullName,
        email,
        phone,
        website,
        password,
        role: activeRole,
      });
      setTimeout(() => {
        setLoading(false);
        router.push(getEmailVerificationPath(email));
      }, 400);
    } catch (err) {
      setLoading(false);
      setError(err.message || "Failed to create account. Please try again.");
    }
  };

  // --- Admin Flow Handlers ---

  // Page 1: Send OTP to Applicant Email
  const handleSendApplicantOtp = async () => {
    setApplicantOtpError("");
    setApplicantOtpMsg("");

    if (!adminEmail || !adminEmail.includes("@")) {
      setApplicantOtpError("Please enter a valid email address first.");
      return;
    }

    setSendingApplicantOtp(true);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/admin-applications/send-applicant-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: adminEmail }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      setApplicantOtpMsg("Verification code dispatched to your email address.");
      setApplicantOtpCountdown(60);
    } catch (err) {
      setApplicantOtpError(err.message || "Error requesting verification code");
    } finally {
      setSendingApplicantOtp(false);
    }
  };

  // Page 1: Verify Applicant Email OTP
  const handleVerifyApplicantOtp = async () => {
    setApplicantOtpError("");
    setApplicantOtpMsg("");

    if (!applicantOtp || applicantOtp.trim().length < 6) {
      setApplicantOtpError("Please enter the 6-digit verification code.");
      return;
    }

    setVerifyingApplicantOtp(true);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/admin-applications/verify-applicant-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: adminEmail,
            otp: applicantOtp.trim(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid or expired verification code");
      }

      setIsEmailVerified(true);
      setVerificationToken(data.verificationToken || "verified_token");
      setApplicantOtpMsg("Email verified successfully! You may now proceed.");
    } catch (err) {
      setApplicantOtpError(err.message || "Failed to verify code");
    } finally {
      setVerifyingApplicantOtp(false);
    }
  };

  // Transition Page 1 -> Page 2
  const handleProceedToPage2 = (e) => {
    e.preventDefault();
    setApplicantOtpError("");

    if (!adminName.trim()) {
      setApplicantOtpError("Please enter your full name.");
      return;
    }
    if (!adminEmail.trim()) {
      setApplicantOtpError("Please enter your email address.");
      return;
    }
    if (!adminPhone.trim()) {
      setApplicantOtpError("Please enter your phone number.");
      return;
    }
    if (!adminDob) {
      setApplicantOtpError("Please enter your date of birth.");
      return;
    }
    if (adminDob > getLocalDateString(new Date())) {
      setApplicantOtpError("Date of birth must not be in the future.");
      return;
    }
    if (!isEmailVerified) {
      setApplicantOtpError(
        "You must verify your email address before continuing to Page 2."
      );
      return;
    }

    setAdminStep(2);
  };

  // Page 2: Send Official OTP to Fixed ShowMySkills Address
  const handleSendOfficialOtp = async () => {
    setOfficialOtpError("");
    setOfficialOtpMsg("");

    if (isPreviewMode) {
      setOfficialOtpMsg(
        "Development preview: Official code simulated as 123456."
      );
      setOfficialOtp("123456");
      setOfficialOtpCountdown(30);
      return;
    }

    setSendingOfficialOtp(true);
    try {
      const res = await fetch(
        `${getApiBaseUrl()}/admin-applications/send-official-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            applicantEmail: adminEmail,
            verificationToken,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to request official code");
      }

      setOfficialOtpMsg(
        "Authorization code sent to the official ShowMySkills administrative email."
      );
      setOfficialOtpCountdown(60);
    } catch (err) {
      setOfficialOtpError(
        err.message || "Failed to dispatch official authorization code"
      );
    } finally {
      setSendingOfficialOtp(false);
    }
  };

  // Photo Upload Handler
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAdminAppError("Please select a valid image file (JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAdminAppError("Photo size must be less than 5MB.");
      return;
    }

    setAdminAppError("");
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setPhotoPreview(uploadEvent.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Page 2: Submit Admin Application
  const handleSubmitAdminApplication = async (e) => {
    e.preventDefault();
    setAdminAppError("");

    if (!officialOtp || officialOtp.trim().length < 6) {
      setAdminAppError(
        "Please enter the complete 6-digit official ShowMySkills authorization code."
      );
      return;
    }

    if (!recommendedBy.trim()) {
      setAdminAppError(
        "Please enter the name of the person referring/recommending you as an admin."
      );
      return;
    }

    if (!photoFile && !isPreviewMode) {
      setAdminAppError("Please upload your applicant profile photo.");
      return;
    }

    if (!photoConsent) {
      setAdminAppError(
        "You must consent to your photo being publicly visible as your admin profile icon before submitting."
      );
      return;
    }

    // In preview mode: must NOT submit or save an application to backend
    if (isPreviewMode) {
      setSubmittingAdminApp(true);
      setTimeout(() => {
        setSubmittingAdminApp(false);
        setAdminAppSuccess(true);
      }, 500);
      return;
    }

    setSubmittingAdminApp(true);

    try {
      const formData = new FormData();
      formData.append("name", adminName.trim());
      formData.append("email", adminEmail.trim());
      formData.append("phone", adminPhone.trim());
      formData.append("dob", adminDob);
      formData.append("recommendedBy", recommendedBy.trim());
      formData.append("notes", adminNotes.trim());
      formData.append("photoConsent", "true");
      formData.append("officialOtp", officialOtp.trim());
      formData.append("verificationToken", verificationToken);
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const res = await fetch(
        `${getApiBaseUrl()}/admin-applications/submit`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to submit admin application");
      }

      setAdminAppSuccess(true);
    } catch (err) {
      setAdminAppError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmittingAdminApp(false);
    }
  };

  return (
    <div className="w-full max-w-[1240px] bg-[#4B9C93] relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
      {/* ──── Left Side: Branding & Illustration ──── */}
      <div className="w-full lg:w-[440px] flex flex-col justify-between self-stretch z-10 py-2">
        <div>
          <Link href="/" className="inline-flex items-center gap-3.5 group mb-6">
            <img
              src="/logo.png"
              alt="ShowMySkills Logo"
              className="w-12 sm:w-[60px] h-auto object-contain"
            />
            <span className="text-white font-bold text-2xl sm:text-3xl tracking-tight">
              ShowMySkills
            </span>
          </Link>

          <div className="mb-4">
            <h1 className="text-white font-bold text-2xl sm:text-3xl lg:text-[28px] leading-tight mb-2">
              {config.title}
            </h1>
            <p className="text-white/95 font-medium text-sm sm:text-base lg:text-[17px] leading-relaxed whitespace-pre-line">
              {config.tagline}
            </p>
          </div>
        </div>

        {/* Illustration */}
        <div
          className={`relative w-full max-w-[420px] 2xl:max-w-[840px] mx-auto lg:ml-0 lg:mr-auto mt-4 lg:mt-2 mb-auto pt-2 flex flex-col items-center ${
            activeRole === "admin"
              ? "lg:-translate-x-[102px]"
              : activeRole === "company"
              ? "lg:-translate-x-[178px] lg:translate-y-[210px]"
              : "lg:-translate-x-[178px] lg:translate-y-[186px]"
          }`}
        >
          <img
            src={config.illustration}
            alt={`${activeRole} illustration`}
            className="w-full max-h-[380px] object-contain drop-shadow-md relative z-10 scale-[1.5] origin-top"
          />
          <div className="w-[85%] h-3 bg-black/15 rounded-full blur-[6px] mt-[-8px] z-0" />
        </div>
      </div>

      {/* ──── Right Side: Floating White Card ──── */}
      <div className="w-full lg:w-[640px] rounded-[28px] sm:rounded-[36px] bg-white shadow-[16px_20px_50px_rgba(0,0,0,0.18)] p-6 sm:p-8 lg:p-10 relative flex flex-col justify-between z-20">
        {/* Top Header Row with Role Switcher */}
        <div className="flex items-center justify-between gap-4 mb-2">
          {/* Role Switcher Pill Tabs */}
          <div className="flex items-center bg-gray-100/80 p-1 rounded-full text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setActiveRole("student");
                setAdminAppSuccess(false);
                setIsPreviewMode(false);
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeRole === "student"
                  ? "bg-[#4B9C93] text-white shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole("company");
                setAdminAppSuccess(false);
                setIsPreviewMode(false);
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeRole === "company"
                  ? "bg-[#4B9C93] text-white shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Company
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveRole("admin");
                setAdminStep(1);
                setAdminAppSuccess(false);
                setIsPreviewMode(false);
              }}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeRole === "admin"
                  ? "bg-[#4B9C93] text-white shadow-xs font-bold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin
            </button>
          </div>

          {activeRole === "admin" && !adminAppSuccess && (
            <div className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  adminStep === 1
                    ? "bg-[#009689] text-white"
                    : "bg-[#E6F5F3] text-[#009689]"
                }`}
              >
                1
              </span>
              <span className="text-gray-300">/</span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  adminStep === 2
                    ? "bg-[#009689] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                2
              </span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/*               ADMIN ACCESS APPLICATION FLOW              */}
        {/* ======================================================== */}
        {activeRole === "admin" ? (
          <div>
            {adminAppSuccess ? (
              /* Success State Screen */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 bg-[#E6F7F3] text-[#009689] rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Application Submitted
                  </h2>
                  <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
                    Your request for administrator access has been saved and is
                    pending review. No account or admin privileges have been
                    granted yet.
                  </p>
                </div>

                {isPreviewMode && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-800 text-xs font-semibold max-w-md mx-auto">
                    🛠️ Development Preview: Submission was simulated client-side. No data was written to the database.
                  </div>
                )}

                <div className="p-4 bg-[#F9FAFB] rounded-2xl border border-gray-200 text-left text-xs text-gray-600 space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Applicant:</span>
                    <span>{adminName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Email:</span>
                    <span>{adminEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Recommender:</span>
                    <span>{recommendedBy || "Core Admin Reference"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Photo Consent:</span>
                    <span className="text-emerald-600 font-bold">Confirmed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-700">Status:</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Pending Core Admin Approval
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic max-w-sm mx-auto">
                  Upon approval by an authorized core administrator, your uploaded
                  photo will be activated as your public profile icon.
                </p>

                <div className="pt-3 flex gap-3 justify-center">
                  <Link
                    href="/"
                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
                  >
                    Return Home
                  </Link>
                  <Link
                    href="/login?role=admin"
                    className="px-5 py-2.5 rounded-xl bg-[#009689] text-white font-bold text-sm hover:bg-[#007e73] transition shadow-xs"
                  >
                    Admin Login Portal
                  </Link>
                </div>
              </div>
            ) : adminStep === 1 ? (
              /* Page 1: Applicant Details and Email Verification */
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-2xl sm:text-[28px] font-bold text-gray-900">
                    Admin Access Application
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A5565] font-medium mt-0.5">
                    Page 1: Applicant details and email verification
                  </p>
                </div>

                {/* Development-only preview shortcut banner */}
                {isDev && (
                  <div className="mb-3.5 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900">
                    <span className="font-medium text-[11px]">
                      🛠️ Dev: Test Page 2 UI without OTP verification
                    </span>
                    <button
                      type="button"
                      onClick={handleActivateDevPreview}
                      id="dev-preview-jump-btn"
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition cursor-pointer"
                    >
                      Preview Page 2
                    </button>
                  </div>
                )}

                <form onSubmit={handleProceedToPage2} className="space-y-3.5">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#1F2937]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Jordan Hayes"
                      className="w-full h-[40px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/70 focus:outline-none focus:border-[#4B9C93] focus:bg-white"
                    />
                  </div>

                  {/* Email & Send OTP */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#1F2937]">
                      Email Address *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        disabled={isEmailVerified}
                        value={adminEmail}
                        onChange={(e) => {
                          setAdminEmail(e.target.value);
                          setIsEmailVerified(false);
                          setVerificationToken("");
                        }}
                        placeholder="you@domain.com"
                        className="flex-1 h-[40px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/70 focus:outline-none focus:border-[#4B9C93] focus:bg-white disabled:bg-gray-100 disabled:text-gray-500"
                      />
                      <button
                        type="button"
                        onClick={handleSendApplicantOtp}
                        disabled={
                          sendingApplicantOtp ||
                          applicantOtpCountdown > 0 ||
                          isEmailVerified
                        }
                        id="admin-send-otp-btn"
                        className="px-3.5 h-[40px] rounded-lg bg-[#009689] text-white text-xs font-bold hover:bg-[#007e73] transition disabled:opacity-50 cursor-pointer whitespace-nowrap flex items-center justify-center shrink-0"
                      >
                        {sendingApplicantOtp
                          ? "Sending..."
                          : applicantOtpCountdown > 0
                          ? `Resend (${applicantOtpCountdown}s)`
                          : isEmailVerified
                          ? "Verified ✓"
                          : "Send OTP"}
                      </button>
                    </div>
                  </div>

          

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#1F2937]">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full h-[40px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/70 focus:outline-none focus:border-[#4B9C93] focus:bg-white"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <label htmlFor="admin-dob-button" className="block text-xs font-semibold text-[#1F2937]">
                      Date of Birth *
                    </label>
                    <DateOfBirthPicker value={adminDob} onChange={setAdminDob} />
                  </div>

                  {/* Notice: Must verify email */}
                  {!isEmailVerified && (
                    <p className="text-[11px] text-[#4A5565] italic">
                      * The applicant must verify their email before continuing to Page 2.
                    </p>
                  )}

                  {/* Continue Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!isEmailVerified}
                      id="admin-continue-btn"
                      className="w-full h-[44px] rounded-xl bg-[#009689] hover:bg-[#007e73] active:scale-[0.99] text-white font-bold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Application Details →
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* Page 2: Admin Access Application */
              <div>
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminStep(1);
                      setIsPreviewMode(false);
                    }}
                    className="text-xs font-bold text-[#009689] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    ← Back to Page 1
                  </button>
                  <span className="text-xs text-gray-500 font-medium">
                    Verified: {adminEmail}
                  </span>
                </div>

                {/* Development-only preview alert banner */}
                {isPreviewMode && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs shadow-2xs">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <span>🛠️ Development Preview Mode (Page 2)</span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700">
                      Using sample applicant data. No live OTP was sent or verified.
                      Submissions in preview mode are client simulations and will
                      not be saved to the database.
                    </p>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h2 className="text-2xl sm:text-[28px] font-bold text-gray-900">
                    Admin Access Application
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A5565] font-medium mt-0.5">
                    Page 2: Official authorization & application details
                  </p>
                </div>

                <form onSubmit={handleSubmitAdminApplication} className="space-y-3.5">
                  {/* Fixed Official ShowMySkills OTP with Six Separate Boxes */}
                  <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#1F2937]">
                        Official ShowMySkills Authorization OTP *
                      </label>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                        Fixed Destination
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4A5565] leading-relaxed">
                      A security code sent to the fixed ShowMySkills official email
                      address. Destination is managed by the server and cannot be
                      modified.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                      <OtpBoxes
                        value={officialOtp}
                        onChange={setOfficialOtp}
                        idPrefix="official-otp-box"
                      />

                      <button
                        type="button"
                        onClick={handleSendOfficialOtp}
                        disabled={
                          sendingOfficialOtp || officialOtpCountdown > 0
                        }
                        id="admin-send-official-otp-btn"
                        className="w-full sm:w-auto px-3.5 h-[44px] rounded-xl bg-[#4B9C93] hover:bg-[#3d867e] text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
                      >
                        {sendingOfficialOtp
                          ? "Sending..."
                          : officialOtpCountdown > 0
                          ? `Resend (${officialOtpCountdown}s)`
                          : "Send to Official Email"}
                      </button>
                    </div>

                    {officialOtpMsg && (
                      <p className="text-xs text-emerald-700 font-medium pt-1">
                        {officialOtpMsg}
                      </p>
                    )}
                    {officialOtpError && (
                      <p className="text-xs text-red-600 font-medium pt-1">
                        {officialOtpError}
                      </p>
                    )}
                  </div>

                  {/* Recommender / Referrer Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#1F2937]">
                      Recommending / Referring Admin *
                    </label>
                    <input
                      type="text"
                      required
                      value={recommendedBy}
                      onChange={(e) => setRecommendedBy(e.target.value)}
                      placeholder="Name of the person recommending you as an admin"
                      className="w-full h-[40px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/70 focus:outline-none focus:border-[#4B9C93] focus:bg-white"
                    />
                  </div>

                  {/* Photo Upload with Notice & Consent */}
                  <div className="space-y-1.5 p-3 rounded-xl border border-dashed border-[#4B9C93]/60 bg-[#E6F7F3]/30">
                    <label className="block text-xs font-bold text-[#1F2937]">
                      Applicant Profile Photo *
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />

                    <div className="flex items-center gap-3">
                      {photoPreview ? (
                        <div className="relative">
                          <img
                            src={photoPreview}
                            alt="Applicant preview"
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#009689]"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-400 text-xs font-bold">
                          Photo
                        </div>
                      )}

                      <div className="flex-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          id="admin-upload-photo-btn"
                          className="px-3 py-1.5 rounded-lg border border-[#009689] text-[#009689] hover:bg-[#009689] hover:text-white transition text-xs font-bold cursor-pointer"
                        >
                          {photoFile ? "Change Photo" : "Upload Photo"}
                        </button>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                          {photoFile ? photoFile.name : "JPEG, PNG, or WebP (max 5MB)"}
                        </span>
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="mt-2 p-2.5 bg-amber-50/90 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
                      <span className="font-bold">Public Profile Icon Notice:</span>{" "}
                      This photo is intended to be publicly visible as your
                      administrator profile icon if you are approved as an admin.
                    </div>

                    {/* Mandatory Consent Checkbox */}
                    <label className="flex items-start gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={photoConsent}
                        onChange={(e) => setPhotoConsent(e.target.checked)}
                        id="admin-photo-consent-checkbox"
                        className="mt-0.5 rounded border-gray-300 text-[#009689] focus:ring-[#009689]"
                      />
                      <span className="text-xs text-gray-800 font-medium leading-snug">
                        I consent to my uploaded photo being used publicly as my
                        administrator profile icon upon approval. *
                      </span>
                    </label>
                  </div>

                  {/* Optional Note Field */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#1F2937]">
                      Application Notes <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add any relevant qualifications, role scope, or background context..."
                      className="w-full p-2.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] text-xs text-[#1F2937] placeholder:text-[#4A5565]/70 focus:outline-none focus:border-[#4B9C93] focus:bg-white resize-none"
                    />
                  </div>

                  {adminAppError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 p-2 rounded-lg font-medium">
                      {adminAppError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submittingAdminApp || !photoConsent}
                      id="admin-submit-app-btn"
                      className="w-full h-[46px] rounded-xl bg-[#009689] hover:bg-[#007e73] active:scale-[0.99] text-white font-bold text-base shadow-sm transition-all cursor-pointer flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submittingAdminApp
                        ? "Submitting Application..."
                        : "Submit Admin Application"}
                    </button>
                    <p className="text-[11px] text-gray-500 text-center mt-1.5">
                      Submission logs a request for review. It does not grant access
                      immediately.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /*         PRESERVED STUDENT & COMPANY SIGNUP FLOW          */
          /* ======================================================== */
          <div>
            {/* Card Title & Subtitle */}
            <div className="text-center mb-4">
              <h2 className="text-3xl sm:text-[32px] font-bold text-gray-900">
                Sign up
              </h2>
              <p className="text-sm sm:text-base text-[#4A5565]/80 font-medium mt-0.5">
                Create your account
              </p>
            </div>

            {/* Form Inputs Grid */}
            <form onSubmit={handleSignup} className="space-y-3.5">
              {activeRole === "student" ? (
                <>
                  {/* Student Field 1: Name */}
                  <div className="space-y-1">
                    <label htmlFor="student-name-input" className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                      Full Name *
                    </label>
                    <div className="flex items-center h-[42px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                      <svg
                        className="w-4 h-4 text-[#4A5565] shrink-0 opacity-80"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M12.6672 14V12.6667C12.6672 11.9594 12.3862 11.2811 11.886 10.781C11.3859 10.281 10.7075 10 10.0002 10H5.99974C5.29241 10 4.61406 10.281 4.1139 10.781C3.61375 11.2811 3.33276 11.9594 3.33276 12.6667V14M10.6669 4.66667C10.6669 6.13943 9.47289 7.33333 7.99996 7.33333C6.52704 7.33333 5.33299 6.13943 5.33299 4.66667C5.33299 3.19391 6.52704 2 7.99996 2C9.47289 2 10.6669 3.19391 10.6669 4.66667Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <input
                        type="text"
                        required
                        id="student-name-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Tara Joshi"
                        className="w-full bg-transparent pl-2.5 text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Student Field 2: Email & Send OTP */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="student-email-input" className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                        Email Address *
                      </label>
                      {studentEmailVerified && (
                        <span id="student-email-verified-badge" className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          ✓ Email Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center h-[42px] px-2.5 sm:px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all gap-2">
                      <svg
                        className="w-4 h-4 text-[#4A5565] shrink-0 opacity-80"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M14.6672 4.66704L8.67268 8.48465C8.46926 8.60278 8.23821 8.66501 8.00296 8.66501C7.76772 8.66501 7.53666 8.60278 7.33324 8.48465L1.33276 4.66704M14.6672 4.66704V4.00044C14.6672 3.26413 14.0702 2.66724 13.3337 2.66724H2.6662C1.92977 2.66724 1.33276 3.26413 1.33276 4.00044V4.66704M14.6672 4.66704V11.9996C14.6672 12.7359 14.0702 13.3328 13.3337 13.3328H2.6662C1.92977 13.3328 1.33276 12.7359 1.33276 11.9996V4.66704"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <input
                        type="email"
                        required
                        id="student-email-input"
                        value={email}
                        onChange={(e) => handleStudentEmailChange(e.target.value)}
                        placeholder="you@university.edu"
                        className="flex-1 bg-transparent text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none min-w-0"
                      />
                      {!studentEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendStudentOtp}
                          disabled={studentOtpSending || studentOtpCountdown > 0 || !email.trim()}
                          id="student-send-otp-btn"
                          className="h-[30px] px-2.5 sm:px-3 rounded-md bg-[#009689] hover:bg-[#007e73] active:scale-[0.98] text-white text-[11px] sm:text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-all"
                        >
                          {studentOtpSending
                            ? "Sending..."
                            : studentOtpCountdown > 0
                            ? `Resend (${studentOtpCountdown}s)`
                            : studentOtpSent
                            ? "Resend OTP"
                            : "Send OTP"}
                        </button>
                      )}
                    </div>
                    {studentOtpMsg && (
                      <p className="text-[11px] sm:text-xs text-emerald-600 font-medium">
                        {studentOtpMsg}
                      </p>
                    )}
                    {studentOtpError && (
                      <p className="text-[11px] sm:text-xs text-red-500 font-medium">
                        {studentOtpError}
                      </p>
                    )}
                  </div>

                  {/* Student OTP Verification Input Box */}
                  {studentOtpSent && !studentEmailVerified && (
                    <div className="bg-[#F4F9F8] border border-[#CDE5E1] p-3 rounded-xl space-y-2 transition-all">
                      <div className="flex items-center justify-between">
                        <label htmlFor="student-otp-input" className="block text-xs font-semibold text-[#1F2937]">
                          Enter 6-Digit Verification Code *
                        </label>
                        <span className="text-[11px] text-[#4A5565]">
                          OTP valid for 10m
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          pattern="[0-9]*"
                          inputMode="numeric"
                          value={studentOtp}
                          onChange={(e) =>
                            setStudentOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                          }
                          placeholder="••••••"
                          id="student-otp-input"
                          className="h-[40px] px-3 rounded-lg border border-[#DADADA] bg-white text-center font-mono font-bold text-base tracking-widest text-[#1F2937] focus:outline-none focus:border-[#4B9C93] flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyStudentOtp}
                          disabled={studentOtpVerifying || studentOtp.trim().length !== 6}
                          id="student-verify-otp-btn"
                          className="h-[40px] px-4 rounded-lg bg-[#009689] hover:bg-[#007e73] active:scale-[0.98] text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-all"
                        >
                          {studentOtpVerifying ? "Verifying..." : "Verify Code"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Student Field 3: Phone Number with Country Code */}
                  <div className="space-y-1">
                    <label htmlFor="student-phone-input" className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                      Phone Number *
                    </label>
                    <div className="flex items-center gap-2">
                      {/* Visually separate Country Code Selector */}
                      <div className="w-[110px] sm:w-[130px] h-[42px] px-2 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all flex items-center shrink-0">
                        <select
                          id="student-country-code"
                          aria-label="Country Code"
                          value={studentCountryCode}
                          onChange={(e) => setStudentCountryCode(e.target.value)}
                          className="w-full bg-transparent text-xs sm:text-sm font-semibold text-[#1F2937] focus:outline-none cursor-pointer"
                        >
                          {COUNTRY_CODES.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Phone Input */}
                      <div className="flex-1 flex items-center h-[42px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all min-w-0">
                        <svg
                          className="w-4 h-4 text-[#4A5565] shrink-0 opacity-80"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M9.2214 11.0458C9.35909 11.109 9.51422 11.1235 9.66122 11.0867C9.80823 11.05 9.93834 10.9643 10.0301 10.8438L10.2668 10.5337C10.391 10.3681 10.5521 10.2337 10.7372 10.1411C10.9224 10.0486 11.1266 10.0004 11.3336 10.0004H13.3337C13.6874 10.0004 14.0265 10.1409 14.2766 10.3909C14.5267 10.641 14.6672 10.9802 14.6672 11.3338V13.334C14.6672 13.6876 14.5267 14.0268 14.2766 14.2769C14.0265 14.5269 13.6874 14.6674 13.3337 14.6674C10.1509 14.6674 7.09838 13.403 4.84776 11.1524C2.59715 8.90179 1.33276 5.8493 1.33276 2.66645C1.33276 2.3128 1.47325 1.97363 1.72332 1.72356C1.97339 1.47349 2.31255 1.33301 2.6662 1.33301H4.66636C5.02001 1.33301 5.35918 1.47349 5.60925 1.72356C5.85932 1.97363 5.9998 2.3128 5.9998 2.66645V4.66661C5.9998 4.87362 5.95161 5.07779 5.85903 5.26294C5.76645 5.4481 5.63204 5.60915 5.46643 5.73336L5.1544 5.96738C5.032 6.06084 4.94573 6.19379 4.91024 6.34364C4.87476 6.4935 4.89224 6.65102 4.95972 6.78944C5.87091 8.64017 7.36953 10.1369 9.2214 11.0458Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                        </svg>
                        <input
                          type="tel"
                          required
                          id="student-phone-input"
                          value={studentPhone}
                          onChange={(e) => setStudentPhone(e.target.value)}
                          placeholder="98765 43210"
                          className="w-full bg-transparent pl-2 text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Student Field 4 & 5: College & Graduation Year (2-column grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="student-college-input" className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                        College / University *
                      </label>
                      <div className="flex items-center h-[42px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                        <input
                          type="text"
                          required
                          id="student-college-input"
                          value={studentCollege}
                          onChange={(e) => setStudentCollege(e.target.value)}
                          placeholder="e.g. National Institute of Tech"
                          className="w-full bg-transparent text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="student-grad-year-input" className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                        Graduation Year *
                      </label>
                      <div className="flex items-center h-[42px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                        <input
                          type="number"
                          required
                          min={2020}
                          max={2035}
                          id="student-grad-year-input"
                          value={studentGraduationYear}
                          onChange={(e) => setStudentGraduationYear(e.target.value)}
                          placeholder="e.g. 2026"
                          className="w-full bg-transparent text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Student Field 6: College ID / Roll Number */}
                  <div className="space-y-1">
                    <label htmlFor="student-college-id-input" className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                      College ID / Roll Number *
                    </label>
                    <div className="flex items-center h-[42px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                      <input
                        type="text"
                        required
                        id="student-college-id-input"
                        value={studentCollegeId}
                        onChange={(e) => setStudentCollegeId(e.target.value)}
                        placeholder="e.g. UNI-2022-CS-042"
                        className="w-full bg-transparent text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Student Field 7: College ID Document Upload Control */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                        College ID Proof <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <span className="text-[11px] text-[#4A5565]">JPG, PNG, PDF ≤ 5MB</span>
                    </div>

                    <input
                      type="file"
                      ref={studentFileInputRef}
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleStudentCollegeIdSelect}
                      className="hidden"
                      id="student-college-id-file-input"
                    />

                    {!studentCollegeIdFile ? (
                      <div
                        onClick={() => studentFileInputRef.current?.click()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            studentFileInputRef.current?.click();
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Upload College ID Document"
                        className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-[#DADADA] bg-[#F9FAFB] hover:border-[#4B9C93] hover:bg-emerald-50/20 cursor-pointer transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#009689] shrink-0">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div className="text-left min-w-0">
                          <p className="text-xs font-semibold text-[#1F2937]">Upload student ID card proof</p>
                          <p className="text-[11px] text-[#4A5565]">Attach proof for verified badge</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/30">
                        {studentCollegeIdPreview ? (
                          <img
                            src={studentCollegeIdPreview}
                            alt="ID Preview"
                            className="w-10 h-10 object-cover rounded border border-emerald-300 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
                            PDF
                          </div>
                        )}
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-xs font-bold text-[#1F2937] truncate">
                            {studentCollegeIdFile.name}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            {(studentCollegeIdFile.size / 1024).toFixed(1)} KB •{" "}
                            <span className="text-emerald-700 font-semibold">Attached</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveStudentCollegeId}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded cursor-pointer shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {studentFileError && (
                      <p className="text-xs text-red-500 font-medium">{studentFileError}</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Field 1: Name */}
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                      {config.nameLabel}
                    </label>
                    <div className="flex items-center h-[42px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                      <svg
                        className="w-4 h-4 text-[#4A5565] shrink-0 opacity-80"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12.6672 14V12.6667C12.6672 11.9594 12.3862 11.2811 11.886 10.781C11.3859 10.281 10.7075 10 10.0002 10H5.99974C5.29241 10 4.61406 10.281 4.1139 10.781C3.61375 11.2811 3.33276 11.9594 3.33276 12.6667V14M10.6669 4.66667C10.6669 6.13943 9.47289 7.33333 7.99996 7.33333C6.52704 7.33333 5.33299 6.13943 5.33299 4.66667C5.33299 3.19391 6.52704 2 7.99996 2C9.47289 2 10.6669 3.19391 10.6669 4.66667Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={config.namePlaceholder}
                        className="w-full bg-transparent pl-2.5 text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Field 2: Email */}
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                      {config.emailLabel}
                    </label>
                    <div className="flex items-center h-[42px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                      <svg
                        className="w-4 h-4 text-[#4A5565] shrink-0 opacity-80"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.6672 4.66704L8.67268 8.48465C8.46926 8.60278 8.23821 8.66501 8.00296 8.66501C7.76772 8.66501 7.53666 8.60278 7.33324 8.48465L1.33276 4.66704M14.6672 4.66704V4.00044C14.6672 3.26413 14.0702 2.66724 13.3337 2.66724H2.6662C1.92977 2.66724 1.33276 3.26413 1.33276 4.00044V4.66704M14.6672 4.66704V11.9996C14.6672 12.7359 14.0702 13.3328 13.3337 13.3328H2.6662C1.92977 13.3328 1.33276 12.7359 1.33276 11.9996V4.66704"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={config.emailPlaceholder}
                        className="w-full bg-transparent pl-2.5 text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Field 3: Phone Number */}
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                      Phone Number
                    </label>
                    <div className="flex items-center h-[42px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                      <svg
                        className="w-4 h-4 text-[#4A5565] shrink-0 opacity-80"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.2214 11.0458C9.35909 11.109 9.51422 11.1235 9.66122 11.0867C9.80823 11.05 9.93834 10.9643 10.0301 10.8438L10.2668 10.5337C10.391 10.3681 10.5521 10.2337 10.7372 10.1411C10.9224 10.0486 11.1266 10.0004 11.3336 10.0004H13.3337C13.6874 10.0004 14.0265 10.1409 14.2766 10.3909C14.5267 10.641 14.6672 10.9802 14.6672 11.3338V13.334C14.6672 13.6876 14.5267 14.0268 14.2766 14.2769C14.0265 14.5269 13.6874 14.6674 13.3337 14.6674C10.1509 14.6674 7.09838 13.403 4.84776 11.1524C2.59715 8.90179 1.33276 5.8493 1.33276 2.66645C1.33276 2.3128 1.47325 1.97363 1.72332 1.72356C1.97339 1.47349 2.31255 1.33301 2.6662 1.33301H4.66636C5.02001 1.33301 5.35918 1.47349 5.60925 1.72356C5.85932 1.97363 5.9998 2.3128 5.9998 2.66645V4.66661C5.9998 4.87362 5.95161 5.07779 5.85903 5.26294C5.76645 5.4481 5.63204 5.60915 5.46643 5.73336L5.1544 5.96738C5.032 6.06084 4.94573 6.19379 4.91024 6.34364C4.87476 6.4935 4.89224 6.65102 4.95972 6.78944C5.87091 8.64017 7.36953 10.1369 9.2214 11.0458Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-transparent pl-2.5 text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  {config.hasWebsite && (
                    <div className="space-y-1">
                      <label className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                        Website Link
                      </label>
                      <div className="flex items-center h-[42px] px-3.5 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder={config.websitePlaceholder}
                          className="w-full bg-transparent pl-2.5 text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

            

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                    Password
                  </label>
                  <div className="flex items-center h-[42px] px-3 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                    <svg
                      className="w-3.5 h-3.5 text-[#4A5565] shrink-0 opacity-80"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.66667 7.33324V4.66636C4.66667 3.78224 5.01786 2.93432 5.64298 2.30915C6.2681 1.68398 7.11595 1.33276 8 1.33276C8.88406 1.33276 9.7319 1.68398 10.357 2.30915C10.9821 2.93432 11.3333 3.78224 11.3333 4.66636V7.33324M4.66667 7.33324H3.33333C2.59695 7.33324 2 7.93025 2 8.66668V13.3337C2 14.0702 2.59695 14.6672 3.33333 14.6672H12.6667C13.403 14.6672 14 14.0702 14 13.3337V8.66668C14 7.93025 13.403 7.33324 12.6667 7.33324H11.3333M4.66667 7.33324H11.3333"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent pl-2 pr-1.5 text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                      className="p-1 rounded text-[#4A5565] hover:text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#4B9C93] shrink-0 transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-semibold text-[#1F2937]">
                    Confirm Password
                  </label>
                  <div className="flex items-center h-[42px] px-3 rounded-lg border border-[#DADADA] bg-[#F9FAFB] focus-within:border-[#4B9C93] focus-within:bg-white transition-all">
                    <svg
                      className="w-3.5 h-3.5 text-[#4A5565] shrink-0 opacity-80"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.66667 7.33324V4.66636C4.66667 3.78224 5.01786 2.93432 5.64298 2.30915C6.2681 1.68398 7.11595 1.33276 8 1.33276C8.88406 1.33276 9.7319 1.68398 10.357 2.30915C10.9821 2.93432 11.3333 3.78224 11.3333 4.66636V7.33324M4.66667 7.33324H3.33333C2.59695 7.33324 2 7.93025 2 8.66668V13.3337C2 14.0702 2.59695 14.6672 3.33333 14.6672H12.6667C13.403 14.6672 14 14.0702 14 13.3337V8.66668C14 7.93025 13.403 7.33324 12.6667 7.33324H11.3333M4.66667 7.33324H11.3333"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent pl-2 pr-1.5 text-xs sm:text-sm text-[#1F2937] placeholder:text-[#4A5565]/80 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                      className="p-1 rounded text-[#4A5565] hover:text-[#1F2937] focus:outline-none focus:ring-1 focus:ring-[#4B9C93] shrink-0 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              {/* Submit Sign Up Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  id="signup-submit-btn"
                  className="w-full h-[46px] rounded-xl bg-[#009689] hover:bg-[#007e73] active:scale-[0.99] text-white font-bold text-base shadow-sm transition-all cursor-pointer flex items-center justify-center disabled:opacity-70"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
                {activeRole === "student" && !studentEmailVerified && (
                  <p className="text-[11px] text-amber-700 text-center mt-1.5 font-medium">
                    * Please verify your email with OTP before creating your account
                  </p>
                )}
              </div>
            </form>

            {/* Divider (Preserved for Student and Company only) */}
            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#D1D5DC]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#6A7282] font-normal">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google SSO Button (Preserved for Student and Company only) */}
            <button
              type="button"
              onClick={() => router.push(config.dashboardRoute)}
              className="w-full h-[46px] rounded-xl border border-[#D1D5DC] bg-white hover:bg-gray-50 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.99993 3.95833C11.4749 3.95833 12.6499 4.47083 13.4541 4.9L16.0291 2.325C14.5333 0.8875 12.4208 0 9.99993 0C6.09993 0 2.6666 2.35 1.0166 5.77917L4.18743 8.24583C5.0541 5.47083 7.3166 3.95833 9.99993 3.95833Z"
                  fill="#4285F4"
                />
                <path
                  d="M19.2083 10.2084C19.2083 9.52508 19.1458 8.86675 19.025 8.22925H10V11.9792H15.1833C14.9583 13.1334 14.275 14.1126 13.2458 14.7709L16.2583 17.1126C18.325 15.4709 19.2083 13.0542 19.2083 10.2084Z"
                  fill="#34A853"
                />
                <path
                  d="M4.1875 11.9958C3.71667 10.5917 3.71667 8.99168 4.1875 7.58752L1.01667 5.12085C0.358333 7.02918 0 8.57085 0 10.2083C0 11.8458 0.358333 13.3875 1.01667 14.8792L4.1875 12.4125V11.9958Z"
                  fill="#FBBC05"
                />
                <path
                  d="M9.99993 19.9999C12.6999 19.9999 14.9708 19.1124 16.6374 17.5499L13.6249 15.2082C12.7874 15.7707 11.7124 16.1041 9.99993 16.1041C7.3166 16.1041 5.0541 14.5916 4.18743 12.6499L1.0166 15.1166C2.6666 17.6499 6.09993 19.9999 9.99993 19.9999Z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm font-medium text-[#005F5A]">
                Sign in with Google
              </span>
            </button>
          </div>
        )}

        {/* Bottom Toggle Link to Login */}
        <div className="text-center pt-3">
          <Link
            href={`/login?role=${activeRole}`}
            className="text-sm text-[#009689] hover:underline"
          >
            <span className="font-medium text-[#009689]">
              Already have an account?{" "}
            </span>
            <span className="font-bold text-[#009689]">Log in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={<div className="text-[#4B9C93] font-bold p-8">Loading...</div>}
    >
      <SignupFormContent />
    </Suspense>
  );
}
