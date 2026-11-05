"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Zap, FileText, MessageCircle } from "lucide-react";

export default function LandingPage() {
  const [starCount, setStarCount] = useState(8);

  useEffect(() => {
    fetch("https://api.github.com/repos/xyphx/ShowMySkills-system")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stargazers_count != null) {
          setStarCount(data.stargazers_count);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-[#4B9C93] flex flex-col justify-between items-center p-6 pb-4 sm:pb-10 px-2.5 sm:px-6 md:px-12 overflow-x-hidden">
      {/* Top Navigation */}
      <nav className="flex w-full items-center justify-between px-1 sm:px-2 relative z-20 mb-2 sm:mb-2">
        {/* Left side: Logo on desktop, GitHub Star badge on mobile */}
        <div className="flex items-center">
          {/* Logo - visible on desktop/tablet */}
          <Link href="/" className="hidden sm:flex items-center group shrink-0">
            <img
              src="/logo.png"
              alt="ShowMySkills Logo"
              className="h-14 sm:h-16 md:h-18 w-auto my-0.5 sm:my-1"
            />
          </Link>

          {/* GitHub Star Badge - shown on left on mobile */}
          <a
            href="https://github.com/xyphx/ShowMySkills-system"
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden h-9 px-2.5 flex items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all shadow-xs group"
          >
            <svg
              className="w-4 h-4 fill-current text-white transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <div className="h-4 w-[1px] bg-white/30" />
            <span className="flex items-center gap-1 text-xs font-semibold text-white">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="tabular-nums font-bold text-xs">{starCount}</span>
            </span>
          </a>
        </div>

        {/* Right side: GitHub Star (desktop only), Log In, and Sign Up */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* GitHub Star Badge - shown on right on desktop/tablet */}
          <a
            href="https://github.com/xyphx/ShowMySkills-system"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex h-11 px-5 items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all shadow-xs group"
          >
            <svg
              className="w-5 h-5 fill-current text-white transition-transform group-hover:scale-105"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <div className="h-5 w-[1px] bg-white/30" />
            <span className="flex items-center gap-1 text-sm font-semibold text-white">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="tabular-nums font-bold text-base">{starCount}</span>
            </span>
          </a>
          <Link
            href="/login"
            className="h-9 sm:h-11 px-2.5 sm:px-5 flex items-center justify-center cursor-pointer text-white/90 hover:text-white font-medium text-xs sm:text-base transition-colors whitespace-nowrap"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="h-9 sm:h-11 px-3.5 sm:px-6 flex items-center justify-center cursor-pointer bg-white hover:bg-[#F7F9F9] active:scale-95 text-[#181E29] rounded-full font-semibold text-xs sm:text-base transition-all shadow-xs whitespace-nowrap"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Main Hero Card Container */}
      <div className="relative w-full flex-1 bg-[#F7F9F9] border-t border-[#E2E8F0] shadow-[0_4px_25px_rgba(0,0,0,0.03)] rounded-[24px] sm:rounded-[36px] md:rounded-[44px] overflow-hidden flex flex-col justify-center items-center py-6 sm:py-12 md:py-14 px-3 sm:px-8">
        
        {/* Floating Doodles & Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Top-Left Playful Lightning */}
          <div className="absolute top-4 sm:top-12 md:top-14 left-4 sm:left-14 md:left-20 text-amber-400 rotate-12 opacity-80 sm:opacity-100">
            <Zap className="w-6 h-6 sm:w-10 sm:h-10" strokeWidth={2.2} fill="none" />
          </div>

          {/* Floating Document Outline */}
          <div className="absolute top-10 sm:top-28 md:top-32 left-16 sm:left-36 md:left-48 text-slate-300 opacity-60 sm:opacity-100">
            <FileText className="w-7 h-7 sm:w-13 sm:h-13" strokeWidth={1.4} />
          </div>

          {/* Middle-Left Chat Bubble & Activity Doodle */}
          <div className="absolute flex top-[38%] sm:top-[48%] -translate-y-1/2 left-3 sm:left-10 md:left-14 items-center space-x-1.5 sm:space-x-2.5 opacity-60 sm:opacity-100">
            <div className="w-4 h-4 sm:w-7 sm:h-7 bg-[#BFDBFE] rounded-full" />
            <div className="space-y-0.5 sm:space-y-1">
              <div className="w-5 sm:w-10 h-1 sm:h-2 bg-[#BFDBFE] rounded-full" />
              <div className="w-3 sm:w-6 h-1 sm:h-2 bg-[#BFDBFE] rounded-full" />
            </div>
            <MessageCircle className="text-[#60A5FA] w-3.5 h-3.5 sm:w-5 sm:h-5" strokeWidth={2} />
          </div>

          {/* Top-Right Glowing Star */}
          <div className="absolute top-5 sm:top-16 md:top-20 right-16 sm:right-28 md:right-36 text-teal-300 opacity-80 sm:opacity-100">
            <Star className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={1.8} fill="none" />
          </div>

          {/* Top-Right Horizontal Doodled Bars (3 bars) */}
          <div className="absolute top-12 sm:top-32 md:top-36 right-4 sm:right-16 md:right-20 space-y-1 sm:space-y-2 opacity-70 sm:opacity-100">
            <div className="w-8 sm:w-12 h-1 sm:h-1.5 bg-amber-300/80 rounded-full" />
            <div className="w-12 sm:w-16 h-1 sm:h-1.5 bg-amber-300/80 rounded-full" />
            <div className="w-7 sm:w-10 h-1 sm:h-1.5 bg-amber-300/80 rounded-full" />
          </div>

          {/* Middle-Right Star (below lines) */}
          <div className="absolute top-24 sm:top-46 md:top-50 right-8 sm:right-20 md:right-24 text-teal-300 opacity-70 sm:opacity-100">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.8} fill="none" />
          </div>
        </div>

        {/* Hero Center Text Content */}
        <div className="relative z-20 max-w-3xl mx-auto px-2 sm:px-4 text-center flex flex-col items-center my-auto">
          {/* Logo above ShowMySkills - visible on mobile only */}
          <Link href="/" className="sm:hidden mb-2 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="ShowMySkills Logo"
              className="h-24 w-auto object-contain drop-shadow-xs"
            />
          </Link>

          {/* Main Brand */}
          <div className="inline-flex items-baseline justify-center relative mb-2 sm:mb-2.5">
            <span className="text-4xl xs:text-5xl sm:text-5xl md:text-5xl lg:text-[4rem] font-extrabold tracking-tight text-[#4B9C93]">
              ShowMySkills
            </span>
          </div>

  

          {/* 3-Line Core Catchphrase */}
          <h1 className="text-2xl xs:text-2xl sm:text-3.5xl md:text-4xl lg:text-[3.1rem] font-bold text-[#181E29] leading-[1.25] sm:leading-[1.15] tracking-tight mb-3 sm:mb-4">
            <span className="block">Build your profile</span>
            <span className="block">Discover opportunities</span>
            <span className="block">Connect with people</span>
          </h1>

          {/* Value Proposition Description */}
          <p className="text-xs sm:text-sm md:text-[15.5px] text-gray-600 max-w-[700px] mx-auto mb-5 sm:mb-7 leading-relaxed font-normal px-2">
            Showcase your skills, explore internship opportunities, connect directly with talented people, and get discovered by companies. Everything you need to take your career forward, in one open platform.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-row items-center justify-center gap-3.5 sm:gap-5">
            <Link
              href="/about"
              className="cursor-pointer bg-white hover:bg-slate-50 active:scale-95 text-[#181E29] border border-gray-900 px-7 sm:px-11 py-2.5 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all shadow-xs"
            >
              More
            </Link>
            <Link
              href="/internships"
              id="landing-get-started-btn"
              className="cursor-pointer bg-[#4B9C93] hover:bg-[#3d867e] active:scale-95 text-white px-6 sm:px-9 py-2.5 sm:py-3 rounded-full text-sm sm:text-lg font-semibold transition-all shadow-xs"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Bottom Left Illustration - Coder */}
        <div className="absolute bottom-0 left-0 sm:left-4 md:left-6 lg:left-8 z-10 pointer-events-none select-none">
          <img
            src="/LandingPage/coder.png"
            alt="Developer coding at desk"
            className="w-52 xs:w-60 sm:w-64 md:w-72 lg:w-80 object-contain drop-shadow-xs"
          />
        </div>

        {/* Bottom Right Illustration - Ideaman */}
        <div className="absolute -bottom-2 sm:-bottom-10 md:-bottom-11 lg:-bottom-12 xl:-bottom-13 right-0 sm:right-4 md:right-6 lg:right-8 z-10 pointer-events-none select-none">
          <img
            src="/LandingPage/ideaman.png"
            alt="Creative idea generator"
            className="h-44 xs:h-52 sm:h-74 md:h-84 lg:h-[390px] xl:h-[420px] max-h-[38vh] sm:max-h-[50vh] w-auto object-contain drop-shadow-xs"
          />
        </div>
      </div>
    </main>
  );
}
