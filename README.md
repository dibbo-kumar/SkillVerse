# 🛠️ SkillVerse — Verified Skills Marketplace & Service Ecosystem

**SkillVerse** is a full-stack, AI-powered verified skills marketplace and on-demand home service platform built for Bangladesh. The ecosystem connects verified technicians with residential and enterprise customers featuring NID document validation, AI price auditing, dual-stage OTP job validation, a vocational skill academy, and an integrated industrial tools store.

---

## 📚 Documentation Index (`/docs`)

Comprehensive documentation is available in the [`docs/`](./docs) folder:

- 🏛️ [**Architecture Guide (`docs/ARCHITECTURE.md`)**](./docs/ARCHITECTURE.md) — System layers, ERD, job state machine, and data flow.
- 📜 [**Rules & Guidelines (`docs/RULES.md`)**](./docs/RULES.md) — Development rules, security constraints, and data isolation protocols.
- 🎨 [**Design System (`docs/DESIGN.md`)**](./docs/DESIGN.md) — UI theme tokens, glassmorphic styling, and component standards.
- 📋 [**Roadmap & Tasks (`docs/TASKS.md`)**](./docs/TASKS.md) — Feature status, completed milestones, and backlog.
- 🧠 [**Project Memory & Cheatsheet (`docs/MEMORY.md`)**](./docs/MEMORY.md) — Demo credentials, ports, and storage keys.
- 🔌 [**REST API Reference (`docs/API_REFERENCE.md`)**](./docs/API_REFERENCE.md) — Complete endpoint reference with payloads.

---

## ⚡ Quick Start

### 1. Backend Service (Spring Boot)
Requires **Java 17+** and **Gradle**:
```bash
cd backend
./gradlew bootRun
```
*Backend runs on `http://localhost:8081`.*

### 2. Frontend Application (React + Vite)
Requires **Node.js 18+**:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Access & Test Credentials

- **Public Platform**: Visit `http://localhost:5173` for the landing page, customer booking, and worker registration.
- **Admin Command Center**: Visit `http://localhost:5173/admin` with Master Password: **`000000`**.
- **Demo Customer**: `anis@gmail.com` (`password123`)
- **Demo Verified Worker**: `kamrul@gmail.com` (`password123`)
