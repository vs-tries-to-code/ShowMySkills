"use client";

import { useEffect, useState } from "react";
import { authService, tokenStorage } from "@/services/apiClient";

const roles = ["student", "company", "college", "admin"];

export function getUserRole(user) {
  const role = String(user?.role || user?.user?.role || "").toLowerCase();
  return roles.includes(role) ? role : null;
}

export function getUserDashboardPath(user) {
  switch (getUserRole(user)) {
    case "student":
      return "/student/internships";
    case "company":
      return "/company/dashboard";
    case "college":
      return "/college/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/profile";
  }
}

export function getUserInternshipsPath(user) {
  switch (getUserRole(user)) {
    case "student":
      return "/student/internships";
    case "company":
      return "/company/internships";
    case "admin":
      return "/admin/internships";
    default:
      return "/internships";
  }
}

export function useAuth() {
  const [user, setUser] = useState(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const hasAccessToken = Boolean(tokenStorage.getAccessToken());
    setHasSession(hasAccessToken);

    if (!hasAccessToken) {
      setAuthResolved(true);
      return () => {
        isMounted = false;
      };
    }

    const loadCachedUser = () => {
      try {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to read the cached user:", err);
      }
    };

    loadCachedUser();
    if (typeof window !== "undefined") {
      window.addEventListener("storage", loadCachedUser);
      window.addEventListener("user-updated", loadCachedUser);
    }

    authService.getCurrentUser().then((currentUser) => {
      if (isMounted && currentUser) {
        setUser(currentUser);
      }
    }).catch((err) => {
      console.error("Failed to load the authenticated user:", err);
    }).finally(() => {
      if (isMounted) setAuthResolved(true);
    });

    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", loadCachedUser);
        window.removeEventListener("user-updated", loadCachedUser);
      }
    };
  }, []);

  return {
    user,
    setUser,
    isAuthenticated: !!user,
    authResolved,
    hasSession,
  };
}
