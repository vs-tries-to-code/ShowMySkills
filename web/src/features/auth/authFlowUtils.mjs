export function getEmailVerificationPath(email) {
  return `/verify-email?email=${encodeURIComponent(String(email || "").trim())}`;
}
