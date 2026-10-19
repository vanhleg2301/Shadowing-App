// The only accounts allowed into /admin. Server-only: keep it out of client components so the list
// isn't shipped to browsers.
export const ADMIN_EMAILS = ["vanhleg2301@gmail.com", "viet.anh@nullifymatter.com.sg"] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  return email ? (ADMIN_EMAILS as readonly string[]).includes(email.toLowerCase()) : false;
}
