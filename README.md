# PolyPrint 🖨️

PolyPrint is an enterprise-grade, multi-role print order provisioning, auditing, and workspace feedback application tailored for educational institutions and structured organizations. Built using **Next.js (App Router)** and **Supabase**, the system manages printing request cycles, tracks budget limits, processes data telemetry via interactive charts, and logs secure infrastructure changes with an immutable auditing engine.

---

## 🌐 Live Application URL

Access the deployment directly at:

**https://poly-print.vercel.app**

---

# 🎯 Project Overview & Core Workflow

PolyPrint streamlines complex print workflows across an organization by implementing a strict, secure hierarchy with explicit cross-role boundaries and custom permissions.

## User Roles

### 👨‍🎓 Students

Students can:

* Upload print assets (PDF/Word)
* Preview automatic price calculations
* Track printing budgets and balances
* Monitor print order progress and statuses

### 👨‍💼 Staff Members

Staff members can:

* Manage assigned student print requests
* Update order statuses and production queues
* Handle print overrides and delivery workflows
* Track operational tasks in real time

### 📊 Line Managers

Line managers can:

* Monitor workspace feedback
* Analyze staff performance metrics
* Filter and review user ratings
* View operational efficiency analytics

### 🛡️ Administrators

Administrators have complete control over the platform, including:

* Invite-based user creation
* Profile and role management
* Full audit log access
* Infrastructure-level management controls

---

# 📁 Repository Directory Structure

```text
.
├── app/                        # Next.js App Router root layout
│   ├── (auth)/                 # Authentication workflows
│   │   ├── login/              # Secure sign-in portal
│   │   ├── setup-password/     # First-time user password provisioning
│   │   └── signUp/             # Account registration gateway
│   │
│   └── (dashboard)/            # Protected dashboard environment
│       ├── analysis/           # Analytics & telemetry dashboards
│       ├── audit-logs/         # Immutable audit logs (Admin only)
│       ├── feedback/           # Staff & manager feedback systems
│       ├── orders/             # Order processing and queue management
│       └── users/              # RBAC user management
│
├── components/                 # Shared and isolated UI components
│   ├── dashboard/              # Dashboard-specific components
│   ├── feedback/               # Rating systems and feedback cards
│   ├── orders/                 # Upload zones, filters, summaries
│   ├── shared/                 # Navbar, alerts, mobile toggles
│   └── ui/                     # Reusable UI primitives
│
├── constants/                  # Pricing rules & configuration values
├── lib/                        # Core business logic and service modules
│   ├── hooks/                  # Custom React hooks
│   └── auth/orders/audit/      # Supabase-connected services
│
├── public/                     # Static assets and SVG branding
├── utils/supabase/             # Supabase utilities and middleware
└── types/                      # TypeScript schema definitions
```

---

# 🛠️ Technology Stack

## Frontend Framework

* **Next.js**
* **React Server Components**
* **TypeScript**
* **App Router**

## Backend & Database

* **Supabase**
* **PostgreSQL**
* **Cookie-based Authentication**

## Styling & UI

* **Tailwind CSS**
* Fully responsive layouts
* Mobile-first design patterns

## Charts & Analytics

* **Recharts**
* Dynamic data visualizations
* Interactive analytics dashboards

## File Processing

* **PDF-Lib**
* **Html2Canvas**
* Client-side document metadata extraction

## Package Manager

* **pnpm**

---

# 🔧 Local Development Setup

Follow these steps to run PolyPrint locally.

## 1️⃣ Clone the Repository

```bash
git clone <your-repository-url>
cd polyprint
```

---

## 2️⃣ Install Dependencies

Ensure that **pnpm** is installed globally.

```bash
pnpm install
```

---

## 3️⃣ Configure Environment Variables

Create a file named `.env.local` in the project root directory.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_high_privilege_admin_service_key
```

---

## 4️⃣ Start Development Server

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

---

## 5️⃣ Production Build

```bash
pnpm build
pnpm start
```

---

# 🔒 Security Architecture

## Role-Based Route Protection

**File:** `lib/auth/SessionGuard.tsx`

* Prevents unauthorized route access
* Protects dashboard segments by role
* Enforces secure rendering boundaries

---

## Immutable Audit Logging

**File:** `lib/audit/logger.ts`

* Tracks critical infrastructure changes
* Logs account modifications
* Records print order activity
* Maintains immutable audit history

---

# 📱 Responsive Design System

PolyPrint uses a fully responsive UI architecture to ensure smooth usability across:

* Desktop devices
* Tablets
* Mobile devices

Responsive techniques include:

```tsx
p-4 sm:p-8
flex-col md:flex-row
min-w-0 truncate
```

The application is optimized for:

* Touch-friendly interactions
* Preventing viewport overflow
* Adaptive dashboard layouts
* Mobile-safe data visualizations

---

# 🚀 Core Features

* Multi-role authentication system
* Secure print order management
* Real-time budget tracking
* Feedback and rating workflows
* Analytics dashboards with charts
* Immutable audit logging
* Responsive UI/UX
* Protected route architecture
* PDF metadata extraction
* Dynamic pricing engine

---

# 📌 Future Improvements

Potential future enhancements for PolyPrint include:

* Email notifications
* Advanced analytics filtering
* File storage optimization
* Exportable audit reports
* AI-assisted printing recommendations
* Multi-campus deployment support

---

# 👨‍💻 Author

Developed by **Hussain Helal**

Built using modern full-stack technologies with a focus on:

* Scalability
* Security
* Performance
* Accessibility
* Enterprise workflow management
