"use client";

import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ProfileHeader from "@/features/profile/ProfileHeader";
import CompletionBanner from "@/features/profile/CompletionBanner";
import ReputationCard from "@/features/profile/ReputationCard";
import AboutCard from "@/features/profile/AboutCard";
import SkillsCard from "@/features/profile/SkillsCard";
import ProjectsCard from "@/features/profile/ProjectsCard";
import { authService } from "@/services/apiClient";

function formatProfileData(u) {
  if (!u) return null;
  return {
    name: u.name || "Student Candidate",
    tag: u.roleTag || "Student",
    verified: Boolean(u.emailVerified || u.collegeIdVerified || u.verified),
    title: u.headline || u.title || "Student Developer",
    college: u.college || "",
    location: u.location || "",
    openToWorkMessage: u.openToWorkMessage || "Open to internships and full-time opportunities",
    avatarUrl: u.profileIcon || u.avatarUrl || null,
    primarySkills: Array.isArray(u.primarySkills) && u.primarySkills.length > 0
      ? u.primarySkills
      : Array.isArray(u.skills)
      ? u.skills.map((s) => (typeof s === "string" ? s : s.name))
      : [],
    completionPercentage: u.completionPercentage || 0,
    reputationScore: u.reputationScore ?? 0,
    reputationMax: 100,
    topPercentile: u.topPercentile || "Student Engineer",
    metrics: u.metrics || [],
    aboutText: u.bio || u.aboutText || "",
    skillsList: Array.isArray(u.skills) && u.skills.length > 0
      ? u.skills.map((s) => (typeof s === "string" ? { name: s, level: "advanced" } : s))
      : [],
    projectsList: Array.isArray(u.projects) && u.projects.length > 0
      ? u.projects
      : [],
  };
}

/**
 * StudentProfilePage — Fetches live student profile from MongoDB via API.
 */
export default function StudentProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      try {
        const user = await authService.getCurrentUser();
        if (isMounted && user) {
          setData(formatProfileData(user));
        }
      } catch (err) {
        console.error("Failed to load profile from database:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9F9] flex">
      {/* ──── Left Sidebar ──── */}
      <DashboardSidebar />

      {/* ──── Main Content Area ──── */}
      <div className="flex-1 md:ml-[220px] ml-0 flex flex-col min-h-screen">
        {/* ──── Top Header Bar ──── */}
        <DashboardHeader />

        {/* ──── Scrollable Content ──── */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
          <div className="max-w-[900px] mx-auto space-y-5">
            {loading ? (
              <div className="space-y-4">
                <div className="h-44 bg-white rounded-2xl animate-pulse border border-gray-100" />
                <div className="h-16 bg-white rounded-2xl animate-pulse border border-gray-100" />
                <div className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100" />
              </div>
            ) : data ? (
              <>
                {/* Profile Identity Card */}
                <ProfileHeader data={data} />

                {/* Profile Completion Progress */}
                <CompletionBanner percentage={data.completionPercentage} />

                {/* Skill Reputation Score */}
                <ReputationCard data={data} />

                {/* About */}
                <AboutCard text={data.aboutText} />

                {/* Skills */}
                <SkillsCard skills={data.skillsList} />

                {/* Projects */}
                <ProjectsCard projects={data.projectsList} />
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
                No profile found in database.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
