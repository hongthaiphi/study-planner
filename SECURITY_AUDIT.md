# Security Audit — StudyPlanner

**Ngày rà soát:** 2026-09-14
**Phạm vi:** Toàn bộ source code `app/src/`

---

## 1. IDOR — Topics & Milestones API (NGHIEM TRONG)

**Files:**
- `api/topics/route.ts` (PATCH, DELETE)
- `api/milestones/route.ts` (PATCH, DELETE)

**Van de:** Cac endpoint PATCH/DELETE chi kiem tra user da login, nhung khong verify topic/milestone do co thuoc ve user khong. User A co the sua/xoa topic cua user B neu biet ID.

**Fix:** Them ownership check qua project -> user_id truoc khi update/delete.

**Status:** DA FIX — Them `verifyTopicOwnership()` va `verifyMilestoneOwnership()` join qua projects.user_id

---

## 2. Open Redirect — Auth Callback (TRUNG BINH)

**File:** `auth/callback/route.ts:7`

**Van de:** Tham so `next` khong duoc validate. Attacker co the craft URL `/auth/callback?code=xxx&next=//evil.com` de redirect nan nhan sang site doc.

**Fix:** Them `sanitizeRedirect()` — validate `next` phai bat dau bang `/`, khong chua `//` hoac `://`.

**Status:** DA FIX

---

## 3. Khong co Rate Limiting tren Chat API (TRUNG BINH)

**File:** `api/chat/route.ts`

**Van de:** API goi DeepSeek khong co rate limit. User co the spam requests, gay ton tien API va DoS.

**Fix:** Them in-memory rate limiter (max 10 requests/phut/user) voi `checkRateLimit()`.

**Status:** DA FIX

---

## 4. Chat API — User messages khong gioi han do dai (THAP)

**File:** `api/chat/route.ts`

**Van de:** User messages duoc forward truc tiep sang DeepSeek khong gioi han do dai. Co the bi prompt injection (impact thap vi chi anh huong chinh user do).

**Fix:** Gioi han max 20 messages, moi message max 2000 ky tu. Validate role chi la `user`/`assistant`.

**Status:** DA FIX

---

## 5. Thieu Security Headers (THAP)

**File:** `next.config.ts`

**Van de:** Khong co security headers: CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.

**Fix:** Them 6 security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control, HSTS.

**Status:** DA FIX

---

## 6. Middleware redirect API routes (TRUNG BINH)

**File:** `lib/supabase/middleware.ts:44-53`

**Van de:** Middleware redirect tat ca unauthenticated requests (ke ca `/api/*`) sang `/login`. API routes da tu handle auth (tra 401), nen middleware redirect gay ra 405 Method Not Allowed cho API calls.

**Fix:** Them `!request.nextUrl.pathname.startsWith("/api/")` vao dieu kien redirect.

**Status:** DA FIX

---

## Kiem tra tren Production (2026-09-14)

**URL:** https://project-tracking-log.vercel.app/

| Hang muc | Ket qua |
|---|---|
| Security Headers | X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, X-DNS-Prefetch-Control — OK |
| API auth (khong login) | Tat ca tra 401 Unauthorized — OK |
| IDOR Topics | Fake ID tra 404 — OK |
| IDOR Milestones | Fake ID tra 404 — OK |
| Open Redirect | `//evil.com`, `https://evil.com` deu ve `/login` — OK |
| Message qua dai (2500 chars) | 400 reject — OK |
| Qua nhieu messages (25) | 400 reject — OK |
| Invalid role (system) | 400 reject — OK |
| Rate limiting | 429 sau 10 req/min — OK |

**Luu y:**
- `access-control-allow-origin: *` do Vercel tu them, khong nguy hiem (cookie-based auth)
- HSTS duoc Vercel xu ly o edge level
- Chua co CSP header — can than trong voi Three.js + inline styles

---

## Ket qua tot (khong co loi)

- Supabase client dung `anon_key`, `service_role_key` khong xuat hien trong source
- `.env.local` duoc gitignore dung
- Khong co `dangerouslySetInnerHTML` (khong XSS)
- RLS enabled tren tat ca bang
- Tat ca API routes deu check `auth.getUser()` truoc khi xu ly
- Projects API PATCH/DELETE co `.eq("user_id", user.id)` — dung
- Khong co hardcoded secrets trong source code
