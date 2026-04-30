# Security Best Practices Report (Next.js / NextAuth / Prisma)

## Executive Summary

The application is generally structured well (NextAuth session checks on most API routes, admin role gating), but there are a few high-impact security gaps to address: token/secret hygiene, potential HTML/CSS injection via invoice style tokens, and missing rate limiting on auth endpoints.

## Critical

### SEC-001 — Secrets were shared in chat (GitHub tokens / UploadThing token)
- Impact: Anyone with access to the chat transcript can take over GitHub access and/or UploadThing resources.
- Action: Revoke all exposed tokens immediately and rotate them. Do not paste secrets in chat again.

## High

### SEC-002 — Potential HTML/CSS injection via invoice style tokens rendered into `<style>`
- Impact: A malicious user who can persist arbitrary `tokens` could inject `</style>...` and potentially execute script in rendered invoice HTML/PDF contexts.
- Evidence: [invoice-html.js](file:///workspace/src/components/invoice/invoice-html.js#L35-L52) builds `cssVars` from `tokens` without validating value formats before inserting into a `<style>` block.
- Recommendation:
  - Validate/whitelist token keys and formats (numbers, hex colors, enumerations) before saving to DB and before rendering.
  - Reject any token values containing `<`, `>`, `</style`, or other HTML-breaking sequences.

### SEC-003 — No rate limiting / lockout on Credentials auth and registration
- Impact: Brute-force attacks against `/login` (Credentials provider) and `/api/auth/register` are possible.
- Evidence: Credentials provider compares bcrypt hashes without rate limiting: [auth.ts](file:///workspace/src/lib/auth.ts#L27-L52). Registration route exists: [register route](file:///workspace/src/app/api/auth/register/route.ts).
- Recommendation:
  - Add IP-based rate limiting for login/register endpoints (and possibly per-email throttling).
  - Add incremental delays or temporary lockouts after repeated failures.

## Medium

### SEC-004 — Error logging may leak sensitive data
- Impact: Logs can accidentally include user PII or request payloads depending on thrown error objects.
- Evidence: Multiple routes log full error objects, e.g. [invoices/[id]/route.ts](file:///workspace/src/app/api/invoices/%5Bid%5D/route.ts#L83-L86).
- Recommendation:
  - Log only a stable error code + minimal message.
  - Avoid logging request bodies and third-party error objects verbatim.

### SEC-005 — Ensure production-required secrets are enforced
- Impact: Misconfigured prod deployments can weaken auth/session security.
- Evidence: NextAuth relies on `NEXTAUTH_SECRET` being set; the code doesn’t enforce it at startup: [auth.ts](file:///workspace/src/lib/auth.ts).
- Recommendation:
  - Add a small startup check in server-only code path that throws if `NEXTAUTH_SECRET` is missing in production.
  - Ensure cookies are `Secure` in production (NextAuth typically handles this when `NEXTAUTH_URL` is https).

## Low / Hardening

### SEC-006 — Consider tightening UploadThing allowed file constraints
- Impact: Reduced abuse surface for uploads.
- Evidence: Upload endpoints accept images with max 4MB; good. Still consider further hardening in router config: [uploadthing core](file:///workspace/src/app/api/uploadthing/core.ts).
- Recommendation:
  - Consider validating mime types strictly, and optionally image dimension limits (if supported).

## Next Steps (Recommended Order)
1. Revoke all exposed tokens and switch to pushing changes without pasting PATs in chat.
2. Add schema validation for invoice style tokens before saving and before rendering invoice HTML.
3. Add rate limiting to login/register.
4. Reduce sensitive error logging.

