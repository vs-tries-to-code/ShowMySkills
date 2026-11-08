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
  Building2,
  GraduationCap,
  Award,
} from "lucide-react";

/**
 * Global navigation configurations by role
 */
export const navigationConfig = {
  guest: {
    top: [
      { label: "Internships", href: "/internships", icon: Briefcase },
      { label: "People", href: "/people", icon: Users },
      { label: "Launchpad", href: "/launchpad", icon: Rocket },
    ],
    bottom: [
      { label: "About Us", href: "/about", icon: Info },
      { label: "Help & Support", href: "/help", icon: HelpCircle },
    ],
  },
  student: {
    top: [
      { label: "Internships", href: "/student/internships", icon: Briefcase },
      { label: "Applications", href: "/student/applications", icon: FileText },
      { label: "People", href: "/student/people", icon: Users },
      { label: "Chats", href: "/student/chats", icon: MessageSquare },
      { label: "Launchpad", href: "/student/launchpad", icon: Rocket },
    ],
    bottom: [
      { label: "Profile", href: "/profile", icon: User },
      { label: "About Us", href: "/about", icon: Info },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Help & Support", href: "/help", icon: HelpCircle },
    ],
  },
  company: {
    top: [
      { label: "Dashboard", href: "/company/dashboard", icon: LayoutDashboard },
      { label: "Manage Internships", href: "/company/internships", icon: Briefcase },
      { label: "Applications", href: "/company/applications", icon: FileText },
      { label: "People", href: "/company/people", icon: Users },
      { label: "Chats", href: "/company/chats", icon: MessageSquare },
    ],
    bottom: [
      { label: "Company Profile", href: "/company/profile", icon: Building2 },
      { label: "About Us", href: "/about", icon: Info },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Help & Support", href: "/help", icon: HelpCircle },
    ],
  },
  college: {
    top: [
      { label: "Dashboard", href: "/college/dashboard", icon: LayoutDashboard },
      { label: "Students", href: "/college/students", icon: GraduationCap },
      { label: "Internships", href: "/internships", icon: Briefcase },
      { label: "Chats", href: "/student/chats", icon: MessageSquare },
    ],
    bottom: [
      { label: "College Profile", href: "/college/profile", icon: Building2 },
      { label: "About Us", href: "/about", icon: Info },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Help & Support", href: "/help", icon: HelpCircle },
    ],
  },
  admin: {
    top: [
      { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Users & Handles", href: "/admin/users", icon: Users },
      { label: "Internships", href: "/admin/internships", icon: Briefcase },
      { label: "Verifications", href: "/admin/verifications", icon: CheckCircle },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
    bottom: [
      { label: "About Us", href: "/about", icon: Info },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
};
