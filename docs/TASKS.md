# SkillVerse Task Roadmap & Module Log

This document tracks completed implementations, active components, and the operational feature roadmap for SkillVerse.

---

## 1. Completed Core Implementations ✅

### Module 1: Public Experience & Onboarding
- [x] **High-Impact Landing Page**: Hero banner with key metrics (15k+ jobs, 4.9 rating), feature pillars, category shortcuts, 4-step workflow, and warranty card.
- [x] **Guest Topbar Navigation**: Fixed header with smooth anchors (`#features`, `#services`, `#how-it-works`, `#academy`, `#tools`) and quick authentication buttons.
- [x] **Public Auth Isolation**: Public sign-in strictly limited to `Customer` and `Worker` roles with zero admin exposure.

### Module 2: Security & Admin Command Center
- [x] **Restricted Admin Portal (`/admin`)**: Single master password authentication (`000000`) with no email prompt or public signup.
- [x] **Direct Landing on Overview**: Admin authentication lands directly on the Overview dashboard.
- [x] **Worker Verification Overview Cards**: Cards display clean summary overviews with direct quick actions and a **"View Full Details & Documents"** button.
- [x] **Comprehensive Audit Inspection Modal**: Detailed modal showing zoomable NID documents, selfie, certificates, full addresses, bio, and payout details.
- [x] **Worker Verification Pipeline**: Document & NID verification interface with real-time pending badge counts `(N)` that update immediately on approval/rejection.
- [x] **Dynamic Commission Setting**: Admin UI to adjust platform fee percentage (e.g. 10%) backed by `PlatformSetting` repository.
- [x] **Persistent URL Routing**: Browser URL reflects active tab (`/admin`, `/admin/academy`, `/admin/tools`, `/admin/settings`, `/bookings`, `/store`, etc.) and retains view across refreshes.

### Module 4: Worker Portal & Verification Onboarding
- [x] **Simplified Sign-up without NID**: Workers register using Name, Email, Phone, and Password; NID is provided during the verification onboarding.
- [x] **5-Step Complete Verification Dossier**: Identity & NID, PC Device Photo Uploads, Phone SMS OTP verification, Residential Addresses, Professional Bio & Proofs, and Payout Setup.
- [x] **Global Brand Logo Navigation**: Clicking "SkillVerse" returns to the relevant home page from any state.

### Module 3: Customer Portal & Service Discovery
- [x] **Interactive Geo-Location Map**: OpenStreetMap integration with default standard map layer and dark-mode toggle switch.
- [x] **Radius & Skill Filtering**: Dynamic filter chips (HVAC, Plumbing, Electrical, Smart Home, etc.) and distance ranges (500m - 10km).
- [x] **AI Diagnostic & Price Estimator**: Real-time fair price benchmarks for home repairs.
- [x] **Custom Problem Broadcasting**: Post issues with photos, urgency, and budget for live worker bidding.
- [x] **Dual-OTP Tracking**: Live Start OTP (4 digits) and Completion OTP (4 digits) verification cards.

### Module 4: Worker Portal & Job Execution
- [x] **Live Job Board**: Receive direct bookings and browse posted customer problems with distance calculations.
- [x] **Direct Counter-Offer Engine**: Submit custom rate bids with reasoning.
- [x] **Dual-OTP Entry Fields**: Validate customer Start OTP upon arrival and Completion OTP after finishing service.
- [x] **Worker Financial Wallet**: Track completed earnings, platform commission deductions, and pending payout balance.

### Module 5: SkillVerse Academy & Tool Store
- [x] **Vocational Training Academy**: Course catalogs, video lesson previewers, progress tracking, and skill certification badges.
- [x] **Equipment Marketplace & Cart**: Industrial tool listings, category filters, cart management, and checkout workflow.

---

## 2. Maintenance & Polish Items (Completed) 🚀
- [x] **User Data Partitioning**: Keyed all user notifications, saved items, properties, and addresses to individual accounts.
- [x] **Device Profile Photo Upload**: Allowed users to select and preview custom profile pictures from local PC storage.
- [x] **Clean State on Registration**: Zero residual data or notifications for newly created accounts.

---

## 3. Future Feature Backlog 📋

- [ ] **Push Notification WebSockets**: Real-time socket events for instant job bid alerts and OTP updates.
- [ ] **In-App Live Chat**: Direct encrypted messaging between customer and technician before job arrival.
- [ ] **Automated Payment Gateway**: Integration with official bKash / SSLCommerz payment APIs.
- [ ] **Mobile App PWA Bundle**: Service worker caching and offline service directory.
