# Proposal: Official Embassy of Lebanon Website + Dynamic Admin Portal

## 1) Project Objective
Build a secure, modern, bilingual (Arabic/English) official embassy platform with:
- A public-facing website for citizens, visitors, and media
- A role-based admin portal for non-technical staff to manage all content

The solution aligns with Lebanese national branding (red, white, cedar green), government-grade security practices, and mobile-first accessibility.

---

## 2) Recommended Technical Approach (Given 4–5 Working Days)

Because the immediate goal is to show solid progress to stakeholders in **4–5 working days**, the fastest practical path is:

### **Phase 1 (Immediate Demo): Next.js Full-Stack + MongoDB** ✅
- **Next.js (React + TypeScript)** for public site + admin portal in one codebase
- **Next.js Route Handlers / Server Actions** as backend APIs
- **MongoDB** for quick schema iteration and rapid setup
- **NextAuth/Auth.js** for secure login and role-based access
- **Tailwind CSS** for responsive UI with Lebanon colors
- **next-intl** for Arabic (RTL) + English (LTR)

### **Phase 2 (Post-Demo Hardening): Optional CMS Upgrade**
- Add **Strapi** only if content team needs richer editorial workflows (versioning, deeper content governance, complex content modeling)
- If current team is small and technical, staying on **Next.js + MongoDB** can remain efficient and lower operational complexity

### Recommendation
For your timeline, **yes—using Next.js for backend and MongoDB instead of PostgreSQL/Strapi is the right choice for now**. It minimizes setup overhead and lets the team deliver visible functionality quickly.

### Does Strapi require extra time and effort?
Yes, **usually 1–3 additional days** in an MVP context (sometimes more), depending on environment readiness.

Typical added effort areas:
- Strapi project setup, plugin configuration, and environment hardening
- Content type modeling and permission matrices (Admin/Editor scopes)
- Media library/storage integration and upload policy setup
- Separate deployment/monitoring lifecycle from the Next.js app
- API contract alignment between Strapi and frontend pages

**Practical guidance for this project:**
- If your top priority is a stakeholder demo in 4–5 days, avoid introducing Strapi in Phase 1.
- If long-term editorial workflows become complex, plan Strapi adoption in Phase 2 with dedicated migration time.

---

## 3) Feature List

### A) Public Website
1. **Homepage**
   - Announcements highlights
   - Quick links to high-demand services
   - Office hours and emergency notice area
2. **About Embassy**
   - Ambassador message
   - Mission and diplomatic role
3. **Services**
   - Visa services
   - Consular services
   - Citizen services
4. **News / Announcements** (list + detail)
5. **Events** (list + detail)
6. **Downloads / Forms Library**
   - Filter by category/language
   - PDF and document downloads
7. **Contact Page**
   - Address, map, phones, emails
   - Validated contact form (anti-spam protection)
8. **Global Language Switcher**
   - Available on every page
   - Preserves equivalent page in selected language

### B) Admin Portal
1. **Secure Admin Login**
2. **Manage Pages, News, Events, Downloads, Announcements**
3. **Upload & Manage Files/Images**
4. **Arabic/English Content Management**
5. **Role-Based Access**
   - Admin: full control
   - Editor: content editing/publishing scope
6. **Publish / Unpublish Workflow**
7. **Basic Activity Logging**

---

## 4) Sitemap (Proposed)

- `/` Home
- `/about`
  - `/about/ambassador-message`
  - `/about/mission`
- `/services`
  - `/services/visa`
  - `/services/consular`
  - `/services/citizen-services`
- `/news`
  - `/news/[slug]`
- `/events`
  - `/events/[slug]`
- `/downloads`
  - `/downloads/[slug]` (optional detail)
- `/contact`
- `/privacy-policy`
- `/terms`

**Multilingual URL model**:
- English: `/en/...`
- Arabic: `/ar/...` (RTL rendering enabled)

---

## 5) Fast-Track Delivery Plan (4–5 Working Days)

### **Day 1: Foundation & Design System**
- Initialize Next.js project and environments
- Implement core layout, header/footer, language switcher shell
- Apply Lebanon color theme and responsive grid

### **Day 2: Public Core Pages**
- Build Home, About, Services, Contact pages
- Add dynamic News, Events, Downloads listing structure
- Implement SEO baseline (metadata, OG tags, localized routes)

### **Day 3: Admin MVP**
- Implement secure login + roles (Admin/Editor)
- Build admin CRUD for News, Events, Downloads, Announcements
- Enable publish/unpublish toggle

### **Day 4: Arabic + QA + Demo Data**
- Add RTL support and Arabic content fields
- Seed realistic demo content from planning/dummy files
- Test responsiveness and critical user flows

### **Day 5 (Optional Buffer): Stabilization & Stakeholder Demo**
- Performance pass (image optimization, caching)
- Security checklist (rate limiting, validation, hardening)
- Prepare demo script and handover notes

---

## 6) Cost Estimate Structure (Budget Framework)

1. Discovery & rapid planning
2. UI/UX and front-end implementation
3. Backend/API and admin portal development
4. Authentication and role permissions
5. Multilingual implementation (EN/AR + RTL)
6. QA, security hardening, and deployment
7. Training and documentation
8. Monthly maintenance retainer

> Commercially, present **MVP (4–5 day demo)** vs **Production Phase (hardening and expansion)** as two separate budget lines.

---

## 7) Maintenance Approach

### Monthly Managed Support
- Security patching and dependency updates
- Uptime monitoring and alerting
- Backups and recovery verification
- Performance and SEO monitoring
- Content model and workflow enhancements

### Governance
- SLA-backed response windows
- Monthly operations summary
- Quarterly roadmap and risk review

---

## 8) Notes from Existing Planning/Dummy Files
The current planning prototypes already cover core public sections such as Home, Ambassador, Consular, Visas, bilateral relations, and Contact, with Lebanon-themed styling and downloadable visa materials. These are suitable as immediate content inputs for the 4–5 day MVP demo.
