"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  MapPin,
  Wallet,
  CalendarDays,
  Clock,
  BadgeCheck,
  CheckCircle,
  XCircle,
  Monitor,
  Bookmark,
} from "lucide-react";
import { getSwipeDirection } from "@/features/internships/feedUtils.mjs";

/**
 * InternshipCard — Interactive, swipeable internship card.
 *
 * Supports:
 * - Mouse and touch swipe gestures.
 * - Animated ACCEPT and SKIP stamps.
 * - Stacked cards with depth scaling.
 * - Programmatic swipe triggers via action buttons.
 * - Work mode display: Remote, Hybrid, or On-site.
 */
export default function InternshipCard({
  internship,
  isTopCard = false,
  indexOffset = 0,
  onSwipe,
  swipeDirection = null,
}) {
  const {
    companyName,
    companyLogoText,
    companyLogoSubText,
    roleTitle,
    location,
    mode,
    stipend,
    duration,
    skills = [],
    isVerified,
    isSaved,
    jobType,
    postedTime,
    description,
  } = internship;

  // Horizontal drag and rotation
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-18, 18]);

  // Swipe stamp opacity
  const acceptStampOpacity = useTransform(x, [20, 120], [0, 1]);
  const skipStampOpacity = useTransform(x, [-20, -120], [0, 1]);

  // Handle drag release
  const handleDragEnd = (_, info) => {
    if (!isTopCard) return;
    const direction = getSwipeDirection(info.offset.x, info.velocity.x);
    if (direction) onSwipe?.(direction);
  };

  // Background card stack
  const targetScale = 1 - indexOffset * 0.04;
  const targetY = indexOffset * 8;
  const targetOpacity = 1 - indexOffset * 0.15;
  const cardZIndex = 50 - indexOffset * 10;

  // Exit animations
  const variants = {
    initial: {
      scale: targetScale,
      y: targetY,
      opacity: targetOpacity,
      x: 0,
      rotate: 0,
      zIndex: cardZIndex,
    },
    animate: {
      scale: targetScale,
      y: targetY,
      opacity: targetOpacity,
      zIndex: isTopCard ? 50 : cardZIndex,
      transition: {
        duration: 0.25,
        ease: "easeOut",
      },
    },
    exit: (direction) => {
      if (direction === "left") {
        return {
          x: -500,
          rotate: -25,
          opacity: 0,
          zIndex: 1000,
          transition: {
            duration: 0.3,
            ease: "easeIn",
          },
        };
      }

      if (direction === "right") {
        return {
          x: 500,
          rotate: 25,
          opacity: 0,
          zIndex: 1000,
          transition: {
            duration: 0.3,
            ease: "easeIn",
          },
        };
      }

      if (direction === "save") {
        return {
          y: -250,
          scale: 0.85,
          opacity: 0,
          zIndex: 1000,
          transition: {
            duration: 0.3,
            ease: "easeIn",
          },
        };
      }

      return {
        opacity: 0,
        zIndex: 1000,
      };
    },
  };

  const workMode =
    mode === "remote"
      ? "Remote"
      : mode === "hybrid"
        ? "Hybrid"
        : "On-site";

  return (
    <motion.div
      id={`internship-card-${internship.id}`}
      style={
        isTopCard
          ? {
              x,
              rotate,
              touchAction: "none",
            }
          : {}
      }
      custom={swipeDirection}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={isTopCard ? { cursor: "grabbing" } : {}}
      className={`absolute top-0 left-0 w-full h-full bg-white rounded-2xl shadow-xl shadow-black/8 border border-gray-100 overflow-hidden select-none flex flex-col justify-between ${
        isTopCard
          ? "cursor-grab active:cursor-grabbing"
          : "pointer-events-none"
      }`}
    >
      {/* ACCEPT stamp */}
      {isTopCard && (
        <motion.div
          style={{ opacity: acceptStampOpacity }}
          className="absolute top-5 left-5 z-40 border-4 border-[#4B9C93] text-[#4B9C93] bg-white/90 backdrop-blur-xs font-black text-base sm:text-lg px-3.5 py-0.5 rounded-xl rotate-[-12deg] flex items-center gap-1.5 shadow-lg pointer-events-none"
        >
          <CheckCircle className="w-5 h-5 stroke-[3]" />
          ACCEPT
        </motion.div>
      )}

      {/* SKIP stamp */}
      {isTopCard && (
        <motion.div
          style={{ opacity: skipStampOpacity }}
          className="absolute top-5 right-5 z-40 border-4 border-red-500 text-red-500 bg-white/90 backdrop-blur-xs font-black text-base sm:text-lg px-3.5 py-0.5 rounded-xl rotate-[12deg] flex items-center gap-1.5 shadow-lg pointer-events-none"
        >
          <XCircle className="w-5 h-5 stroke-[3]" />
          SKIP
        </motion.div>
      )}

      {/* Company logo / poster image area (fills remaining balance space) */}
      <div className="relative px-5 sm:px-6 pt-3.5 pb-2 flex-1 min-h-[80px] flex flex-col">
        <div className="w-full h-full rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center gap-1 overflow-hidden">
          {internship.posterImage ? (
            <img
              src={internship.posterImage}
              alt={roleTitle || companyName}
              className="w-full h-full object-cover"
            />
          ) : internship.companyLogo ? (
            <img
              src={internship.companyLogo}
              alt={companyName}
              className="max-h-full max-w-full object-contain p-3"
            />
          ) : (
            <>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#4B9C93] tracking-wider">
                {companyLogoText}
              </span>

              {companyLogoSubText && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 tracking-[0.25em] uppercase">
                  {companyLogoSubText}
                </span>
              )}
            </>
          )}
        </div>

        {/* Saved badge */}
        {isSaved && (
          <span
            id={`saved-badge-${internship.id}`}
            className="absolute top-6 left-7 sm:left-8 inline-flex items-center gap-1 text-[11px] font-semibold text-[#4B9C93] bg-[#E6F7F3] border border-[#4B9C93]/30 rounded-full px-2.5 py-0.5 shadow-2xs z-30"
          >
            <Bookmark className="w-3 h-3 fill-[#4B9C93] text-[#4B9C93]" />
            Saved
          </span>
        )}

        {/* Verified badge — genuine company verification badge only */}
        {isVerified && (
          <span
            id={`verified-badge-${internship.id}`}
            className="absolute top-6 right-7 sm:right-8 inline-flex items-center gap-1 text-[11px] font-semibold text-[#4B9C93] bg-[#E6F7F3] border border-[#4B9C93]/20 rounded-full px-2.5 py-0.5 shadow-2xs"
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            Verified
          </span>
        )}
      </div>

      {/* Card body (anchored to bottom) */}
      <div className="px-5 sm:px-6 pb-4 shrink-0 flex flex-col">
        <div>
          {/* Role and company */}
          <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug truncate">
            {roleTitle}
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 mb-2 truncate">
            {companyName}
          </p>

          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 mb-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">{location || "Remote"}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{workMode}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{stipend || "Unpaid"}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{duration || "N/A"}</span>
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed mb-2.5 line-clamp-2">
            <span className="text-gray-400 mr-1">📋</span>
            {description || "No description available."}
          </p>

          {/* Skills tags */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="text-[11px] font-semibold text-[#4B9C93] bg-[#E6F7F3] px-2.5 py-0.5 rounded-full"
              >
                {skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="text-[11px] text-gray-400 self-center">
                +{skills.length - 6}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 shrink-0">
          <span className="text-[11px] font-medium text-gray-500 border border-gray-200 rounded-full px-2.5 py-0.5">
            {jobType || "Internship"}
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {postedTime || "Recently posted"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
