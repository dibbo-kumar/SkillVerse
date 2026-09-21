# 🔐 SkillVerse Demo Accounts & Test Credentials

Use these pre-configured user credentials to log in and test different user roles, capabilities, workflows, and portals across the **SkillVerse** platform.

---

## 📌 Summary of Roles & Portals

| Role | Access URL | Login Method | Purpose |
|---|---|---|---|
| **Administrator** | `http://localhost:5173/admin` | Master Security Key Screen | Review technician NID verification dossiers, manage academy courses, store orders, and audit platform activity |
| **Customer** | `http://localhost:5173/` | Standard Login / Sign In Modal | Search technicians, smart AI diagnostic chat, book services, post custom problems with photos, manage wallet & reviews |
| **Worker / Technician** | `http://localhost:5173/` | Standard Login / Sign In Modal | Accept jobs, submit counter-offers, submit quotes to posted problems, cashout wallet balance, view completed job history |

---

## 1. 🛡️ System Administrator

- **Access URL**: [http://localhost:5173/admin](http://localhost:5173/admin)
- **Master Admin Password**: `admin123` *(or `skillverse2026`)*
- **Associated Email**: `admin@skillverse.com`
- **Phone**: `01711122233`
- **Key Capabilities**:
  - Approve, reject, or request corrections on **Technician Verification Dossiers** (NID, trade certificate, police check, payout details).
  - Add, edit, or delete video courses in **SkillVerse Academy**.
  - Add, manage stock, and fulfill tool orders in **Certified Tool Store**.
  - Monitor live platform stats, safety dispute escalations, and system logs.

---

## 2. 👤 Customer Accounts

### Primary Demo Customer: Anisur Rahman
- **Email**: `anis@gmail.com`
- **Password**: `password123` *(or any password such as `123456`)*
- **Account Type**: `CUSTOMER`
- **Phone**: `01811223344`
- **Address**: `House 14, Road 4, Sector 12, Uttara, Dhaka`
- **Pre-Loaded State**:
  - Pre-registered tracked home appliances (General AC, Samsung Inverter Fridge, Geyser).
  - Pre-loaded addresses (Uttara Residence, Dhanmondi Flat, Gulshan Office).
  - Pre-loaded completed bookings with past reviews & 30-day active warranties.
  - Pre-loaded Reward Points balance: **450 SkillPoints** (Gold Tier).

---

## 3. 🛠️ Worker / Technician Accounts

> 💡 **Login Instructions for Workers**: Click **Sign In**, select **Account Type: 🛠️ Technician / Worker**, and enter the email and password below.

### 🌟 Worker 1: Kamrul Islam (AC Repair & Electrical Specialist)
- **Email**: `kamrul@gmail.com`
- **Password**: `password123` *(or `123456`)*
- **Role**: `WORKER`
- **Verification Status**: ✅ `APPROVED` (NID Verified, 6 Years Experience, Gold Badge)
- **Rating**: 4.8 ⭐ (12+ reviews)
- **Hourly Rate**: ৳450 | **Base Callout Price**: ৳300
- **Skills**: `Electrical, AC Repair, Smart Home`
- **Location**: Sector 11, Uttara, Dhaka

---

### 💧 Worker 2: Mohammad Rafiq (Master Plumber & Pump Specialist)
- **Email**: `rafiq@gmail.com`
- **Password**: `password123` *(or `123456`)*
- **Role**: `WORKER`
- **Verification Status**: ✅ `APPROVED` (NID Verified, 10 Years Experience, Master Badge)
- **Rating**: 4.9 ⭐ (18+ reviews)
- **Hourly Rate**: ৳500 | **Base Callout Price**: ৳350
- **Skills**: `Plumbing, Water Pump Repair, Acoustic Concealed Leak Trace`
- **Location**: Road 9A, Dhanmondi, Dhaka

---

### ⏳ Worker 3: Tanvir Alam (HVAC Technician — Pending Verification)
- **Email**: `tanvir@gmail.com`
- **Password**: `password123` *(or `123456`)*
- **Role**: `WORKER`
- **Verification Status**: 🟡 `UNDER_REVIEW` / `PENDING` (Submitted complete verification dossier)
- **Skills**: `AC Repair & Servicing, Electrical (4 Years Exp)`
- **Location**: Mirpur 10, Dhaka
- **Use Case**: Log in as Admin at `/admin` to approve or review Tanvir's pending dossier.

---

### ⚠️ Worker 4: Jahangir Kabir (Electrician — Correction Required)
- **Email**: `jahangir@gmail.com`
- **Password**: `password123` *(or `123456`)*
- **Role**: `WORKER`
- **Verification Status**: 🟠 `CORRECTION_REQUIRED` (Admin flagged blurred NID back photo)
- **Skills**: `Electrical, Generator Repair (5 Years Exp)`
- **Location**: Farmgate, Dhaka
- **Use Case**: Log in to test the technician dossier re-submission workflow.

---

### ❄️ Worker 5: Tariqul Islam (HVAC Specialist)
- **Email**: `tariq@gmail.com`
- **Password**: `password123` *(or `123456`)*
- **Role**: `WORKER`
- **Skills**: `AC Servicing, Inverter PCB Repair, Refrigeration`

---

### 🆕 Worker 6: Sajid Hasan (Unverified Worker)
- **Email**: `sajid@gmail.com`
- **Password**: `password123` *(or `123456`)*
- **Role**: `WORKER`
- **Verification Status**: ⚪ `UNVERIFIED`
- **Use Case**: Test filling out the 4-step Technician Verification Dossier form from scratch.

---

## ⚙️ Quick Reference Table

| Name | Role | Email | Password | Status |
|---|---|---|---|---|
| **System Admin** | `ADMIN` | `admin@skillverse.com` | `admin123` *(via `/admin`)* | Master Admin |
| **Anisur Rahman** | `CUSTOMER` | `anis@gmail.com` | `password123` | Active Customer |
| **Kamrul Islam** | `WORKER` | `kamrul@gmail.com` | `password123` | Approved Pro (HVAC/Electrical) |
| **Mohammad Rafiq** | `WORKER` | `rafiq@gmail.com` | `password123` | Approved Pro (Plumbing) |
| **Tanvir Alam** | `WORKER` | `tanvir@gmail.com` | `password123` | Pending Admin Approval |
| **Jahangir Kabir** | `WORKER` | `jahangir@gmail.com` | `password123` | Correction Required |
| **Tariqul Islam** | `WORKER` | `tariq@gmail.com` | `password123` | Approved Pro (HVAC) |
| **Sajid Hasan** | `WORKER` | `sajid@gmail.com` | `password123` | Unverified (Fresh) |
