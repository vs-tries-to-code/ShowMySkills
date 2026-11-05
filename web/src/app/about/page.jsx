"use client";

import Link from "next/link";
import {
  Users,
  Briefcase,
  Search,
  Building2,
  MessageSquare,
  Globe2,
  CheckCircle2,
  Target,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Rocket,
  GraduationCap,
  Code2,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#4B9C93] flex flex-col font-sans selection:text-white">
      {/* ──── Top Public Header Bar ──── */}
      <header className="w-full px-4 sm:px-8 md:px-12 py-4 sm:py-5 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="ShowMySkills Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
          />
          <span className="text-white font-bold text-lg sm:text-xl tracking-tight">
            ShowMySkills
          </span>
        </Link>

        {/* Responsive Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-3 flex-wrap justify-end">
          <Link
            href="/"
            className="text-white/90 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/internships"
            className="text-white/90 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Internships
          </Link>
          <Link
            href="/people"
            className="text-white/90 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
          >
            People
          </Link>
          <Link
            href="/launchpad"
            className="text-white/90 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors hidden xs:inline-block"
          >
            Launchpad
          </Link>
          <Link
            href="/login"
            className="ml-1 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-white text-[#0F172A] hover:bg-[#F7F9F9] active:scale-95 text-xs sm:text-sm font-semibold shadow-xs transition-all whitespace-nowrap"
          >
            Sign In
          </Link>
        </nav>
      </header>

      {/* ──── Hero Section (Teal Background) ──── */}
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-16 sm:pt-12 sm:pb-24 flex flex-col items-center text-center">
        {/* Large Logo */}
        <div className="mb-4 sm:mb-6 transition-transform hover:scale-105 duration-300">
          <img
            src="/logo.png"
            alt="ShowMySkills Emblem"
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain"
          />
        </div>


        {/* Heading 1 */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
          Empowering Talent. Connecting Opportunities. Building Futures.
        </h1>

        {/* Lead Paragraph */}
        <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-white/95 max-w-2xl leading-relaxed font-normal">
          ShowMySkills is an open platform that brings students, developers, creators, and companies together in one ecosystem. Build your professional identity, showcase what you can do, discover internship opportunities, and connect directly with people who share your ambitions.
        </p>

        <p className="mt-2 text-xs sm:text-sm md:text-base text-white/85 max-w-2xl leading-relaxed">
          Whether you&apos;re looking for your first internship, searching for talented individuals, or building your professional presence, ShowMySkills gives you a place to start.
        </p>

        {/* CTA Buttons in Hero */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mt-6 sm:mt-8">
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-full bg-white text-[#0F172A] hover:bg-[#F8FAFC] text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95"
          >
            Create Your Profile
          </Link>
          <Link
            href="/internships"
            className="px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold border border-white/25 backdrop-blur-xs transition-all"
          >
            Explore Internships
          </Link>
        </div>
      </section>

      {/* ──── Section 1: Our Mission ──── */}
      <section className="bg-white rounded-t-[36px] sm:rounded-t-[60px] -mt-8 sm:-mt-10 relative z-10 py-12 sm:py-20 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          {/* Mission Left Text */}
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F3] text-[#0D9488] text-xs font-bold uppercase tracking-wider mb-3">
              Our Mission
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#101828] tracking-tight leading-snug">
              Making Talent Visible. Making Opportunities Accessible.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-[#4A5565] leading-relaxed">
              We believe everyone deserves an opportunity to demonstrate their abilities, regardless of their background, college, or experience.
            </p>
            <p className="mt-3 text-sm sm:text-base text-[#4A5565] leading-relaxed">
              Traditional opportunities often depend on where you study, who you know, or how much experience you already have. We want to change that.
            </p>
            <p className="mt-3 text-sm sm:text-base text-[#4A5565] leading-relaxed">
              ShowMySkills aims to bridge the gap between talent and opportunity by creating an open ecosystem where students can showcase their skills, companies can discover emerging talent, and individuals can connect, collaborate, and grow.
            </p>

            {/* Mission Tag / Value Highlight */}
            <div className="mt-6 inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#E6F7F3] border border-[#4B9C93]/30 text-[#0D9488] font-semibold text-xs sm:text-sm shadow-xs">
              <Target className="w-4 h-4 text-[#0D9488] shrink-0" />
              <span>Make skills visible and opportunities accessible to everyone.</span>
            </div>
          </div>

          {/* Mission Right Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group w-full max-w-[420px]">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#4B9C93]/20 to-[#00BBA7]/20 rounded-3xl blur-md group-hover:blur-lg transition-all" />
              <img
                src="/About.png"
                alt="ShowMySkills Talent Discovery"
                className="relative w-full h-auto object-cover rounded-2xl shadow-md border border-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section 2: What Makes Us Different ──── */}
      <section className="bg-[#F9FAFB] py-12 sm:py-20 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0D9488] text-xs font-bold uppercase tracking-wider mb-2">
              What Makes Us Different
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#101828] tracking-tight">
              More Than a Portfolio. An Ecosystem for Growth.
            </h2>
            <p className="mt-2 text-[#4A5565] text-xs sm:text-sm md:text-base">
              A comprehensive platform built for students, developers, and organizations alike.
            </p>
          </div>

          {/* 6 Capabilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-8 sm:mt-12">
            {/* Card 1: Professional Profiles */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center mb-4 shrink-0">
                <GraduationCap className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">
                Professional Profiles
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4A5565] leading-relaxed">
                Build your digital professional identity. Showcase technical skills, projects, experience, achievements, and interests through a profile that truly represents what you can do.
              </p>
            </div>

            {/* Card 2: Internship Opportunities */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center mb-4 shrink-0">
                <Briefcase className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">
                Internship Opportunities
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4A5565] leading-relaxed">
                Discover verified internship listings and explore opportunities from external sources. Find roles matching your interests and apply directly through the platform.
              </p>
            </div>

            {/* Card 3: Talent Discovery */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-4 shrink-0">
                <Search className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">
                Talent Discovery
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4A5565] leading-relaxed">
                Companies can explore student profiles, discover emerging talent, identify prospective candidates, and find people with the exact skills they need.
              </p>
            </div>

            {/* Card 4: Company Internship Management */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#FCE7F3] text-[#BE185D] flex items-center justify-center mb-4 shrink-0">
                <Building2 className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">
                Company Internship Management
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4A5565] leading-relaxed">
                Organizations can create company profiles, publish internship openings, receive student applications, and manage their recruitment pipeline end-to-end.
              </p>
            </div>

            {/* Card 5: Student Community & Messaging */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mb-4 shrink-0">
                <MessageSquare className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">
                Student Community & Messaging
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4A5565] leading-relaxed">
                Discover fellow peers, explore their projects, exchange ideas, and communicate directly through our built-in real-time messaging system.
              </p>
            </div>

            {/* Card 6: Open Opportunity Ecosystem */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] text-[#6D28D9] flex items-center justify-center mb-4 shrink-0">
                <Globe2 className="w-6 h-6" strokeWidth={2.2} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#101828]">
                Open Opportunity Ecosystem
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#4A5565] leading-relaxed">
                We bring students, companies, and opportunities together in one accessible platform, creating more transparent pathways for talent to get noticed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section 3: Built for Everyone (Three Audiences) ──── */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F3] text-[#0D9488] text-xs font-bold uppercase tracking-wider mb-2">
              Built for Everyone
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#101828] tracking-tight">
              One Platform. Multiple Possibilities.
            </h2>
            <p className="mt-2 text-[#4A5565] text-xs sm:text-sm md:text-base">
              Designed specifically for the goals of every stakeholder in the ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
            {/* For Students */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488] bg-[#CCFBF1] px-2.5 py-1 rounded-full">
                  For Students
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#101828] mt-4">
                  Build Your Identity & Find Internships
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#4A5565] leading-relaxed">
                  Your skills deserve to be seen. Build your portfolio, discover verified internships, apply for opportunities, and connect with fellow student engineers.
                </p>
              </div>
              <Link
                href="/signup/student"
                className="mt-6 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#4B9C93] hover:underline"
              >
                <span>Join as a Student</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* For Creators & Developers */}
            <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9333EA] bg-[#F3E8FF] px-2.5 py-1 rounded-full">
                  For Community
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-[#101828] mt-4">
                  Connect, Share & Grow Together
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-[#4A5565] leading-relaxed">
                  Showcase your projects, demonstrate your technical capabilities, and build your professional network within an active, open peer community.
                </p>
              </div>
              <Link
                href="/people"
                className="mt-6 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#9333EA] hover:underline"
              >
                <span>Explore the Community</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section 4: How It Works ──── */}
      <section className="bg-[#F9FAFB] py-12 sm:py-20 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F3] text-[#0D9488] text-xs font-bold uppercase tracking-wider mb-2">
              How It Works
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#101828] tracking-tight">
              Everything You Need to Move Forward.
            </h2>
            <p className="mt-2 text-[#4A5565] text-xs sm:text-sm md:text-base">
              A transparent path from building your profile to landing opportunities.
            </p>
          </div>

          {/* 5 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {/* Step 01 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col items-center text-center">
              <span className="text-xs font-extrabold text-[#0D9488] bg-[#CCFBF1] px-2.5 py-1 rounded-full mb-3">
                01
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                Create Your Profile
              </h3>
              <p className="mt-1.5 text-xs text-[#4A5565] leading-relaxed">
                Build your professional identity with your skills, projects, experience, and achievements.
              </p>
            </div>

            {/* Step 02 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col items-center text-center">
              <span className="text-xs font-extrabold text-[#0D9488] bg-[#CCFBF1] px-2.5 py-1 rounded-full mb-3">
                02
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                Showcase Your Talent
              </h3>
              <p className="mt-1.5 text-xs text-[#4A5565] leading-relaxed">
                Make your work visible. Let your projects, knowledge, and capabilities speak for themselves.
              </p>
            </div>

            {/* Step 03 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col items-center text-center">
              <span className="text-xs font-extrabold text-[#0D9488] bg-[#CCFBF1] px-2.5 py-1 rounded-full mb-3">
                03
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                Discover Opportunities
              </h3>
              <p className="mt-1.5 text-xs text-[#4A5565] leading-relaxed">
                Explore verified and curated internships, find relevant roles, and apply directly.
              </p>
            </div>

            {/* Step 04 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col items-center text-center">
              <span className="text-xs font-extrabold text-[#0D9488] bg-[#CCFBF1] px-2.5 py-1 rounded-full mb-3">
                04
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                Connect & Communicate
              </h3>
              <p className="mt-1.5 text-xs text-[#4A5565] leading-relaxed">
                Discover talented people, interact with the community, and message peers directly.
              </p>
            </div>

            {/* Step 05 */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs flex flex-col items-center text-center sm:col-span-2 lg:col-span-1">
              <span className="text-xs font-extrabold text-[#0D9488] bg-[#CCFBF1] px-2.5 py-1 rounded-full mb-3">
                05
              </span>
              <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                Get Discovered
              </h3>
              <p className="mt-1.5 text-xs text-[#4A5565] leading-relaxed">
                Make your profile accessible to companies actively looking for emerging campus talent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section 5: Our Values ──── */}
      <section className="bg-white py-12 sm:py-20 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E6F7F3] text-[#0D9488] text-xs font-bold uppercase tracking-wider mb-2">
              Our Values
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#101828] tracking-tight">
              The Principles Behind ShowMySkills.
            </h2>
            <p className="mt-2 text-[#4A5565] text-xs sm:text-sm md:text-base">
              The foundational convictions guiding everything we build.
            </p>
          </div>

          {/* 5 Values List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 mt-8 sm:mt-12">
            {/* Value 1: Accessibility */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-100 bg-[#F8FAFC]">
              <div className="w-9 h-9 rounded-full bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                  Accessibility
                </h3>
                <p className="mt-1 text-xs text-[#4A5565] leading-relaxed">
                  Opportunities and talent discovery should be accessible to everyone, regardless of their background.
                </p>
              </div>
            </div>

            {/* Value 2: Transparency */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-100 bg-[#F8FAFC]">
              <div className="w-9 h-9 rounded-full bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                  Transparency
                </h3>
                <p className="mt-1 text-xs text-[#4A5565] leading-relaxed">
                  We strive to create a clear and open environment for discovering opportunities and showcasing verified talent.
                </p>
              </div>
            </div>

            {/* Value 3: Community */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-100 bg-[#F8FAFC]">
              <div className="w-9 h-9 rounded-full bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                  Community
                </h3>
                <p className="mt-1 text-xs text-[#4A5565] leading-relaxed">
                  We believe people grow faster when they share knowledge, communicate openly, and support each other.
                </p>
              </div>
            </div>

            {/* Value 4: Innovation */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-100 bg-[#F8FAFC]">
              <div className="w-9 h-9 rounded-full bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                  Innovation
                </h3>
                <p className="mt-1 text-xs text-[#4A5565] leading-relaxed">
                  We continuously explore better ways to connect people, skills, and opportunities through modern technology.
                </p>
              </div>
            </div>

            {/* Value 5: Growth */}
            <div className="flex items-start gap-3.5 p-4 rounded-xl border border-gray-100 bg-[#F8FAFC] sm:col-span-2 md:col-span-1">
              <div className="w-9 h-9 rounded-full bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#101828]">
                  Growth
                </h3>
                <p className="mt-1 text-xs text-[#4A5565] leading-relaxed">
                  We encourage continuous learning, hands-on experimentation, and meaningful professional development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section 6: Powered by XyphX ──── */}
      <section className="bg-[#F7F9F9] py-12 sm:py-20 px-4 sm:px-8 md:px-12 lg:px-20 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E8FF] text-[#9810FA] text-xs font-bold uppercase tracking-wider mb-2">
              Parent Company
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#101828] tracking-tight">
              Powered by <span className="text-[#9810FA]">XyphX</span>
            </h2>
            <p className="mt-2 text-[#4A5565] text-xs sm:text-sm md:text-base">
              Built with Vision. Driven by Innovation.
            </p>
          </div>

          {/* Big Featured Container */}
          <div className="mt-8 sm:mt-12 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-8 lg:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              {/* Left Column: XyphX Story */}
              <div className="flex flex-col items-start">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-black flex items-center justify-center p-3 shadow-md mb-5">
                  <img
                    src="/XyphXlogo.png"
                    alt="XyphX Logo"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                  />
                </div>

                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#101828] leading-tight">
                  Building Products That Move People Forward
                </h3>

                <p className="mt-3.5 text-xs sm:text-sm md:text-base text-[#364153] leading-relaxed">
                  ShowMySkills is a product of <strong>XyphX</strong>, a technology company focused on building innovative digital products and engineering solutions.
                </p>

                <p className="mt-2.5 text-xs sm:text-sm md:text-base text-[#364153] leading-relaxed">
                  At XyphX, we believe technology should solve real problems and create meaningful impact. ShowMySkills is one step towards that vision — building an ecosystem that makes talent more visible and opportunities more accessible.
                </p>

                <p className="mt-2.5 text-xs sm:text-sm md:text-base text-[#364153] leading-relaxed">
                  We don&apos;t just want to build another platform. We want to build something that helps people move forward.
                </p>

                <a
                  href="https://xyphx.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#101828] hover:bg-black text-white font-semibold text-xs sm:text-sm transition-all shadow-md group active:scale-95"
                >
                  <span>Explore XyphX</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              {/* Right Column: 2x2 Matrix & Values Card */}
              <div className="bg-[#F8FAFC] rounded-2xl p-5 sm:p-8 border border-gray-100 shadow-xs">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Tech Innovation */}
                  <div className="bg-[#FAF5FF] border border-purple-100 rounded-xl p-4 sm:p-5 text-center flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#9810FA]">
                      Tech
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#4A5565] mt-1">
                      Innovation
                    </span>
                  </div>

                  {/* Future Ready */}
                  <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-4 sm:p-5 text-center flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#155DFC]">
                      Future
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#4A5565] mt-1">
                      Ready
                    </span>
                  </div>

                  {/* Smart Solutions */}
                  <div className="bg-[#F0FDF4] border border-emerald-100 rounded-xl p-4 sm:p-5 text-center flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#00A63E]">
                      Smart
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#4A5565] mt-1">
                      Solutions
                    </span>
                  </div>

                  {/* Bold Vision */}
                  <div className="bg-[#FFF7ED] border border-orange-100 rounded-xl p-4 sm:p-5 text-center flex flex-col items-center justify-center">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#F54900]">
                      Bold
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#4A5565] mt-1">
                      Vision
                    </span>
                  </div>
                </div>

                {/* Tagline */}
                <div className="mt-6 pt-5 border-t border-gray-200 text-center flex flex-col items-center">
                  <p className="text-xs sm:text-sm text-[#6A7282] font-semibold">
                    Building the future, one innovation at a time.
                  </p>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#C27AFF]" />
                    <span className="w-2 h-2 rounded-full bg-[#51A2FF]" />
                    <span className="w-2 h-2 rounded-full bg-[#05DF72]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Footer ──── */}
      <footer className="bg-white border-t border-gray-100 py-10 px-4 sm:px-8 text-center mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <Link href="/" className="inline-block group mb-3">
            <img
              src="/logo.png"
              alt="ShowMySkills"
              className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
            />
          </Link>

          <p className="text-xs sm:text-sm text-[#4A5565]">
            © 2026 ShowMySkills. Built to empower talent and connect opportunities.
          </p>
          <p className="text-[11px] sm:text-xs text-[#6A7282] mt-1">
            A product of{" "}
            <a
              href="https://xyphx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4B9C93] hover:underline font-semibold"
            >
              XyphX
            </a>
            .
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-4 text-xs font-medium text-gray-500">
            <Link href="/" className="hover:text-[#4B9C93] transition-colors">
              Home
            </Link>
            <span>•</span>
            <Link href="/internships" className="hover:text-[#4B9C93] transition-colors">
              Internships
            </Link>
            <span>•</span>
            <Link href="/people" className="hover:text-[#4B9C93] transition-colors">
              People
            </Link>
            <span>•</span>
            <Link href="/launchpad" className="hover:text-[#4B9C93] transition-colors">
              Launchpad
            </Link>
            <span>•</span>
            <Link href="/login" className="hover:text-[#4B9C93] transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
