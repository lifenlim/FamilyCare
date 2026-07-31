// Bump this whenever the brand icon image changes. Next.js's file-convention
// icon routes (app/icon.png) reuse a stable URL that doesn't reflect content
// changes, so browsers cache it indefinitely — we version our own icon URLs
// instead to force a fresh fetch after each update.
export const BRAND_ICON_VERSION = "3";
