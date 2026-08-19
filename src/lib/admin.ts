/**
 * Admin authorization utility for AoE2.ai
 */

const DEFAULT_ADMIN_EMAILS = ["alvaro.martinfidalgo@gmail.com"];

export function getAdminEmails(): Set<string> {
  const list = [...DEFAULT_ADMIN_EMAILS];

  if (process.env.ADMIN_EMAILS) {
    const extra = process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
    list.push(...extra);
  }

  if (process.env.ADMIN_EMAIL) {
    const single = process.env.ADMIN_EMAIL.trim().toLowerCase();
    if (single) list.push(single);
  }

  return new Set(list.map((e) => e.toLowerCase()));
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const admins = getAdminEmails();
  return admins.has(email.trim().toLowerCase());
}
