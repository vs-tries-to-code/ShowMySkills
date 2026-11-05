"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  MessageSquare,
  Rocket,
  User,
  Settings,
  HelpCircle,
  Info,
  FileText,
  CheckCircle,
  BarChart3,
  X,
  GraduationCap,
  Building2,
  Award,
} from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { getUserRole, useAuth } from "@/hooks/useAuth";

/**
 * DashboardSidebar — Dynamic multi-role sidebar for ShowMySkills.
 * Features responsive mobile drawer animation and role-specific navigation.
 */
export default function DashboardSidebar() {
  const pathname = usePathname() || "";
  const { isOpen, closeSidebar } = useSidebar();
  const { user, authResolved, hasSession } = useAuth();

  // Determine current active role from route path
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

  // Top navigation items per role
  let topNavItems = [];
  let bottomNavItems = [];

  if (role === "guest") {
    topNavItems = [
      { label: "Internships", href: "/internships", icon: Briefcase },
      { label: "People", href: "/people", icon: Users },
      { label: "Launchpad", href: "/launchpad", icon: Rocket },
    ];
    bottomNavItems = [
      { label: "About Us", href: "/about", icon: Info },
      { label: "Help & Support", href: "/help", icon: HelpCircle },
    ];
  } else if (role === "company") {
    topNavItems = [
      { label: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
      { label: "Manage Internships", href: "/company/internships", icon: Briefcase },
      { label: "Applications", href: "/company/applications", icon: FileText },
      { label: "People", href: "/company/people", icon: Users },
      { label: "Chats", href: "/company/chats", icon: MessageSquare },
    ];
    bottomNavItems = [
      { label: "Company Profile", href: "/company/profile", icon: Building2 },
      { label: "About Us", href: "/about", icon: Info },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Help & Support", href: "/help", icon: HelpCircle },
    ];
  } else if (role === "college") {
    topNavItems = [
      { label: "Dashboard", href: "/college/dashboard", icon: LayoutDashboard },
      { label: "Students", href: "/college/students", icon: GraduationCap },
      { label: "Internships", href: "/internships", icon: Briefcase },
      { label: "Chats", href: "/student/chats", icon: MessageSquare },
    ];
    bottomNavItems = [
      { label: "College Profile", href: "/college/profile", icon: Building2 },
      { label: "About Us", href: "/about", icon: Info },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Help & Support", href: "/help", icon: HelpCircle },
    ];
  } else if (role === "admin") {
    topNavItems = [
      { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users & Handles", href: "/admin/users", icon: Users },
      { label: "Internships", href: "/admin/internships", icon: Briefcase },
      { label: "Verifications", href: "/admin/verifications", icon: CheckCircle },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ];
    bottomNavItems = [
      { label: "About Us", href: "/about", icon: Info },
      { label: "Settings", href: "/settings", icon: Settings },
    ];
  } else if (role === "student") {
    // Default: Student Portal
    topNavItems = [
      { label: "Internships", href: "/student/internships", icon: Briefcase },
      { label: "Applications", href: "/student/applications", icon: FileText },
      { label: "People", href: "/student/people", icon: Users },
      { label: "Chats", href: "/student/chats", icon: MessageSquare },
      { label: "Launchpad", href: "/student/launchpad", icon: Rocket },
    ];
    bottomNavItems = [
      { label: "Profile", href: "/profile", icon: User },
      { label: "About Us", href: "/about", icon: Info },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Help & Support", href: "/help", icon: HelpCircle },
    ];
  }

  const isActive = (href) => {
    if (href === "/internships") {
      return pathname === "/internships" || pathname === "/guest/internships";
    }
    if (href === "/people") {
      return pathname === "/people" || pathname === "/guest/people";
    }
    if (href === "/launchpad") {
      return pathname === "/launchpad" || pathname === "/guest/launchpad";
    }
    if (href === "/student/internships") {
      return (
        pathname === "/student/internships" ||
        pathname === "/student/dashboard" ||
        pathname === "/dashboard"
      );
    }
    if (href === "/student/people") {
      return pathname === "/student/people";
    }
    if (href === "/student/launchpad") {
      return pathname === "/student/launchpad";
    }
    return pathname === href || pathname?.startsWith(href);
  };

  return (
    <>
      {/* ──── Mobile Backdrop Blur Overlay ──── */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-2xs z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* ──── Main Animated Sidebar ──── */}
      <aside
        id="dashboard-sidebar"
        className={`fixed left-0 top-0 bottom-0 w-[240px] sm:w-[250px] md:w-[220px] bg-[#4B9C93] flex flex-col justify-between z-50 overflow-hidden py-4 px-3 shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ borderTopRightRadius: "24px", borderBottomRightRadius: "24px" }}
      >
        {/* Mobile Close Button */}
        <button
          onClick={closeSidebar}
          aria-label="Close sidebar"
          className="md:hidden absolute top-3 right-3 text-white/80 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ──── Logo & Brand Name Stacked ──── */}
        <Link
          href="/"
          onClick={closeSidebar}
          className="flex flex-col items-center text-center group pt-1 pb-3"
        >
          <img
            src="/logo.png"
            alt="ShowMySkills Logo"
            className="h-14 sm:h-16 md:h-20 w-auto my-2"
          />
          <span className="text-2xl font-extrabold text-white tracking-tight leading-tight">
            ShowMySkills
          </span>
          {role && role !== "student" && (
            <span className="mt-1 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-white/20 text-white">
              {role}
            </span>
          )}
        </Link>

        {/* ──── Top Navigation ──── */}
        <nav className="flex-1 flex flex-col justify-between overflow-hidden">
          <ul className="space-y-0.5">
            {topNavItems.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={closeSidebar}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      active
                        ? "bg-white text-[#4B9C93] shadow-sm font-semibold"
                        : "text-white/90 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ──── Role-Specific Middle Action Card ──── */}
          {role === "guest" ? (
            <div className="my-2 bg-white rounded-xl p-3 shadow-md shadow-black/5 text-center">
      
              <h4 className="text-xs font-bold text-gray-900 mb-0.5">
                Join ShowMySkills
              </h4>
              <p className="text-[10px] text-gray-500 leading-tight mb-2">
                Sign in to apply to internships and save wishlist items
              </p>
              <Link
                href="/signup"
                onClick={closeSidebar}
                id="sidebar-guest-join-btn"
                className="block w-full py-1.5 rounded-full bg-[#4B9C93] text-white text-[11px] font-semibold hover:bg-[#3d867e] transition-colors cursor-pointer text-center"
              >
                Sign Up / Log In
              </Link>
            </div>
          ) : role === "company" ? null : role === "college" ? (
            <div className="my-2 bg-white rounded-xl p-3 shadow-md shadow-black/5 text-center">
              <div className="h-6 w-6 rounded-full bg-[#4B9C93]/10 flex items-center justify-center mx-auto mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#4B9C93]" />
              </div>
              <h4 className="text-xs font-bold text-gray-900 mb-0.5">
                Placement Cell
              </h4>
              <p className="text-[10px] text-gray-500 leading-tight mb-2">
                Track student placements and verified credentials
              </p>
              <Link
                href="/college/students"
                onClick={closeSidebar}
                id="sidebar-college-students-btn"
                className="block w-full py-1.5 rounded-full bg-[#4B9C93] text-white text-[11px] font-semibold hover:bg-[#3d867e] transition-colors cursor-pointer text-center"
              >
                View Students
              </Link>
            </div>
          ) : role === "admin" ? (
            <div className="my-2 bg-white/15 rounded-xl p-3 text-center border border-white/20">
              <p className="text-[11px] font-bold text-white mb-0.5">
                Platform Master
              </p>
              <p className="text-[9.5px] text-white/80 leading-tight">
                All handles & verifications operational
              </p>
            </div>
          ) : null}

          {/* ──── Bottom Navigation ──── */}
          <ul className="space-y-0.5">
            {bottomNavItems.map(({ label, href, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={label}>
                  <Link
                    href={href}
                    onClick={closeSidebar}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                      active
                        ? "bg-white text-[#4B9C93] shadow-sm font-semibold"
                        : "text-white/90 hover:bg-white/15 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
