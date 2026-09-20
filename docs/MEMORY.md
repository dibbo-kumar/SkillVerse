# SkillVerse Project Memory & Developer Cheatsheet

This document serves as persistent operational memory for the SkillVerse system, containing network ports, seeded test accounts, demo credentials, and database notes.

---

## 1. Network & Server Topology

| Service | Environment | Port | Base URL | Technology |
|---|---|---|---|---|
| **Frontend Web App** | Development / Vite | `5173` | `http://localhost:5173` | React 18, Vite |
| **Backend API** | Spring Boot | `8081` | `http://localhost:8081/api` | Java 17, Spring Boot 3 |
| **H2 Console** | In-Memory Database | `8081` | `http://localhost:8081/h2-console` | H2 Database (`jdbc:h2:mem:skillversedb`) |

---

## 2. Seed Accounts & Credentials

### A. System Administrator
- **Access Route**: `http://localhost:5173/admin`
- **Master Password**: `000000`
- **Account Identity**: `admin@skillverse.com` (System Admin)
- **Role**: `ADMIN` (Exclusive single account; zero public signup)

### B. Demo Customer Accounts
| Name | Email | Password | Location | Default Address |
|---|---|---|---|---|
| **Anisur Rahman** | `anis@gmail.com` | `password123` | Uttara Sector 12 | House 14, Road 4, Sector 12, Uttara, Dhaka |

### C. Demo Technician / Worker Accounts
| Name | Email | Password | Primary Skills | Rating | Verification Status |
|---|---|---|---|---|---|
| **Kamrul Islam** | `kamrul@gmail.com` | `password123` | Inverter AC, VRF HVAC, Industrial Electrical | 4.95 / 5.0 | ✅ Verified (Gold) |
| **Tariqul Islam** | `tariq@gmail.com` | `password123` | Dual Split AC, Leak Detection, Duct Cleaning | 4.90 / 5.0 | ✅ Verified (Gold) |
| **Mohammad Rafiq** | `rafiq@gmail.com` | `password123` | Master Plumbing, Deep Pipe Leakage, Geysers | 4.85 / 5.0 | ✅ Verified (Silver) |
| **Sajid Hasan** | `sajid@gmail.com` | `password123` | General Electrical, Switchboards | 4.20 / 5.0 | ⏳ Unverified (Pending Review) |

---

## 3. Storage & Persistence Keys

Client localStorage is strictly partitioned per user identity to prevent cross-account data leaks:
- `fixconnect_user`: Active authenticated session object.
- `fixconnect_notifications_${userId}`: Array of notification objects.
- `fixconnect_saved_workers_${userId}`: Array of saved technician IDs.
- `fixconnect_properties_${userId}`: Customer property profiles.
- `fixconnect_addresses_${userId}`: Customer address book.
- `fixconnect_service_history_${userId}`: Historic completed service logs.
- `fixconnect_transactions_${userId}`: Financial transaction ledger.
- `fixconnect_reviews_${userId}`: Customer submitted reviews.
- `fixconnect_rewards_${userId}`: Loyalty points and tier info.

---

## 4. Key Business Logic Rules

- **Platform Commission**: Default is **10%** (adjustable via Admin Settings).
- **Default Map Tile Layer**: **OpenStreetMap** standard tiles (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Dual OTP Verification**:
  - `startVerificationCode`: Default seed `4829` (4 digits).
  - `completionVerificationCode`: Default seed `9143` (4 digits).
- **Job Status Sequence**: `REQUESTED` → `ACCEPTED` → `IN_PROGRESS` → `COMPLETED` → `PAID`.
