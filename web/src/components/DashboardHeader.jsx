"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Bell,
  PlusCircle,
  ShieldCheck,
  Menu,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Rocket,
  CheckCircle2,
  ExternalLink,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { notificationService, authService, tokenStorage } from "@/services/apiClient";
import { getUserRole, useAuth } from "@/hooks/useAuth";

export default function DashboardHeader({
  title,
  subtitle,
}) {
  const pathname = usePathname() || "";
  const { toggleSidebar } = useSidebar();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [planToast, setPlanToast] = useState("");
  const { user, authResolved, hasSession } = useAuth();

  useEffect(() => {
    let isMounted = true;
    notificationService.list().then((res) => {
      if (isMounted && res && Array.isArray(res)) {
        setNotifications(uniqueNotifications(res));
      }
    }).catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handlePlanClick = () => {
    setPlanToast("currently not avalable");
    setTimeout(() => setPlanToast(""), 3000);
  };

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((previous) => markNotificationsRead(previous));
    notificationService.markRead();
  };

  // Handle role sign-out and session cleanup, redirecting to public landing page (/)
  const handleLogout = async () => {
    setShowProfileMenu(false);
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
      tokenStorage.clearTokens();
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
      }
    }
    window.location.href = "/";
  };

  // Redirect unauthenticated sessions away from protected routes (e.g. after logout or on browser Back)
  useEffect(() => {
    if (authResolved && !hasSession) {
      const isProtected =
        pathname.startsWith("/admin") ||
        pathname.startsWith("/company") ||
        pathname.startsWith("/college") ||
        pathname.startsWith("/student") ||
        pathname === "/profile" ||
        pathname === "/settings";

      if (isProtected) {
        window.location.replace("/login");
      }
    }
  }, [authResolved, hasSession, pathname]);

  const routeRole = pathname.startsWith("/company")
    ? "company"
    : pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/college")
    ? "college"
    : pathname.startsWith("/student")
    ? "student"
    : null;
  const userRole = getUserRole(user);
  const role = authResolved && !hasSession
    ? "guest"
    : userRole || routeRole;

  const displayTitle =
    title ||
    (role == null
      ? ""
      : role === "guest"
      ? "Explore Opportunities"
      : role === "company"
      ? (user?.companyProfile?.companyName ? `Welcome back, ${user.companyProfile.companyName}` : (user?.name ? `Welcome back, ${user.name}` : "Welcome back"))
      : role === "admin"
      ? "Admin Command Center"
      : role === "college"
      ? (user?.collegeProfile?.collegeName ? `Welcome back, ${user.collegeProfile.collegeName}` : (user?.name ? `Welcome back, ${user.name}` : "Welcome back"))
      : (user?.name ? `Welcome back, ${user.name}` : "Welcome back"));

  const displaySubtitle =
    subtitle !== undefined
      ? subtitle
      : role == null
      ? null
      : role === "guest"
      ? "Browse verified tech internships, peer projects, and student innovators"
      : role === "company"
      ? "Track applicant pipelines and discover top campus engineers"
      : role === "admin"
      ? "System-wide handles, moderation queue, and network metrics"
      : "Here's how your profile is performing this week";

  return (
    <header
      id="dashboard-header"
      className="sticky top-0 z-[60] px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b border-gray-100 bg-[#F7F9F9]/85 backdrop-blur-md shrink-0"
    >
      {/* ──── Left: Hamburger Button + Greeting ──── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          id="mobile-sidebar-toggle-btn"
          className="md:hidden p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer shadow-2xs shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 pr-1">
          <h1 className="text-sm sm:text-xl font-bold text-gray-900 leading-tight truncate">
            {displayTitle}
          </h1>
          {displaySubtitle && (
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5 line-clamp-1 truncate">
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>

      {/* ──── Right: Action Controls ──── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {role == null ? null : role === "guest" ? (
          <>
            <Link
              href="/login"
              id="header-guest-login-btn"
              className="px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold text-[#4B9C93] border border-[#4B9C93] hover:bg-[#4B9C93]/5 transition-colors cursor-pointer whitespace-nowrap"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              id="header-guest-signup-btn"
              className="px-2.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold text-white bg-[#4B9C93] hover:bg-[#3d867e] shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              Sign Up
            </Link>
          </>
        ) : role === "company" ? (
          <>
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                id="header-notification-btn"
                aria-label="Notifications"
                className="relative w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="font-bold text-sm text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-[#4B9C93] hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    <NotificationList
                      notifications={notifications}
                      variant="popover"
                      onMarkRead={handleMarkRead}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Company Avatar & Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                id="header-avatar-btn"
                aria-label="Company Profile Menu"
                className="w-9 h-9 rounded-full bg-[#1F2937] text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-gray-700/30 transition-all shadow-xs"
              >
                {user?.companyProfile?.companyName
                  ? user.companyProfile.companyName.charAt(0).toUpperCase()
                  : user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "CO"}
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-11 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                  {/* User Info Header */}
                  <div className="p-3 bg-gray-50 rounded-xl mb-1.5">
                    <div className="font-bold text-xs text-gray-900 truncate">
                      {user?.companyProfile?.companyName || user?.name || "Company Account"}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {user?.email || "Account Active"}
                    </div>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-full">
                      <Building2 className="w-2.5 h-2.5" />
                      Company Account
                    </span>
                  </div>

                  {/* Menu Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/company/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <span>Help & Support</span>
                    </Link>
                  </div>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    id="header-logout-btn"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : role === "admin" ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Active Node
            </span>
            {/* Interactive Admin Avatar & Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                id="header-avatar-btn"
                aria-label="Admin Profile Menu"
                className="w-9 h-9 rounded-full bg-[#A10C00] text-white flex items-center justify-center text-xs font-bold cursor-pointer hover:ring-2 hover:ring-red-700/30 transition-all shadow-xs"
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "AD"}
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-11 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                  {/* User Info Header */}
                  <div className="p-3 bg-gray-50 rounded-xl mb-1.5">
                    <div className="font-bold text-xs text-gray-900 truncate">
                      {user?.name || "Admin User"}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {user?.email || "Account Active"}
                    </div>
                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Admin Node Active
                    </span>
                  </div>

                  {/* Menu Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      <span>Admin Dashboard</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <span>Help & Support</span>
                    </Link>
                  </div>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    id="header-logout-btn"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Default: Student Role */
          <>
            {/* Free Plan Badge - displays toast on click */}
            <button
              type="button"
              onClick={handlePlanClick}
              id="header-plan-badge"
              className="inline-flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-[#4B9C93] bg-[#E6F7F3] hover:bg-[#d8f3ec] border border-[#4B9C93]/20 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Rocket className="w-3 h-3 text-[#4B9C93]" />
              <span>Free Plan</span>
            </button>

            {/* Wishlist Button */}
            <Link
              href="/student/internships?tab=saved"
              id="header-wishlist-btn"
              aria-label="View saved internships wishlist"
              title="Saved Internships"
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-[#4B9C93] transition-colors cursor-pointer group"
            >
              <Heart className="w-4 h-4 transition-transform group-hover:scale-110" />
            </Link>

            {/* Interactive Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                id="header-notification-btn"
                aria-label="View notifications"
                className="relative w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 top-11 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500 text-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-[#4B9C93] hover:underline cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    <NotificationList
                      notifications={notifications}
                      variant="dropdown"
                      onMarkRead={handleMarkRead}
                    />
                  </div>

                  <div className="pt-2 text-center border-t border-gray-100 mt-1">
                    <Link
                      href="/student/chats"
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-semibold text-[#4B9C93] hover:underline"
                    >
                      View all activity
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive User Avatar & Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setShowProfileMenu((prev) => !prev)}
                id="header-avatar-btn"
                aria-label="User Profile Menu"
                className="w-9 h-9 rounded-full bg-[#4B9C93] text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-[#4B9C93]/30 transition-all shadow-xs overflow-hidden"
              >
                {user?.profileIcon ? (
                  <img
                    src={user.profileIcon}
                    alt={user?.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : role === "admin" ? (
                  "A"
                ) : role === "company" ? (
                  "C"
                ) : role === "college" ? (
                  "U"
                ) : (
                  "S"
                )}
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-11 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50">
                  {/* User Info Header */}
                  <div className="p-3 bg-gray-50 rounded-xl mb-1.5">
                    <div className="font-bold text-xs text-gray-900 truncate">
                      {user?.name || (role === "admin" ? "Admin User" : role === "company" ? "Company Account" : role === "college" ? "College Account" : "Student Profile")}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {user?.email || "Account Active"}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        handlePlanClick();
                      }}
                      className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#4B9C93] bg-[#E6F7F3] hover:bg-[#d8f3ec] px-2 py-0.5 rounded-full cursor-pointer transition-colors"
                    >
                      <Rocket className="w-2.5 h-2.5" />
                      Free Plan Active
                    </button>
                  </div>

                  {/* Menu Links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      href="/help"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                      <span>Help & Support</span>
                    </Link>
                  </div>

                  <div className="my-1 border-t border-gray-100" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    id="header-logout-btn"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Plan Status Toast */}
      {planToast && (
        <div className="fixed top-16 right-6 sm:right-10 z-50 px-4 text-xs font-bold rounded-2xl  animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
          
        </div>
      )}
    </header>
  );
}
