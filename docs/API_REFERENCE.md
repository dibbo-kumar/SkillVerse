# SkillVerse REST API Reference

The SkillVerse backend exposes RESTful endpoints on `http://localhost:8081/api`.

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Request Payload |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (`CUSTOMER` or `WORKER`) | `{ name, email, phone, role, nidNumber, verified }` |
| `POST` | `/api/auth/login` | Authenticate user | `{ email, role }` |
| `GET` | `/api/auth/users/{id}` | Fetch user profile details | None |
| `PUT` | `/api/auth/users/{id}` | Update profile information | `{ name, phone, address, profilePicture, ... }` |

---

## 2. Worker & Profile Endpoints (`/api/workers`)

| Method | Endpoint | Description | Response |
|---|---|---|---|
| `GET` | `/api/workers` | Get all registered workers | List of `WorkerProfile` objects |
| `GET` | `/api/workers/{id}` | Get worker profile by worker ID | `WorkerProfile` object |
| `GET` | `/api/workers/user/{userId}` | Get worker profile by user ID | `WorkerProfile` object |
| `POST` | `/api/workers` | Create or update worker profile | `WorkerProfile` |

---

## 3. Service Booking Endpoints (`/api/bookings`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bookings/customer/{customerId}` | Fetch all bookings created by a customer |
| `GET` | `/api/bookings/worker/{workerId}` | Fetch all bookings assigned to a worker |
| `POST` | `/api/bookings` | Create a new service booking |
| `PUT` | `/api/bookings/{id}/accept` | Worker accepts booking |
| `PUT` | `/api/bookings/{id}/counter-offer` | Worker submits counter-price offer |
| `PUT` | `/api/bookings/{id}/verify-start` | Worker validates customer Start OTP |
| `PUT` | `/api/bookings/{id}/verify-completion` | Worker validates customer Completion OTP |
| `PUT` | `/api/bookings/{id}/pay` | Customer marks payment completed |

---

## 4. Problem Posts & Bidding (`/api/problems`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/problems` | List all active customer problem posts |
| `GET` | `/api/problems/customer/{id}` | List posts created by customer |
| `POST` | `/api/problems` | Broadcast new problem post with budget & images |
| `POST` | `/api/problems/{id}/offers` | Worker submits price bid / offer on post |
| `PUT` | `/api/problems/offers/{offerId}/accept` | Customer accepts offer, auto-generates booking |

---

## 5. Skill Academy Endpoints (`/api/training`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/training/courses` | List all available training courses |
| `GET` | `/api/training/courses/{id}` | Get course with lesson syllabus |
| `POST` | `/api/training/enroll` | Enroll worker into a course |
| `PUT` | `/api/training/progress` | Update lesson completion progress |
| `POST` | `/api/training/courses` | Admin creates new training course |

---

## 6. Tool Store & Orders (`/api/toolstore` & `/api/marketplace`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/toolstore/products` | Browse all tools and equipment |
| `GET` | `/api/toolstore/categories` | List product categories |
| `POST` | `/api/toolstore/orders` | Place a tool store order |
| `GET` | `/api/toolstore/orders/user/{id}`| List orders placed by user |
| `POST` | `/api/toolstore/products` | Admin adds new store product |

---

## 7. Administrative & Setting Endpoints (`/api/admin` & `/api/verification`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/settings` | Get platform configuration (e.g. commission rate) |
| `POST` | `/api/admin/settings` | Update platform configuration |
| `GET` | `/api/verification/pending` | List workers awaiting NID document verification |
| `PUT` | `/api/verification/{id}/approve` | Approve worker verification request |
| `PUT` | `/api/verification/{id}/reject` | Reject worker verification request |
| `GET` | `/api/admin/stats` | System overview stats (revenue, jobs, users) |
