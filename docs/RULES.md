# SkillVerse System Rules & Development Guidelines

This document establishes the fundamental rules, security protocols, and engineering standards for the SkillVerse platform.

---

## 1. Security & Authentication Rules

1. **Admin Portal Isolation**:
   - The Admin dashboard must **never** be linked or visible from public navigation bars, guest landing pages, or public sign-in forms.
   - Admin access is strictly restricted to direct navigation to `/admin`.
   - The admin portal accepts only the single Master Admin Key (`000000`).
   - No public user registration may create an `ADMIN` role.
   - There is strictly **one** administrative entity.

2. **National NID & Worker Verification**:
   - Any user registering as a `WORKER` must provide an official Bangladeshi NID number.
   - Workers remain in `UNVERIFIED` status until reviewed and approved by the administrator.
   - Unverified workers cannot accept verified customer bookings or receive automated customer matches.

3. **Dual-Stage OTP Verification**:
   - Every on-site job requires two distinct, random 4-digit OTPs:
     1. **Start OTP**: Given by the customer to the worker upon arrival. The job status cannot change to `IN_PROGRESS` without this OTP.
     2. **Completion OTP**: Given by the customer when the service is fully rendered. The job status cannot change to `COMPLETED` without this OTP.
   - This completely prevents fake completions, ghost arrivals, or unilateral job closure.

---

## 2. State & Data Isolation Rules

1. **Per-User LocalStorage Isolation**:
   - All browser client state (e.g. notifications, saved workers, properties, addresses, service history, cart, and reviews) must be partitioned by user identity:
     `fixconnect_${key}_${user.id || user.email}`
   - Newly registered accounts must initialize with clean, empty states (no residual notifications or pre-filled addresses from previous demo sessions).

2. **Clean User Profiles**:
   - New user accounts must start with empty profile photos and clean location fields until explicitly set or uploaded by the user from their device.

---

## 3. Financial & Commission Rules

1. **Dynamic Platform Commission**:
   - Platform commission rate is configurable by the admin via `PlatformSetting` (default: 10%).
   - Commission deductions from booking payouts must dynamically reference this active system rate.
   - Worker wallets receive `Total Paid - Platform Commission`.

2. **Payment Methods**:
   - Supported options: bKash (MFS), Nagad (MFS), Bank Transfer, and Verified Cash on Delivery.
   - Payment status must only update to `PAID` after completion OTP is validated.

---

## 4. UI/UX & Design Rules

1. **Dark Theme Design System**:
   - SkillVerse uses a curated deep dark aesthetic (`#0a0f1d` background, `#0e1526` surface cards, emerald green `#10b981` primary, sky blue `#3b82f6` secondary).
   - Glassmorphic panels with subtle borders (`rgba(255,255,255,0.08)`) and high contrast typography.

2. **Map Display Standards**:
   - Map tiles in `Find Services` must load standard **OpenStreetMap** by default for optimal readability in daylight/standard conditions, with a toggle switch to **Dark Mode** map tiles.

3. **Responsive Layouts**:
   - All interfaces must adapt seamlessly to desktop (>1200px), tablet (768px - 1199px), and mobile (<768px) viewports.

---

## 5. Coding & API Standards

1. **Backend (Spring Boot)**:
   - Use standard REST conventions (`GET`, `POST`, `PUT`, `DELETE`).
   - Use `@CrossOrigin(origins = "*")` to support seamless development across local ports.
   - Preserve database integrity using JPA cascade rules and foreign keys.

2. **Frontend (React)**:
   - Keep state centralized in `App.jsx` or specialized modular components.
   - Use `lucide-react` for consistent iconography.
   - Always run `npm run build` after changes to verify zero bundle or syntax regressions.
