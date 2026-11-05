"use client";

import Link from "next/link";
import {
  Users,
  Award,
  Code2,
  CheckCircle2,
  Target,
  ArrowRight,
} from "lucide-react";
import {
  getUserDashboardPath,
  getUserInternshipsPath,
  useAuth,
} from "@/hooks/useAuth";

export default function AboutPage() {
  const { user, authResolved, hasSession } = useAuth();
  const accountPath = getUserDashboardPath(user);
  const internshipsPath = getUserInternshipsPath(user);

  return (
    <div className="min-h-screen bg-[#4B9C93] flex flex-col font-sans selection:text-white">
      {/* ──── Top Public Header Bar ──── */}
      <header className="w-full px-6 sm:px-12 py-5 flex items-center justify-end z-20">
        {/* Right-aligned Navigation Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href={hasSession ? accountPath : "/"}
            className="text-white/90 hover:text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
          >
            {hasSession ? "My Dashboard" : "Home"}
          </Link>
          <Link
            href={internshipsPath}
            className="text-white/90 hover:text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Internships
          </Link>
          <Link
            href="/people"
            className="text-white/90 hover:text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
          >
            People
          </Link>
          <Link
            href="/launchpad"
            className="text-white/90 hover:text-white px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Launchpad
          </Link>
          {authResolved && (
            <Link
              href={hasSession ? accountPath : "/login"}
              className="ml-1 sm:ml-2 px-5 py-2 rounded-full bg-white text-[#0F172A] hover:bg-[#F7F9F9] active:scale-95 text-xs sm:text-sm font-semibold shadow-xs transition-all"
            >
              {hasSession ? "My Account" : "Sign In"}
            </Link>
          )}
        </nav>
      </header>

      {/* ──── Hero Section (Teal Background) ──── */}
      <section className="w-full max-w-4xl mx-auto px-6 pt-8 pb-20 sm:pt-14 sm:pb-28 flex flex-col items-center text-center">
        {/* Large Logo */}
        <div className="mb-6 transition-transform hover:scale-105 duration-300">
          <img
            src="/logo.png"
            alt="ShowMySkills Emblem"
            className="w-24 h-24 sm:w-32 sm:h-32 object-contain"

          />
        </div>

        {/* Heading 1 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
          ShowMySkills
        </h1>

        {/* Lead Paragraph */}
        <p className="mt-5 text-base sm:text-lg md:text-xl text-white/95 max-w-2xl leading-relaxed font-normal">
          Empowering the next generation of creators, developers, and innovators
          to showcase their talents and connect with opportunities.
        </p>
      </section>

      {/* ──── Section 1: Our Mission ──── */}
      <section className="bg-white rounded-t-[44px] sm:rounded-t-[64px] -mt-10 sm:-mt-12 relative z-10 py-16 sm:py-24 px-6 sm:px-12 lg:px-20 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Mission Left Text */}
          <div className="flex flex-col items-start">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101828] tracking-tight">
              Our Mission
            </h2>
            <p className="mt-5 text-base sm:text-lg text-[#4A5565] leading-relaxed">
              We believe that talent deserves recognition. ShowMySkills is
              designed to bridge the gap between skilled individuals and those
              seeking their expertise. Whether you&apos;re a developer, designer,
              writer, or any other creative professional, our platform gives you
              the tools to shine.
            </p>

            {/* Mission Tag / Value Highlight */}
            <div className="mt-8 inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full bg-[#E6F7F3] border border-[#4B9C93]/30 text-[#0D9488] font-semibold text-sm sm:text-base shadow-xs">
              <Target className="w-5 h-5 text-[#0D9488] shrink-0" />
              <span>Connecting talent with opportunity</span>
            </div>
          </div>

          {/* Mission Right Illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#4B9C93]/20 to-[#00BBA7]/20 rounded-3xl blur-md group-hover:blur-lg transition-all" />
              <img
                src="/About.png"
                alt="Innovation and skill discovery"
                className="relative w-full max-w-[440px] h-auto object-cover rounded-2xl shadow-md border border-slate-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section 2: What Makes Us Different ──── */}
      <section className="bg-[#F9FAFB] py-16 sm:py-24 px-6 sm:px-12 lg:px-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101828] tracking-tight">
              What Makes Us Different
            </h2>
            <p className="mt-3 text-[#4A5565] text-sm sm:text-base">
              A peer-validated ecosystem designed from the ground up for
              transparency and merit.
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 sm:mt-16">
            {/* Card 1: Community Driven */}
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#CBFBF1] text-[#0D9488] flex items-center justify-center mb-5 shrink-0">
                <Users className="w-8 h-8" strokeWidth={2.2} />
              </div>
              <h3 className="text-xl font-bold text-[#101828]">
                Community Driven
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#4A5565] leading-relaxed">
                Built by creators, for creators. Our platform thrives on
                community interaction and peer recognition.
              </p>
            </div>

            {/* Card 2: Merit-Based Ranking */}
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#FFEDD4] text-[#F54900] flex items-center justify-center mb-5 shrink-0">
                <Award className="w-8 h-8" strokeWidth={2.2} />
              </div>
              <h3 className="text-xl font-bold text-[#101828]">
                Merit-Based Ranking
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#4A5565] leading-relaxed">
                Our star rating system ensures that quality work gets the
                recognition it deserves through authentic peer reviews.
              </p>
            </div>

            {/* Card 3: Skill Showcase */}
            <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#DBEAFE] text-[#155DFC] flex items-center justify-center mb-5 shrink-0">
                <Code2 className="w-8 h-8" strokeWidth={2.2} />
              </div>
              <h3 className="text-xl font-bold text-[#101828]">
                Skill Showcase
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[#4A5565] leading-relaxed">
                Create detailed portfolios that highlight your skills, projects,
                and achievements in an engaging format.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section 3: How It Works ──── */}
      <section className="bg-white py-16 sm:py-24 px-6 sm:px-12 lg:px-20 border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101828] tracking-tight">
              How It Works
            </h2>
            <p className="mt-3 text-[#4A5565] text-sm sm:text-base">
              Four streamlined steps to spotlight your verified skills and
              accelerate your career.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#00BBA7] text-white font-bold text-lg flex items-center justify-center shadow-xs mb-4 shrink-0">
                1
              </div>
              <h3 className="text-lg font-bold text-[#101828]">
                Create Profile
              </h3>
              <p className="mt-2 text-sm text-[#4A5565] leading-relaxed">
                Sign up and build your professional profile with skills and
                projects.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#00BBA7] text-white font-bold text-lg flex items-center justify-center shadow-xs mb-4 shrink-0">
                2
              </div>
              <h3 className="text-lg font-bold text-[#101828]">
                Showcase Work
              </h3>
              <p className="mt-2 text-sm text-[#4A5565] leading-relaxed">
                Upload your best projects and describe your skills in detail.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#00BBA7] text-white font-bold text-lg flex items-center justify-center shadow-xs mb-4 shrink-0">
                3
              </div>
              <h3 className="text-lg font-bold text-[#101828]">
                Get Discovered
              </h3>
              <p className="mt-2 text-sm text-[#4A5565] leading-relaxed">
                Chat with peers and get starred by the community.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-[#00BBA7] text-white font-bold text-lg flex items-center justify-center shadow-xs mb-4 shrink-0">
                4
              </div>
              <h3 className="text-lg font-bold text-[#101828]">
                Build Network
              </h3>
              <p className="mt-2 text-sm text-[#4A5565] leading-relaxed">
                Grow your professional network and unlock new opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section 4: Our Values ──── */}
      <section className="bg-[#F0FDFA] py-16 sm:py-24 px-6 sm:px-12 lg:px-20 border-b border-[#CCFBF1]">
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101828] tracking-tight">
              Our Values
            </h2>
            <p className="mt-3 text-[#4A5565] text-sm sm:text-base">
              The foundational principles guiding everything we build.
            </p>
          </div>

          {/* 2x2 Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 sm:mt-16">
            {/* Value 1 */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#101828]">
                  Authenticity
                </h3>
                <p className="mt-1 text-sm text-[#4A5565] leading-relaxed">
                  We believe in genuine talent recognition and authentic peer
                  reviews.
                </p>
              </div>
            </div>

            {/* Value 2 */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#101828]">
                  Inclusivity
                </h3>
                <p className="mt-1 text-sm text-[#4A5565] leading-relaxed">
                  Every skill and talent deserves a platform to shine, regardless
                  of background.
                </p>
              </div>
            </div>

            {/* Value 3 */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#101828]">
                  Innovation
                </h3>
                <p className="mt-1 text-sm text-[#4A5565] leading-relaxed">
                  We continuously evolve our platform to better serve our
                  community.
                </p>
              </div>
            </div>

            {/* Value 4 */}
            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/60 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#E6F7F3] text-[#0D9488] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-[#0D9488]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#101828]">Growth</h3>
                <p className="mt-1 text-sm text-[#4A5565] leading-relaxed">
                  We support continuous learning and professional development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Section 5: Powered by XyphX ──── */}
      <section className="bg-white py-16 sm:py-24 px-6 sm:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#101828] tracking-tight">
              Powered by <span className="text-[#9810FA]">XyphX</span>
            </h2>
            <p className="mt-3 text-[#4A5565] text-sm sm:text-base">
              Meet the visionary company behind ShowMySkills
            </p>
          </div>

          {/* Big Featured Container */}
          <div className="mt-12 sm:mt-16 bg-[#F7F9F9] border border-slate-200/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              {/* Left Column: XyphX Story */}
              <div className="flex flex-col items-start">
                <div className="w-24 h-24 rounded-2xl bg-black flex items-center justify-center p-3 shadow-md mb-6">
                  <img
                    src="/XyphXlogo.png"
                    alt="XyphX Logo"
                    className="w-20 h-20 object-contain"
                  />
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-[#101828] leading-tight">
                  Transforming Vision into Reality
                </h3>

                <p className="mt-4 text-sm sm:text-base text-[#364153] leading-relaxed">
                  XyphX is a budding, service-based tech company with a bold
                  ambition — to transform into a revolutionary tech product
                  powerhouse. We&apos;re building technology-driven solutions
                  that are smart, futuristic, and ready to redefine industries.
                </p>

                <p className="mt-3 text-sm sm:text-base text-[#364153] leading-relaxed">
                  Our journey began with a vision to bridge the gap between
                  current technology and the vast, untapped potential of digital
                  innovation. Today, we stand at the forefront of progress,
                  crafting solutions that not only meet today&apos;s demands but
                  are designed with tomorrow in mind.
                </p>

                <a
                  href="https://xyphx.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#101828] hover:bg-black text-white font-semibold text-sm transition-all shadow-md group active:scale-95"
                >
                  <span>Visit XyphX</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              {/* Right Column: 2x2 Matrix & Values Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-md">
                <div className="grid grid-cols-2 gap-4">
                  {/* Tech Innovation */}
                  <div className="bg-[#FAF5FF] border border-purple-100 rounded-xl p-5 text-center flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
                    <span className="text-2xl sm:text-3xl font-bold text-[#9810FA]">
                      Tech
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#4A5565] mt-1">
                      Innovation
                    </span>
                  </div>

                  {/* Future Ready */}
                  <div className="bg-[#EFF6FF] border border-blue-100 rounded-xl p-5 text-center flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
                    <span className="text-2xl sm:text-3xl font-bold text-[#155DFC]">
                      Future
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#4A5565] mt-1">
                      Ready
                    </span>
                  </div>

                  {/* Smart Solutions */}
                  <div className="bg-[#F0FDF4] border border-emerald-100 rounded-xl p-5 text-center flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
                    <span className="text-2xl sm:text-3xl font-bold text-[#00A63E]">
                      Smart
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#4A5565] mt-1">
                      Solutions
                    </span>
                  </div>

                  {/* Bold Vision */}
                  <div className="bg-[#FFF7ED] border border-orange-100 rounded-xl p-5 text-center flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
                    <span className="text-2xl sm:text-3xl font-bold text-[#F54900]">
                      Bold
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-[#4A5565] mt-1">
                      Vision
                    </span>
                  </div>
                </div>

                {/* Tagline & Dots */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center flex flex-col items-center">
                  <p className="text-xs sm:text-sm text-[#6A7282] font-medium">
                    Building the future, one innovation at a time
                  </p>
                  <div className="flex items-center gap-2 mt-3">
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
      <footer className="bg-white border-t border-gray-100 py-10 px-6 sm:px-12 text-center mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <Link href="/" className="inline-block group mb-3">
            <img
              src="/logo.png"
              alt="ShowMySkills"
              className="w-8 h-8 object-contain transition-transform group-hover:scale-110"
            />
          </Link>

          <p className="text-xs sm:text-sm text-[#4A5565]">
            © 2025 ShowMySkills. Empowering creators worldwide.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs font-medium text-gray-500">
            <Link href="/" className="hover:text-[#4B9C93] transition-colors">
              Home
            </Link>
            <span>•</span>
            <Link
              href={internshipsPath}
              className="hover:text-[#4B9C93] transition-colors"
            >
              Internships
            </Link>
            <span>•</span>
            <Link
              href="/student/people"
              className="hover:text-[#4B9C93] transition-colors"
            >
              People
            </Link>
            <span>•</span>
            <Link
              href="/student/launchpad"
              className="hover:text-[#4B9C93] transition-colors"
            >
              Launchpad
            </Link>
            <span>•</span>
            {authResolved && (
              <Link
                href={hasSession ? accountPath : "/login"}
                className="hover:text-[#4B9C93] transition-colors"
              >
                {hasSession ? "My Account" : "Sign In"}
              </Link>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
