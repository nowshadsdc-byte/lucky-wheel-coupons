# Spin The Wheel – Plan

Frontend-only build (you'll host the real backend). Data persists in `localStorage` so the full flow works end-to-end in the browser; every data call is isolated behind a thin `api/` layer so you can swap it for real HTTP calls to your Laravel/Node backend in one place.

## Branding
- Palette: Coral `#E84A4A`, Orange `#F27A41`, Teal `#25B2A1`, Green `#4CB963`, Charcoal `#1A1A1A`, White.
- Wheel uses the 4 brand colors for its 4 reward segments — visually echoes the SDC 2x2 logo grid.
- Typography: clean geometric sans (Space Grotesk for headings, Inter for body), all-caps for headings.
- Design tokens added to `src/styles.css` (oklch) so nothing is hardcoded in components.

## Pages / Routes
```
/                  Landing + registration form
/spin              Spin wheel (gated: must have registered, must not have spun)
/result            Reward popup view + coupon (also shown as modal on /spin)
/admin/login       Admin login
/admin             Dashboard overview (protected)
/admin/users       Users list, search, filter, CSV export
/admin/rewards     Toggle 100% free, edit probabilities, reset spins
/admin/winners     Verify + mark coupons claimed
```

## User flow
1. Landing page → form (Full Name, Phone, Address, Course 1/2/3).
2. Validate with Zod; reject duplicate phone (lookup in store).
3. Save user → redirect to `/spin`.
4. User spins once. Backend-style logic (in `lib/spin-engine.ts`) picks the reward using configured probabilities; wheel animation lands on the chosen segment.
5. Confetti + modal shows reward + unique coupon (e.g. `SDC-20OFF-83492`).
6. User marked `has_spun = true`; coupon saved.

## Spin engine (business logic)
- Default probabilities: 10% OFF → 50, 20% OFF → 35, 30% OFF → 14, 100% FREE → 1.
- 100% FREE is globally gated by `rewards.free.is_active` AND `total_won < max_limit (1)`. When won once, it auto-disables and is excluded from future rolls (probabilities renormalize).
- Admin can toggle 100% FREE on/off and edit probabilities; changes persist.
- Coupon format: `SDC-<REWARD>-<5 digit unique>` with collision check.

## Admin
- Email/password login. First registered admin email (configurable constant for now) is treated as admin; others rejected at login. Session = signed token in `localStorage` (placeholder — replace with real JWT against your API).
- Protected routes via TanStack `_authenticated` layout pattern (`/admin/_protected`).
- Dashboard: total users, total spins, total winners, per-reward counts, sparkline of recent signups.
- Users table: search by phone, filter by reward, CSV export.
- Rewards page: toggle 100% FREE, edit probability sliders (auto-normalize), reset all spin statuses.
- Winners page: list with coupon, "Mark claimed" toggle, search by coupon/phone.

## Data layer (swap-ready)
All reads/writes go through `src/lib/api/*.ts` (e.g. `users.ts`, `rewards.ts`, `auth.ts`). Current implementation hits `localStorage`; to go live you replace the function bodies with `fetch()` to your Laravel/Node endpoints — components stay unchanged.

Schemas (TypeScript types matching your spec):
- `User`: id, full_name, phone_number, address, course_option_1..3, has_spun, reward_won, coupon_code, created_at
- `Reward`: id, reward_name, probability, is_active, max_limit, total_won
- `Admin`: id, email, password_hash (placeholder)

## Anti-abuse (client-side, to be reinforced server-side later)
- Duplicate phone check before insert.
- `has_spun` flag prevents re-spin from the same user; spin route redirects if already spun.
- Form validation: trim, length caps, phone regex.
- Coupon uniqueness check on generation.

## Tech notes
- Stack: TanStack Start + React + Tailwind v4 + shadcn/ui (already set up).
- Wheel: custom SVG with CSS transform rotation; easing for realistic spin; lands on chosen index via computed final angle.
- Confetti: `canvas-confetti`.
- Forms: `react-hook-form` + `zod`.
- Toasts: existing `sonner`.

## Build order
1. Design tokens + base layout/header with SDC branding.
2. Landing page + registration form + localStorage user store.
3. Spin engine + wheel component + result modal + confetti.
4. Admin auth + protected layout.
5. Admin dashboard, users, rewards, winners pages.
6. Polish: empty states, mobile responsiveness, CSV export.

## Not included (per your choice)
- SMS / Email / WhatsApp share / FB Pixel / GA — can be added later.
- Real backend — left as a clean swap at the `src/lib/api/*` boundary.