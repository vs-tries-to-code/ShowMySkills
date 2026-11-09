"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  Bell,
  Lock,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  Camera,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { authService, apiRequest, uploadService } from "@/services/apiClient";

const tabs = [
  { id: "profile", label: "Profile Info", icon: User },
  { id: "security", label: "Account & Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  // Profile Form state
  const [profile, setProfile] = useState({
    name: "",
    headline: "",
    college: "",
    department: "",
    gradYear: "",
    email: "",
    phone: "",
    bio: "",
    github: "",
    linkedin: "",
    profileIcon: "",
  });

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  const fileInputRef = useRef(null);

  const getInitials = (name) => {
    if (!name || !name.trim()) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then((user) => {
      if (isMounted && user) {
        setProfile((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          college: user.college || user.collegeProfile?.collegeName || "",
          department: user.branch || user.course || "",
          gradYear: user.graduationYear ? user.graduationYear.toString() : "",
          headline: user.headline || "",
          phone: user.phone || "",
          bio: user.bio || "",
          github: user.github || "",
          linkedin: user.linkedin || "",
          profileIcon: user.profileIcon || "",
        }));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Invalid file format. Only JPEG, PNG, WebP, and SVG images are allowed.");
      setAvatarSuccess("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("File size exceeds 5MB limit.");
      setAvatarSuccess("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setAvatarError("");
    setAvatarUploading(true);
    try {
      const res = await uploadService.uploadAvatar(file);
      const url = res?.data?.url || res?.url;
      if (url) {
        setProfile((prev) => ({ ...prev, profileIcon: url }));
        setAvatarSuccess("Profile photo updated successfully!");
        setTimeout(() => setAvatarSuccess(""), 3000);

        // Synchronize local storage user cache and dispatch events
        try {
          const rawUser = localStorage.getItem("user");
          if (rawUser) {
            const parsed = JSON.parse(rawUser);
            parsed.profileIcon = url;
            localStorage.setItem("user", JSON.stringify(parsed));
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new CustomEvent("user-updated", { detail: parsed }));
          }
        } catch {}
      } else {
        throw new Error("Upload did not return a valid URL");
      }
    } catch (err) {
      setAvatarError(err?.message || "Failed to upload profile photo");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarError("");
    setAvatarSuccess("");
    setAvatarUploading(true);
    try {
      await apiRequest("/auth/me", "PUT", { profileIcon: null });
      setProfile((prev) => ({ ...prev, profileIcon: "" }));
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          parsed.profileIcon = null;
          localStorage.setItem("user", JSON.stringify(parsed));
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("user-updated", { detail: parsed }));
        }
      } catch {}
      setAvatarSuccess("Profile photo removed.");
      setTimeout(() => setAvatarSuccess(""), 3000);
    } catch (err) {
      setAvatarError(err?.message || "Failed to remove photo");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Security Form state
  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirmPass: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  // Notification toggles
  const [notifs, setNotifs] = useState({
    applicationUpdates: true,
    recruiterMessages: true,
    weeklyInternshipsDigest: true,
    marketingEmails: false,
  });

  // Privacy toggles
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showScoresToRecruiters: true,
    allowDirectMessages: true,
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaved(true);
    try {
      await apiRequest("/auth/me", "PUT", profile);
      try {
        const rawUser = localStorage.getItem("user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          Object.assign(parsed, profile);
          localStorage.setItem("user", JSON.stringify(parsed));
          window.dispatchEvent(new Event("storage"));
          window.dispatchEvent(new CustomEvent("user-updated", { detail: parsed }));
        }
      } catch {}
    } catch {}
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex">
      <DashboardSidebar />

      <div className="flex-1 md:ml-[220px] ml-0 flex flex-col min-h-screen relative">
        <DashboardHeader
          title="Account Settings"
          subtitle="Manage your student profile preferences, security, and notification alerts"
        />

        <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full">
          {/* Settings Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200">
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all cursor-pointer ${
                    active
                      ? "bg-[#4B9C93] text-white shadow-xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Success Banner */}
          {saved && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-xs sm:text-sm font-semibold shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {/* Tab 1: Profile Info */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-gray-100">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleAvatarChange}
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="relative shrink-0">
                  <div
                    onClick={() => !avatarUploading && fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    aria-label="Change profile photo"
                    title={avatarUploading ? "Uploading photo..." : "Click to change photo"}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === " ") && !avatarUploading) {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden border-2 border-gray-100 shadow-xs relative transition-all ${
                      avatarUploading
                        ? "cursor-wait opacity-80"
                        : "cursor-pointer hover:ring-2 hover:ring-[#4B9C93]/40"
                    }`}
                  >
                    {profile.profileIcon ? (
                      <img
                        src={profile.profileIcon}
                        alt={profile.name || "Profile"}
                        className="w-full h-full object-cover"
                        onError={() => setProfile((prev) => ({ ...prev, profileIcon: "" }))}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#4B9C93] text-white flex items-center justify-center">
                        {getInitials(profile.name)}
                      </div>
                    )}

                    {avatarUploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => !avatarUploading && fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-white border border-gray-200 shadow-2xs hover:bg-gray-50 text-gray-600 hover:text-gray-900 cursor-pointer disabled:cursor-not-allowed transition-all"
                    title="Change Photo"
                    aria-label="Change Photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-base truncate">
                      {profile.name || "User Profile"}
                    </h3>
                    {profile.profileIcon && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={avatarUploading}
                        className="text-[11px] text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        title="Remove custom photo"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove photo</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{profile.college || "ShowMySkills Member"}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">JPEG, PNG, WebP or SVG under 5MB</p>

                  {avatarError && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{avatarError}</span>
                    </p>
                  )}
                  {avatarSuccess && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{avatarSuccess}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={profile.headline}
                    onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={profile.college}
                    onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Department & Degree
                  </label>
                  <input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Bio & Career Statement
                </label>
                <textarea
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#4B9C93]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={profile.github}
                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-[#4B9C93]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4B9C93] hover:bg-[#3d867e] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Account & Security */}
          {activeTab === "security" && (
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Password Management</h3>
                <p className="text-xs text-gray-500 mb-4">Update your password to keep your student account secure</p>
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Current Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwords.current}
                        onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                        className="w-full px-3.5 pr-10 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#4B9C93]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        title={showCurrentPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 p-1 rounded-md text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4B9C93] transition-colors cursor-pointer"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwords.newPass}
                        onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                        className="w-full px-3.5 pr-10 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#4B9C93]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                        title={showNewPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 p-1 rounded-md text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4B9C93] transition-colors cursor-pointer"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwords.confirmPass}
                        onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                        className="w-full px-3.5 pr-10 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-[#4B9C93]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 p-1 rounded-md text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#4B9C93] transition-colors cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Require an authentication code when signing in</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactor((prev) => !prev)}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                      twoFactor ? "bg-[#4B9C93]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        twoFactor ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4B9C93] hover:bg-[#3d867e] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Notifications */}
          {activeTab === "notifications" && (
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
              <h3 className="font-bold text-gray-900 text-base mb-2">Notification Preferences</h3>

              {[
                { key: "applicationUpdates", title: "Application Status Alerts", desc: "Get notified when an employer reviews, shortlists, or schedules an interview." },
                { key: "recruiterMessages", title: "Direct Chat Messages", desc: "Receive immediate notification when recruiters or peers message you." },
                { key: "weeklyInternshipsDigest", title: "Weekly Internships Digest", desc: "A curated weekly email of top internships matching your verified skills." },
                { key: "marketingEmails", title: "Platform Announcements", desc: "Updates about new platform features, hackathons, and webinars." },
              ].map(({ key, title, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-gray-800">{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifs({ ...notifs, [key]: !notifs[key] })}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                      notifs[key] ? "bg-[#4B9C93]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        notifs[key] ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4B9C93] hover:bg-[#3d867e] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 4: Privacy */}
          {activeTab === "privacy" && (
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
              <h3 className="font-bold text-gray-900 text-base mb-2">Privacy & Visibility</h3>

              {[
                { key: "publicProfile", title: "Public Talent Profile", desc: "Allow partner companies and peer developers to find your portfolio via search." },
                { key: "showScoresToRecruiters", title: "Display Verified Skill Scores", desc: "Show percentage scores and test results directly on your applications." },
                { key: "allowDirectMessages", title: "Allow Recruiter Inquiries", desc: "Permit approved tech companies to send interview requests directly." },
              ].map(({ key, title, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-gray-800">{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrivacy({ ...privacy, [key]: !privacy[key] })}
                    className={`w-12 h-6 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                      privacy[key] ? "bg-[#4B9C93]" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        privacy[key] ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-[#4B9C93] hover:bg-[#3d867e] text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Privacy</span>
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
