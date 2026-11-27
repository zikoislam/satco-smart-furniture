# SATCO AI Smart Furniture Platform
## Product Requirements Document (PRD)

---

## 1. Document Information

| Field | Value |
| :--- | :--- |
| **Product Name** | SATCO Smart  Platform |
| **Document Type** | Product Requirements Document (PRD) |
| **Document Version** | 1.0.0 |
| **Document Status** | Draft / Ready for Stakeholder Baseline Review |
| **Prepared From / Primary Source** | `SATCO_Final_Project_Blueprint.md` (Version 1.0: Product Vision + Technical Blueprint + Development Roadmap) |
| **Last Updated** | 2026-11-25 |
| **Document Owner** | TBD — Pending Executive Business Appointment (SATCO Project Sponsor) |
| **Lead Authors** | Senior Product Manager, Business Analyst & Software Requirements Architect |
| **Target Audience** | SATCO Executive Leadership, Product Management, UI/UX Engineering, Software Development Team, QA Engineering, Factory Production Management, and Workshop Machine Operators |

### 1.1 Source Document Audit & Missing Files Statement
A rigorous audit of the workspace and repository on 2026-11-25 confirmed the following repository status:
1. **`SATCO_Final_Project_Blueprint.md`** (located at project root, designated as `docs/PROJECT_BLUEPRINT.md` per Section 10/14 of the master plan): **Found and fully analyzed** as the authoritative source for vision, modules, technical architecture, and 36–38 week roadmap.
2. **`Requirements Validation.md`** (located at project root; duplicate copy in `docs/requirements/` removed): **Found and mapped** via `docs/SPEC_AUTHORITY_MATRIX.md` and `docs/TRACEABILITY_MATRIX.md` for validation gates (`WEB-*`, `CFG-*`, `DEC-*`).
3. **`docs/requirements/PROJECT_SCOPE.md`**: **NOT FOUND**. Scope boundaries have been synthesized directly from Blueprint Section 3.
4. **`docs/requirements/USER_ROLES.md`**: **NOT FOUND**. Personas and permission structures have been synthesized from Blueprint Section 2.3 and Section 4.3.
5. **`docs/requirements/ACCEPTANCE_CRITERIA.md`**: **NOT FOUND**. Detailed acceptance criteria have been derived from Blueprint Section 4 module specifications and Section 12 Definition of Done.
6. **Architecture, Manufacturing & CNC Compatibility Documents** (`BOM_RULES.md`, `CUTTING_RULES.md`, `MACHINE_INFORMATION.md`, etc.): **NOT FOUND**. All manufacturing construction formulas, material price rates, and specific CNC protocols (including any Homag references) are designated as **verified CNC pending `DEC-007/008/009`** in `Requirements Validation.md`.

---

## 2. Executive Summary

### 2.1 Product Definition
The **SATCO AI Smart Furniture Platform** is an enterprise-grade, end-to-end digital ecosystem designed to unify the entire lifecycle of custom and modular furniture manufacturing. It connects customer-facing digital showrooms and parametric quotation engines with back-office business administration, multi-stage factory production tracking, automated Bill of Materials (BOM) extraction, panel cutting optimization, edge-banding tracking, barcode labeling, machine file export preparation, and future multi-tenant SaaS capabilities.

### 2.2 Business Problems Addressed
Furniture manufacturing businesses in Saudi Arabia and the broader MENA region face severe operational fragmentation:
- **Disjointed Sales and Production:** Sales staff calculate custom quotes manually or via disconnected spreadsheets, resulting in pricing discrepancies, uncollected margins, and inaccurate delivery estimates.
- **Manual Data Re-Entry:** Customer design preferences are transcribed manually into 2D CAD drawings, re-typed into cutting lists, and manually entered at CNC controllers, generating high scrap rates and dimensional rework.
- **Lack of Inventory & Shop-Floor Visibility:** Raw materials (melamine boards, MDF, veneers, edge-bands, functional hardware) are tracked via informal logs without real-time reservations against active jobs.
- **High Wastage in Panel Slicing:** Manual sheet cutting layouts without algorithmic optimization lead to excessive material waste, eating into gross margins.

### 2.3 Target Users and Beneficiaries
The platform serves retail and commercial furniture buyers, sales consultants, factory production supervisors, warehouse storekeepers, machine operators, company administrators, and platform SaaS administrators.

### 2.4 Primary Business Value
- **Accelerated Revenue Velocity:** Instant quotation and visual configuration convert prospective enquiries into approved sales orders rapidly.
- **Zero Arithmetic Drift:** Strict mathematical linkage between approved customer specifications, parametric pricing rules, and manufacturing part geometry.
- **Yield Optimization:** Algorithmic cutting lists and sheet nesting minimize board offcuts and scrap.
- **Factory Execution Integrity:** Barcode-tracked shop-floor progression ensures real-time accountability from raw board sizing to final packaging.
- **SaaS Scalability:** Future-proof multi-tenant architecture enables SATCO to commercialize the platform for third-party furniture fabricators.

### 2.5 Core Product Principle
> **"One platform — connected customer, business, and factory operations."**

The platform enforces strict architectural separation across three distinct operational layers:
1. **Customer-Facing Visual Configuration:** Interactive UI representation designed for aesthetics, customer options, and sales engagement.
2. **Approved Manufacturing Specifications:** Engineering-grade, verified mathematical definitions comprising validated dimensions, product-specific joinery rules, verified material thicknesses, edge-banding offsets, and approved BOM revisions.
3. **Machine-Specific Production Instructions:** Post-processed, verified G-code/CAM instructions tailored strictly to vendor-confirmed CNC controllers and tooling.

**Golden Guardrail:** *Under no circumstances shall a visual preview, customer sketch, or AI-generated room concept be treated as manufacturing-ready data until dimensions, materials, construction rules, and production specifications have been formally validated and approved by authorized personnel.*

---

## 3. Product Vision and Goals

### 3.1 Product Vision
To build a modular, scalable, and resilient digital operating system that powers custom furniture manufacturing from the initial moment of customer inspiration to the final automated CNC cut and customer installation.

### 3.2 Business Goals
1. Establish a modern, responsive, bilingual (Arabic RTL / English LTR) digital brand presence in the Saudi furniture market.
2. Automate custom furniture pricing to guarantee consistent profitability margins while eliminating quote turnaround bottlenecks.
3. Standardize and automate furniture manufacturing data preparation (BOMs, cut lists, edge-banding callouts) to reduce human engineering overhead.
4. Digitize factory floor operations with granular job dispatching, material reservation, and stage-by-stage status tracking.
5. Provide a safe, staged pathway toward CNC integration without endangering factory machinery or personnel.
6. Enable a multi-tenant SaaS architecture in later phases to monetize software capabilities across independent furniture makers.

### 3.3 User Goals
- **Customers:** Effortlessly discover, customize, price, and track premium bespoke furniture with localized cultural aesthetics.
- **Sales Staff:** Rapidly configure valid furniture specifications, issue transparent binding quotations, and track order conversion.
- **Production Managers:** Receive pre-validated, unalterable production job orders, review automated BOMs, approve cutting plans, and balance floor capacity.
- **Factory Operators:** Receive unambiguous digital cut lists and scannable barcode labels detailing exact dimensions, edge-banding edges, and routing references.
- **Company Executives:** Access real-time reporting on revenue, gross margins, material stock levels, cutting waste percentages, and factory throughput.

### 3.4 Measurable Success Metrics / KPIs

| KPI ID | Metric Name | Blueprint Baseline | Proposed Measurement Methodology | Target Status |
| :--- | :--- | :--- | :--- | :--- |
| **KPI-001** | Standard Quote Turnaround Time | Not specified | Timestamp difference between `Enquiry.created_at` and `Quotation.sent_at` | **Target TBD — Proposed: < 2 Hours** |
| **KPI-002** | Parametric Pricing Calculation Speed | Instantaneous | Server execution latency for `PricingEngine.calculate()` API call | **Target TBD — Proposed: < 300 ms** |
| **KPI-003** | Panel Cutting Waste Percentage | Minimize scrap | Total sheet area minus total placed part area divided by total sheet area | **Target TBD — Proposed: < 12% on standard sheet stock** |
| **KPI-004** | Dimensional Rework & Scrap Rate | Zero engineering drift | Ratio of scrap parts logged at Assembly/QC due to dimensional error | **Target TBD — Proposed: 0% dimensional errors from approved BOM** |
| **KPI-005** | Production Specification Lead Time | Not specified | Duration from `Order.approved_at` to `CuttingPlan.approved_at` | **Target TBD — Proposed: < 24 Hours** |
| **KPI-006** | Platform High Availability | Mission-critical | Uptime monitoring during Saudi business hours (08:00–20:00 AST) | **Target TBD — Proposed: 99.5% uptime** |
| **KPI-007** | Inventory Stock Variance | Auditable transactions | Discrepancy between physical stock counts and `StockBalance` ledger | **Target TBD — Proposed: < 1.0% inventory discrepancy** |

---

## 4. Problem Statement and Business Context

### 4.1 Current State & Operational Friction
Furniture manufacturing operations typically suffer from disconnected software silos and manual data handoffs:
- **Customer Desync:** Customers request furniture based on vague dimensions. Sales staff quote prices based on crude volumetric estimates ($W \times H \times D$) that ignore internal partition count, drawer runners, edge-banding linear meters, and hinge quantities.
- **Manual Data Duplication:** Sales records customer data on paper/messaging apps -> Estimator types data into Excel -> Drafter re-draws cabinet in CAD -> Factory supervisor manually creates cutting paper lists -> Machine operator inputs sizes into the panel saw. Every transcription point introduces risk of human error.
- **Material Leakage:** Raw boards are cut without prior reservation. High-value boards (e.g., imported acrylic or synchronized melamine) run out unexpectedly, halting active assembly lines.
- **Black-Hole Shop Floor:** Once an order enters the workshop, sales staff and customers have zero visibility into whether boards are cut, banded, drilled, assembled, or packed.

### 4.2 Information Continuity Architecture
The platform establishes a **Single Source of Truth** where data flows downstream without re-keying:
```
[Customer Web Configurator]
            │
            ▼
   [Parametric Quote Engine] ──(Price Rule Versioned)
            │
            ▼
     [Approved Sales Order]
            │
            ▼
   [Traceable Production Job]
            │
            ├──► [Versioned BOM & Parts Engine]
            │          │
            │          ▼
            ├──► [Panel Cutting Optimizer] ──► [Barcode / QR Labels]
            │          │
            │          ▼
            ├──► [Manual CNC Export Review] ──► [Machine Import / Cut]
            │
            ▼
 [Shop-Floor Stage Progression (Cut -> Band -> Route -> Assemble -> QC -> Pack)]
```

### 4.3 Discovery Required Declarations
*The following baseline parameters are currently undefined in the project blueprint and require formal on-site discovery:*
- **DISC-001:** Baseline audit of existing SATCO sales volume, average quotes per week, and historical order conversion rates.
- **DISC-002:** Historical material scrap rates across panel saw and edge-bander machines.
- **DISC-003:** Exact make, model, year, controller type, and software version of all existing factory panel processing machinery.

---

## 5. Target Users and Personas

### 5.1 Persona Overview Table

| Persona Role | User Category | Primary Goals | Main Platform Activities | System Access Level | Pain Points (Status) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Customer** | External B2C / B2B | Browse catalogue, customize dimensions, obtain reliable quote, track order progress | Product browsing, 3D preview, dimension input, enquiry submission, order status tracking | Public Web & Authenticated Customer Portal | Inaccurate pricing, uncertain lead times, inability to visualize finishes *(Validated)* |
| **Sales Staff** | Internal Commercial | Rapidly process enquiries, generate binding quotes, manage client revisions, close orders | Review enquiry queue, adjust allowable discounts, issue quotes, trigger order conversion | Sales Management Module (`quotes.*`, `orders.*`, `products.read`) | Repetitive manual quoting, calculation errors, lack of visibility into factory lead time *(Validated)* |
| **Company Admin** | Internal Leadership | Oversee business operations, manage margins, govern user access, monitor company KPI health | User management, pricing rule authoring, financial rate card updates (`rates.write`), material catalog oversight (`materials.write`), discount overrides, audit review, catalog publishing | Full Tenant Administration (`*.*` scoped to tenant) | Lack of unified business visibility, pricing leakage, unauthorized discounts *(Validated)* |
| **Production Manager** | Factory Operations | Plan factory capacity, approve production specs, issue jobs, monitor floor bottlenecks | Spec review, BOM revision approval, job assignment, cutting plan release, QC tracking | Production Management Module (`production.*`, `bom.*`, `cutting.*`, `cnc.approve`) | Incomplete drawings from sales, material stockouts during runs, lack of stage accountability *(Validated)* |
| **Store / Inventory Staff** | Factory Warehouse | Maintain accurate stock counts, receive raw goods, issue materials to jobs, track offcuts, manage physical material specs | Log goods received, execute job material issue, record scrap/returns, run stock counts, maintain physical substrate catalog (`materials.write`). *Strictly excluded from financial rate cards and pricing formulas.* | Inventory & Material Catalogue Module (`inventory.*`, `materials.*`, `rates.read` [read-only for valuation]; `rates.write` is strictly prohibited) | Manual tally sheets, surprise stockouts, unrecorded offcut scrap, unaccounted consumption *(Validated)* |
| **Factory Operator** | Workshop Floor | Execute assigned manufacturing stage (cut, band, drill, assemble, pack), scan part labels | View station queue, scan part barcodes, advance job stages, report part defect/scrap | Shop-Floor Mobile/Tablet View (`production.update`, `inventory.adjust`) | Illegible paper cutting sheets, ambiguous part labeling, missing edge callouts *(Validated)* |
| **SaaS Super Admin** | Platform SaaS Owner | Manage multi-company tenants, monitor system health, govern subscriptions and platform tiers | Tenant provisioning, plan limit configuration, global system settings, audit monitoring | Platform-Wide Super Admin (`platform.superadmin`) | Managing separate codebases or databases for multiple client companies *(Validated)* |
| **Read-Only Report User** | Auditing / Executive | Monitor business performance, evaluate margins, verify compliance and stock balances | Generate operational reports, export audit logs, review financial/margin trends | Read-Only Reporting Access (`reports.view`, `audit.view`) | Reliance on compiled manual spreadsheets with delayed metrics *(Validated)* |
| **Field Installer / Technician** | In-House Operations | Transport packed furniture, verify on-site room readiness, assemble custom units, collect digital customer handover sign-off | Inspect assigned delivery manifests, log installation start/finish, record on-site damage/RMA photos, capture customer digital e-signature | Field Installation Mobile App (`installation.read`, `installation.update`, `handover.signoff`) | Lack of site readiness proof, verbal customer disputes, unrecorded installation damage *(Validated)* |

---

## 6. Product Scope

### 6.1 In-Scope Overview by Release

```
Release 1: Core Furniture Business Platform
├── Public Responsive Website (Arabic RTL / English LTR)
├── Product Catalogue & Category Hierarchy
├── Custom Furniture Parametric Configurator
├── Material, Board & Hardware Rate Management
├── Versioned Pricing & Quotation Engine
├── Customer Enquiry & Sales Workflow
├── Admin Portal & RBAC (Role-Based Access Control)
├── Basic Production Jobs & Stage Tracking
├── Inventory Management & Auditable Stock Movements
└── Operational Reports & Audit Logs

Release 2: Manufacturing Data and CNC Preparation
├── Product-Specific Versioned Furniture BOM Engine
├── Parametric Parts Generator (Raw vs. Finished Sizes)
├── Board & Panel Dimension Calculations
├── Algorithmic Cutting Lists & Optimizer (Kerf, Trim, Grain)
├── Edge-Banding Specification & Length Takeoff
├── Scannable Barcode / QR Label Engine
├── Machine-Independent Production Data Export Framework
├── Secure Human-in-the-Loop Approval Workflow
└── Manual Machine-Software Import/Export Bridge

Release 3: 3D, AI and AR Experiences
├── WebGL 3D Furniture Configurator (Three.js / React Three Fiber)
├── Hard-Constrained Parametric Dimension Manipulation
├── AI-Assisted Room Concept Visualizer (Advisory Only)
├── Mandatory Customer Measurement Confirmation Flow
├── Visual Product Matching against SATCO Catalogue
├── WebXR / Device-Native AR Furniture Placement
└── Graceful 3D Fallback for Unsupported Mobile Hardware

Release 4: Machine Bridge and Multi-Tenant SaaS
├── Controlled Local Factory PC Bridge Service
├── Vendor-Verified CNC Machine Adapters (e.g., Homag CNC)
├── Two-Way Job Status Synchronization (Where supported)
├── Multi-Tenant Database Architecture & Server-Side Tenant Scoping
├── SaaS Tiering, Feature Limits & Subscription Lifecycle
├── Payment Gateway Abstraction & Webhook Reconciliation
└── Multi-Tenant Global Super-Admin Console
```

### 6.2 Out-of-Scope (All Releases)
- Direct, unreviewed automated execution of machine tools over public networks.
- Full corporate double-entry general ledger accounting (the platform provides pricing, quotations, and invoice metadata; integration with external ERP/accounting systems is deferred).
- Generic consumer-to-consumer furniture marketplace features.
- Automated generation of production specifications directly from AI imagery without human parametric validation.

### 6.3 Future Scope (Post-Release 4)
- IoT vibration, spindle load, and tool wear telemetry from smart CNC routers.
- Computer-vision-assisted automated part sorting at factory offload tables.
- Multi-factory distributed production routing across geographically separated manufacturing plants.

### 6.4 Dependencies
- Timely supply of verified SATCO brand assets, product photography, and approved copy in Arabic and English.
- Formal provision of standard board sheet stock dimensions, core board material specs, and hardware unit rates.
- Certified cabinet joinery construction formulas and engineering rules.
- Access to factory floor machinery (specifically the Homag CNC router/saw) for controller, software, and format verification.

### 6.5 Architectural & Engineering Constraints
- **Architecture Baseline:** Modular monolith first; clean domain boundaries prior to any microservice decomposition.
- **Technology Stack:** Next.js (App Router), TypeScript, Tailwind CSS, PostgreSQL, Prisma ORM.
- **Financial Arithmetic:** Exact decimal types (`Prisma.Decimal` / `NUMERIC(12, 4)`) for all financial, currency, and rate data. Zero floating-point representation.
- **Dimensional Normalization:** All internal dimensional calculations executed in exact millimeters (`mm`). Explicit units declared on every interface.
- **Security Constraint:** Air-gapped / local firewall protection for all CNC machine controllers. Machine controllers shall never be assigned public IP addresses or exposed to the public Internet.

### 6.6 Formal Project Assumptions & Operating Environment Registry
1. **In-House Logistics & Assembly Fleet:** SATCO operates its own dedicated in-house delivery vehicles and assembly technicians in the Jeddah metropolitan area. Third-party logistics are used only for regional line-haul transit outside Jeddah.
2. **Material Sample Box Policy:** Prospective customers may request a physical material sample box online. The kit is available for free pickup at the SATCO factory or central showroom; home courier delivery requires a nominal deposit (e.g., $100\text{ SAR}$) that is 100% credited against any subsequent furniture order exceeding $5,000\text{ SAR}$ (`BR-SMP-001`).
3. **Structured & Configurable Warranty Terms:** SATCO custom furniture carries a configurable warranty: standard 2-year structural warranty on core board substrates/joinery, and 1-to-2 year mechanical warranty on functional hardware (hinges, drawer slides, lift stays). Administrative settings govern exact warranty duration per product category (`BR-WAR-001`).
4. **Air-Gapped Manufacturing Floor Baseline:** Factory CNC machines (Homag Industrial CNC) run inside an isolated local workshop subnet (LAN/WLAN). Communication from cloud platform to machine controllers relies on local Factory PC Bridge services or manual USB/SMB import, ensuring zero public internet vulnerability.
5. **Localization & Financial Standards:** Base operating currency is Saudi Riyal (`SAR`), standard tax is 15% ZATCA VAT, internal dimensional metric is integer millimeters (`mm`), and phone numbers follow Saudi E.164 (`+9665xxxxxxxx`).
6. **Hardware-Decoupled Production Data:** BOM generation and panel cutting optimization are completely machine-independent; CAM post-processors for Homag woodWOP / MPR are swappable without altering upstream business logic.

---

## 7. Release Strategy and Priorities

### 7.1 Release 1 — Core Furniture Business Platform (Target: Weeks 1–12)
- **Objective:** Establish the commercial and operational core: drive online customer engagement, automate parametric quotation, and run core factory job tracking and inventory movements without requiring direct CNC machine integration.
- **Target User Value:** Eliminates quoting bottlenecks, unifies pricing rules, provides complete inventory stock movement auditability, and allows factory supervisors to track jobs digitally.
- **Core Modules Included:** Website & Catalogue, Parametric Configurator, Pricing Engine, Enquiry & Quotation Management, Admin RBAC, Basic Production Jobs, Inventory Stock Ledger, Operational Reports.
- **Dependencies:** Brand identity guidelines, product catalog data, material rate cards, localized translation strings.
- **Exit / Acceptance Criteria:**
  1. Customer can browse bilingual catalog, configure allowable dimensions, and submit an enquiry.
  2. Pricing engine deterministically computes quotes using versioned rules and handles missing rates by outputting "Request a Quote".
  3. Sales staff can revise, approve, and convert quotes into sales orders.
  4. Inventory ledger records every receipt, issue, return, and adjustment as a separate auditable transaction.
  5. Production jobs are created from approved orders and advanced across standard stages with user timestamps.
- **Known Risks:** Delays in obtaining verified material rate cards and bilingual translation assets from business stakeholders.

### 7.2 Release 2 — Manufacturing Data and CNC Preparation (Target: Weeks 25–28)
*Note: Preceded by Week 25 CNC Discovery & Compatibility Audit.*
- **Objective:** Bridge commercial orders to physical manufacturing by generating verified BOMs, parametric parts lists, panel cutting lists, optimization plans, edge-banding schedules, barcode labels, and clean export files for manual machine software import.
- **Target User Value:** Eliminates manual CAD redrawing and paper cutting lists; provides shop-floor operators with scannable barcode labels; minimizes sheet scrap.
- **Core Modules Included:** Furniture BOM Engine, Parts Generator, Cutting List & Optimization, Edge-Banding Engine, Barcode/QR Generator, Export Framework, Manual Machine-Software Workflow.
- **Dependencies:** Approved cabinet construction joint formulas, standard board dimensions, saw kerf and trim specs, machine controller discovery data.
- **Exit / Acceptance Criteria:**
  1. Test cabinet configurations generate accurate part counts, raw sizes, finished sizes, and edge-banding assignments.
  2. Cutting optimizer accounts for sheet trim, saw blade kerf, and grain direction restrictions without exceeding usable sheet boundaries.
  3. Barcode labels print cleanly with unique part identifiers and stage routing.
  4. Machine export files pass schema validation and require human review/approval before release to the workshop floor.
- **Known Risks:** Ambiguity in construction joint rules (e.g., dowel vs. screw vs. minifix offsets) leading to rework if unverified.

### 7.3 Release 3 — 3D, AI and AR Experiences (Target: Weeks 13–24)
- **Objective:** Elevate customer discovery through interactive 3D product customization, AI-assisted room design concept generation, and device-native augmented reality previews.
- **Target User Value:** Increases customer engagement and purchase confidence while maintaining strict separation between visual approximations and engineering specifications.
- **Core Modules Included:** WebGL 3D Configurator, 3D Dimension Constraint Guardrails, AI Room Concept Generator, Customer Room Measurement Confirmation, WebXR / Native AR Preview, 3D Fallback.
- **Dependencies:** Low-poly 3D glTF/GLB models matching approved furniture catalog, AI vision/generative provider API credentials, WebXR compatibility testing.
- **Exit / Acceptance Criteria:**
  1. 3D viewer renders parametric models accurately within approved dimensional boundaries.
  2. AI room generator explicitly watermarks concepts as "Advisory Suggestions" and mandates explicit customer confirmation of real room dimensions before quotation.
  3. AR preview displays models at 1:1 scale on supported iOS (Quick Look) and Android (Scene Viewer / WebXR) devices with graceful fallback to 3D for unsupported browsers.
- **Known Risks:** High polygon counts degrading mobile web performance; customer misinterpreting AI visual concepts as structural promises.

### 7.4 Release 4 — Machine Bridge and Multi-Tenant SaaS (Target: Weeks 29–36+)
- **Objective:** Securely connect factory workshop machines via a controlled Factory PC Bridge and transition the platform into a commercial-grade, multi-tenant SaaS application with subscription billing.
- **Target User Value:** Eliminates USB drive file shuffling for machine operators; opens a recurring software revenue model for SATCO.
- **Core Modules Included:** Local Factory PC Bridge Service, Verified CNC Machine Adapter, Bi-directional Job Status Sync, Multi-Tenant Data Isolation, SaaS Plans & Usage Enforcement, Billing & Payment Gateway, SaaS Super-Admin Dashboard.
- **Dependencies:** Confirmed physical access to factory CNC network, vendor software API/directory protocol documentation, payment gateway merchant account.
- **Exit / Acceptance Criteria:**
  1. Factory PC Bridge transfers approved files over secure local network without exposing machine controllers to the public internet.
  2. Automated test suite proves 100% server-side tenant isolation with zero data leakage across company accounts.
  3. Subscription tier limits (users, storage, jobs) are strictly enforced at the API layer.
  4. Payment webhooks correctly update subscription state and manage account provisioning.
- **Known Risks:** CNC vendor software locking out external file import; complex network configurations in factory environments.


---

## 8. Functional Requirements

### Module 1: Customer Website and Product Catalogue

#### `FR-WEB-001`: Responsive Bilingual Homepage and Navigation
- **Module:** Customer Website and Product Catalogue
- **Requirement Title:** Responsive Bilingual Homepage and Navigation Shell
- **Description:** Provide a fully responsive public portal with dynamic English (LTR) and Arabic (RTL) navigation, showcasing featured collections, custom furniture value propositions, and direct links to product categories.
- **Actor:** Public Customer (Guest or Authenticated)
- **Priority:** Must Have
- **Preconditions:** Application deployed; system settings configured with default locale.
- **Main Flow:**
  1. User accesses the root URL.
  2. System detects browser language or loads default locale (Arabic for SA locale, English otherwise).
  3. UI renders brand banner, featured categories, custom order CTA, and language switcher.
  4. User clicks language toggle (EN <-> AR); UI shifts layout direction (`dir="rtl"` vs `dir="ltr"`) dynamically without page reload.
- **Alternate / Error Flow:**
  - Network timeout loading assets: Display localized fallback skeleton with retry button.
- **Business Rules:** `BR-LOC-001` (Bilingual parity), `BR-LOC-002` (RTL alignment integrity).
- **Acceptance Criteria:**
  - Layout renders correctly without horizontal scrollbars on mobile (360px), tablet (768px), and desktop (1440px).
  - Switching to Arabic immediately mirrors navigation drawer, typography, and form alignment.
- **Release:** Release 1
- **Dependency:** SATCO brand assets and approved Arabic typography.
- **Source Reference:** Blueprint Section 4.1 & Section 9 (Day 1, 8, 9).

#### `FR-WEB-002`: Product Catalogue Browsing, Filtering and Search
- **Module:** Customer Website and Product Catalogue
- **Requirement Title:** Parametric Product Listing, Search, and Category Filtering
- **Description:** Allow users to browse active furniture collections, filter by category (e.g., Wardrobes, Kitchen Cabinets, Office Desks), search by keyword, and sort by price/popularity.
- **Actor:** Public Customer
- **Priority:** Must Have
- **Preconditions:** Products published by Company Admin in active catalogue.
- **Main Flow:**
  1. User navigates to `/products`.
  2. System queries database for products where `status = 'PUBLISHED'`.
  3. User filters by Category or types keyword in search box.
  4. System updates product grid displaying thumbnail, title, dimension range, and base starting price.
- **Alternate / Error Flow:**
  - No matching products found: Display "No products found" message with a prompt to submit a custom bespoke enquiry.
- **Business Rules:** `BR-CAT-001` (Unpublished products must never be publicly accessible).
- **Acceptance Criteria:**
  - Search query executes within 300ms for up to 5,000 catalogue items.
  - Draft or archived items are completely excluded from public SQL/ORM queries.
- **Release:** Release 1
- **Dependency:** `FR-CAT-001` (Category and Product CRUD).
- **Source Reference:** Blueprint Section 4.1.

#### `FR-WEB-003`: Product Detail Page (PDP)
- **Module:** Customer Website and Product Catalogue
- **Requirement Title:** Comprehensive Product Detail Presentation
- **Description:** Display high-resolution product imagery, localized description, technical specifications, standard dimension limits ($W_{min}\dots W_{max}$, $H_{min}\dots H_{max}$, $D_{min}\dots D_{max}$), available core materials, and CTA to launch custom configurator.
- **Actor:** Public Customer
- **Priority:** Must Have
- **Preconditions:** Product is published.
- **Main Flow:**
  1. User selects a product card from the catalogue.
  2. System renders PDP with gallery, specification table, and "Customize This Piece" button.
- **Alternate / Error Flow:**
  - Product slug invalid or archived: System returns 404 page with link to active catalogue.
- **Business Rules:** `BR-CAT-001`.
- **Acceptance Criteria:**
  - SEO metadata (OpenGraph tags, localized schema.org markup) dynamically injected.
  - Images served in modern compressed formats (WebP/AVIF) with lazy-loading.
- **Release:** Release 1
- **Dependency:** `FR-WEB-002`.
- **Source Reference:** Blueprint Section 4.1.

#### `FR-WEB-006`: Google Analytics 4 (GA4) & E-Commerce Data Layer Standard
- **Module:** Customer Website and Product Catalogue
- **Requirement Title:** Asynchronous E-Commerce Data Layer & GA4 Measurement Protocol Integration
- **Description:** Implement a standardized, asynchronous client-side `window.dataLayer` event bus paired with server-side GA4 Measurement Protocol tracking to monitor the end-to-end customer discovery, customization, and conversion journey across the Next.js storefront and 3D configurator.
- **Actor:** Customer, Marketing Analyst, System (Automated)
- **Priority:** Must Have (Release 1)
- **Preconditions:** Storefront and configurator loaded on client device.
- **Main Flow:**
  1. System fires standardized e-commerce data layer events on key interactions: `view_item_list`, `view_item`, `customize_dimension`, `select_material`, `begin_checkout`, `generate_lead`, `purchase`.
  2. For high-ticket quote submissions and order deposits, server-side GA4 Measurement Protocol dispatches cryptographically verified macro-conversion events with anonymized user IDs.
- **Alternate / Error Flow:**
  - Client ad-blocker disables GTM: Server-side tracking catches macro events (quote request, deposit paid) independently, ensuring 100% conversion accounting.
- **Business Rules:** `BR-SEC-004` (Saudi PDPL privacy compliance - zero raw PII in analytics payloads).
- **Acceptance Criteria:**
  - GA4 DebugView validates events matching Google Enhanced Ecommerce schema.
  - Custom parameters (`dimension_w`, `dimension_h`, `dimension_d`, `material_finish`) correctly mapped without slowing UI thread.
- **Release:** Release 1
- **Dependency:** `FR-WEB-001`, `FR-CFG-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 1.1 & 1.2.

#### `FR-WEB-007`: Verified Customer Reviews and Photo Upload System
- **Module:** Customer Website and Product Catalogue
- **Requirement Title:** Post-Delivery Verified Buyer Reviews with Photo Moderation
- **Description:** Enable customers whose furniture orders have reached `DELIVERED` status to submit verified ratings (1–5 stars), written feedback, and real-world installation photos, backed by an administrative moderation queue adhering to Saudi cultural privacy norms.
- **Actor:** Customer, Marketing / Content Moderator
- **Priority:** Should Have (Release 1)
- **Preconditions:** Order status is `DELIVERED`; customer accesses review form via authenticated single-use token sent via SMS/Email.
- **Main Flow:**
  1. Customer rates product, inputs Arabic/English comments, and uploads high-resolution installation photos.
  2. Review enters `PENDING_MODERATION` queue.
  3. Moderator inspects photo for family privacy/cultural compliance and approves review.
  4. Review renders on Product Detail Page with a **"Verified SATCO Buyer"** badge and updates Google Rich Snippet `AggregateRating` schema.
- **Alternate / Error Flow:**
  - Non-verified buyer attempts review submission: Direct submission blocked; only verified purchasers can leave public feedback.
- **Business Rules:** `BR-SEC-004` (PDPL compliance; family privacy protection).
- **Acceptance Criteria:**
  - Only delivered orders generate review tokens.
  - Approved reviews immediately update PDP aggregate score.
- **Release:** Release 1
- **Dependency:** `FR-ORD-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 4.1.

#### `FR-SMP-001`: Material Sample Box Request & Factory/Showroom Pickup Protocol
- **Module:** Customer Website and Product Catalogue
- **Requirement Title:** Physical Swatch Kit Request, Pickup Selection, and Conditional Deposit
- **Description:** Allow prospective customers to order physical material sample boxes (core boards, acrylic/melamine finishes, edge-banding samples) online prior to placing high-ticket custom orders, offering free pickup at SATCO factory/showroom locations or courier delivery with a conditional deposit (e.g., $100\text{ SAR}$) 100% credited against subsequent furniture orders exceeding $5,000\text{ SAR}$.
- **Actor:** Customer, Sales Staff, Storekeeper
- **Priority:** Should Have (Release 1)
- **Preconditions:** Customer browsing website or customizer.
- **Main Flow:**
  1. Customer clicks "Request Material Sample Box" on PDP or Configurator.
  2. Customer selects up to 5 material swatches and chooses delivery method:
     - *Option A:* Free Self-Pickup at SATCO Factory (Industrial City, Jeddah) or Showroom.
     - *Option B:* Courier Delivery with conditional $100\text{ SAR}$ deposit paid via mada/Apple Pay (`BR-SMP-001`).
  3. System creates a `SampleBoxRequest` record and issues SMS pickup/tracking pass.
  4. When customer places a custom furniture order, system automatically credits the deposit toward the order total.
- **Alternate / Error Flow:**
  - Sample stock depleted: Storekeeper updates sample availability; system disables depleted swatches.
- **Business Rules:** `BR-SMP-001` (Sample deposit refund threshold).
- **Acceptance Criteria:**
  - Generating sample voucher correctly credits against final furniture sales order.
- **Release:** Release 1
- **Dependency:** `FR-MAT-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 3.1.

---

### Module 2: Product Category and Product Management

#### `FR-CAT-001`: Product and Category Admin CRUD
- **Module:** Product Category and Product Management
- **Requirement Title:** Hierarchical Category and Product Administration
- **Description:** Allow authorized Company Admins to create, edit, translate, publish, and archive categories and products, including setting allowable parametric dimension bounds.
- **Actor:** Company Admin
- **Priority:** Must Have
- **Preconditions:** User authenticated with `products.write` permission.
- **Main Flow:**
  1. Admin opens Admin Products console.
  2. Admin inputs bilingual titles, category hierarchy, SKU prefix, standard construction template reference, and allowable dimensional boundaries ($W, H, D$).
  3. Admin uploads product images and saves draft.
  4. Admin toggles status to `PUBLISHED`.
- **Alternate / Error Flow:**
  - Required fields missing or min dimension exceeds max dimension: Server rejects payload with validation errors.
- **Business Rules:** `BR-SEC-001` (Server-side RBAC), `BR-MFG-003` (Dimensional constraint validation).
- **Acceptance Criteria:**
  - Server validates $W_{min} \le W_{default} \le W_{max}$ before persisting.
  - Changes logged to audit ledger.
- **Release:** Release 1
- **Dependency:** `FR-AUTH-002` (RBAC).
- **Source Reference:** Blueprint Section 4.1 & 4.3.

#### `FR-CAT-002`: Dynamic Product Feed Engine for Google Merchant & Social Catalogs
- **Module:** Product Category and Product Management
- **Requirement Title:** Automated XML/JSON-LD Dynamic Catalog Syndication (Google, Meta, TikTok)
- **Description:** Generate automated, localized XML (Google RSS 2.0 / Atom) and JSON product feeds reflecting live published furniture models, starting-from parametric price calculations, primary gallery renders, stock availability, and Arabic/English titles for omnichannel ad campaigns.
- **Actor:** System (Automated), Marketing Manager
- **Priority:** Should Have (Release 2)
- **Preconditions:** Published products exist in catalog with approved default configurations.
- **Main Flow:**
  1. System compiles feed endpoints: `/api/feeds/google-merchant.xml` and `/api/feeds/meta-catalog.xml`.
  2. Feed includes required Google Merchant tags: `<g:id>`, `<g:title>`, `<g:description>`, `<g:link>`, `<g:image_link>`, `<g:price>` (in SAR), `<g:availability>`, `<g:brand>` (SATCO), and `<g:condition>` (new).
  3. Dynamic pricing reflects standard minimum baseline price computed by active `PricingRuleVersion`.
  4. Endpoints are cached on Cloudflare/CDN with a 6-hour TTL and revalidated on product catalog mutation.
- **Alternate / Error Flow:**
  - Product archived or unpublished: Immediately purged from feed generation.
- **Business Rules:** `BR-CAT-001` (Only published items in feed), `BR-PRICE-003` (No zero prices in feeds).
- **Acceptance Criteria:**
  - Google Merchant Center feed validator reports 0 fatal errors.
  - Feed generation completes in $< 1.5\text{ seconds}$ for 1,000 SKUs.
- **Release:** Release 2
- **Dependency:** `FR-CAT-001`, `FR-PRC-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 1.3.

#### `FR-CAT-003`: Enterprise Product Information Manager (PIM)
- **Module:** Product Category and Product Management
- **Requirement Title:** Multi-Dimensional Variant Management, Step Spans, and Raw Board Mapping
- **Description:** Provide merchandisers and factory engineers with an advanced Product Information Management interface to configure complex multi-dimensional finish/hardware variant matrices, set structural step span rules (e.g. shelf spans $> 900\text{ mm}$ force partition), link catalog items to warehouse raw boards (`FR-MAT-002`), and support bulk Excel template imports.
- **Actor:** Product Manager, Factory Engineering Specialist
- **Priority:** Should Have (Release 1)
- **Preconditions:** User authenticated with `products.write` permission.
- **Main Flow:**
  1. Product Manager opens PIM console, selects furniture category (e.g. "Walk-in Closets").
  2. Manager defines allowable carcass substrate options, door profile variations, and edge-banding combinations.
  3. Manager configures structural engineering formulas and joins them to factory BOM rules (`FR-BOM-001`).
  4. Changes are saved as a new versioned catalog template with full change audit logging.
- **Alternate / Error Flow:**
  - Incompatible finish mapping (e.g. mapping exterior acrylic gloss to an uncalibrated interior shelf): Interface blocks submission with clear engineering constraint notice.
- **Business Rules:** `BR-MFG-003` (Structural limits), `BR-SEC-002` (Immutable audit trail).
- **Acceptance Criteria:**
  - Bulk variant generation creates combinatorial permutations without duplicate SKUs.
- **Release:** Release 1
- **Dependency:** `FR-CAT-001`, `FR-MAT-002`.
- **Source Reference:** Strategic Backlog `idea.md` Section 4.2.

---

### Module 3: Custom Furniture Configurator

#### `FR-CFG-001`: Parametric Dimension Configuration
- **Module:** Custom Furniture Configurator
- **Requirement Title:** Real-Time Dimensional Parametric Input and Constraint Enforcement
- **Description:** Enable customers or sales staff to customize furniture Width, Height, and Depth in millimeters, strictly bounded by the product's approved manufacturing constraints.
- **Actor:** Customer, Sales Staff
- **Priority:** Must Have
- **Preconditions:** Configurable product loaded in configurator view.
- **Main Flow:**
  1. User adjusts dimension sliders or inputs numeric values in millimeters.
  2. Client validates input against $W_{min}/W_{max}$, $H_{min}/H_{max}$, $D_{min}/D_{max}$.
  3. System dynamically checks structural step increments (e.g., shelf spans exceeding 900mm mandate an internal vertical partition).
  4. UI updates dimensional readouts and passes payload to Pricing Engine.
- **Alternate / Error Flow:**
  - User enters dimension exceeding engineering limit: System blocks progression, resets to boundary, and displays warning explaining the structural constraint.
- **Business Rules:** `BR-PRICE-001` (No raw volumetric pricing), `BR-MFG-003` (Structural limits).
- **Acceptance Criteria:**
  - Real-time client feedback and strict server-side re-validation on form submit.
- **Release:** Release 1
- **Dependency:** `FR-CAT-001`.
- **Source Reference:** Blueprint Section 4.2.

---

### Module 4: Material and Hardware Selection

#### `FR-MAT-001`: Core Board, Edge-Band and Hardware Selector
- **Module:** Material and Hardware Selection
- **Requirement Title:** Parametric Material and Component Selection
- **Description:** Provide users with verified dropdown selections for board substrate (e.g., MDF, Chipboard, Plywood), surface finish (e.g., Melamine, High Gloss Acrylic, Natural Veneer), edge-banding thickness/colour, and functional hardware (e.g., Soft-close hinges, Drawer slides).
- **Actor:** Customer, Sales Staff
- **Priority:** Must Have
- **Preconditions:** Active materials and hardware defined in physical catalogue (`FR-MAT-002`) with active rate versions (`FR-RTE-001`).
- **Main Flow:**
  1. User selects board finish from available active swatches.
  2. User selects edge-banding specification (matching or contrasting).
  3. User selects hardware tier (Standard, Premium Soft-Close).
  4. System records selections in the configuration state.
- **Alternate / Error Flow:**
  - Selected material is out of stock or discontinued: System displays "Unavailable" badge and disables selection.
- **Business Rules:** `BR-PRICE-003` (Missing rate trips Request a Quote), `BR-MAT-001` (Physical attributes decoupled from rates).
- **Acceptance Criteria:**
  - Only active materials mapped to the specific product type can be selected.
- **Release:** Release 1
- **Dependency:** `FR-MAT-002`, `FR-INV-001`.
- **Source Reference:** Blueprint Section 4.2 & 4.5.

#### `FR-MAT-002`: Material and Hardware Physical Catalogue Administration
- **Module:** Material and Hardware Selection
- **Requirement Title:** Physical Substrate, Board and Hardware Catalogue Management
- **Description:** Allow Storekeepers and Company Admins to define physical boards, core substrates (MDF, Chipboard, Plywood, Solid Wood), surface finishes, sheet stock dimensions ($2440 \times 1220\text{ mm}$, $2800 \times 2070\text{ mm}$), thickness options (e.g. 8mm, 18mm, 25mm), edge-banding tape reels, functional hardware items (hinges, drawer slides, handles), and manufacturer SKUs. This module governs physical attributes only; financial rates and costing are strictly decoupled.
- **Actor:** Store / Inventory Staff, Company Admin
- **Priority:** Must Have
- **Preconditions:** User authenticated with `materials.write` permission.
- **Main Flow:**
  1. Storekeeper adds new 18mm Egger White Melamine MDF sheet with physical dimensions $2440 \times 1220 \times 18\text{ mm}$, grain direction flag, supplier info, and SKU.
  2. System validates that no pricing or margin fields are being set through this interface.
  3. System persists physical material specification into the catalog.
- **Alternate / Error Flow:**
  - Storekeeper attempts to set unit price: Interface does not expose rate inputs; API rejects payload containing financial rate fields with a `400 Bad Request` validation error.
- **Business Rules:** `BR-MAT-001` (Physical attributes only; strictly decoupled from rates).
- **Acceptance Criteria:**
  - Storekeepers can create/edit physical board specifications without having access to pricing or margin rate cards.
- **Release:** Release 1
- **Dependency:** `FR-AUTH-002`.
- **Source Reference:** Blueprint Section 4.5.

---

### Module 5: Pricing Engine

#### `FR-PRC-001`: Parametric Rule-Based Price Calculation
- **Module:** Pricing Engine
- **Requirement Title:** Deterministic Multi-Component Price Calculation
- **Description:** Calculate accurate wholesale/retail pricing based on algorithmic formulas accounting for board surface area, edging linear meters, hardware unit costs, standard labor operations, wastage factors, and business margins.
- **Actor:** System (Automated), Sales Staff
- **Priority:** Must Have
- **Preconditions:** Product construction formula defined; active material rate version available.
- **Main Flow:**
  1. Engine receives configuration payload $(W, H, D, \text{MaterialID}, \text{HardwareIDs})$.
  2. Engine queries active `PricingRuleVersion` and material unit rates (`FR-RTE-001`).
  3. Formula calculates:
     $$\text{Total Cost} = \text{Board Cost} \times (1 + \text{Waste Factor}) + \text{Edging Cost} + \text{Hardware Cost} + \text{Labor Cost}$$
     $$\text{Final Price} = \frac{\text{Total Cost} \times (1 + \text{Margin})}{1 - \text{Discount}}$$
  4. System returns itemized breakdown and captures the exact `pricing_rule_version_id`.
- **Alternate / Error Flow:**
  - Any required unit rate or formula coefficient is missing: Engine halts calculation and returns flag `REQUIRES_MANUAL_QUOTE`. The UI immediately shows **"Request a Quote"** instead of an invented number.
- **Business Rules:** `BR-PRICE-001` (No volume-only formula), `BR-PRICE-002` (Immutable rule versioning), `BR-PRICE-003` (No pricing guesswork).
- **Acceptance Criteria:**
  - Unit tests prove that identical inputs with the same pricing rule version produce 100% identical decimal outputs.
  - Missing rate never produces a zero or random price.
- **Release:** Release 1
- **Dependency:** `FR-MAT-001`, `FR-RTE-001`, `FR-CFG-001`.
- **Source Reference:** Blueprint Section 4.2.

#### `FR-RTE-001`: Financial Rate Card and Pricing Formula Administration
- **Module:** Pricing Engine
- **Requirement Title:** Financial Rate Card and Pricing Formula Administration
- **Description:** Enable authorized financial administrators to maintain version-controlled rate cards for raw boards (cost per $\text{m}^2$), edge-banding (cost per linear meter), functional hardware unit costs, standard labor operations (cost per hour/operation), standard scrap allowances, and business profit margins. Storekeepers and workshop staff are strictly excluded from mutating rates.
- **Actor:** Company Admin, Finance Officer (Storekeeper is strictly excluded)
- **Priority:** Must Have
- **Preconditions:** Physical materials defined in `FR-MAT-002`; user authenticated with `rates.write` permission.
- **Main Flow:**
  1. Admin opens Rate Management console, updates board square-meter cost, inputs margin target, and clicks "Publish Rate Revision".
  2. System increments `PricingRuleVersion` (e.g. v1.2), archives previous version, and logs full audit trail.
- **Alternate / Error Flow:**
  - User with `materials.write` or `inventory.adjust` (e.g., Storekeeper) attempts to call `POST /api/rates`: Server middleware rejects request with `403 Forbidden` (`BR-RTE-001`).
- **Business Rules:** `BR-PRICE-002` (Immutable rule versioning), `BR-RTE-001` (Financial rate authority separation).
- **Acceptance Criteria:**
  - Only users authenticated with `rates.write` can alter pricing rates; changes create new version records leaving historical issued quotes unmodified.
- **Release:** Release 1
- **Dependency:** `FR-MAT-002`, `FR-AUTH-002`.
- **Source Reference:** Blueprint Section 4.2 & 4.3.

#### `FR-PRC-002`: Promotional Coupon and Discount Code Validation Engine
- **Module:** Pricing Engine
- **Requirement Title:** Dynamic Coupon Validation, Campaign Budgets, and Non-Stacking Safeguards
- **Description:** Provide an automated coupon verification engine that applies validated percentage discounts, fixed SAR reductions, or free assembly services to quotes and orders, strictly enforcing per-user usage caps, minimum spend thresholds, expiration dates, and non-stacking rules against sales rep discretionary discounts.
- **Actor:** Customer, Sales Staff, Finance Officer
- **Priority:** Should Have (Release 1)
- **Preconditions:** Active promotional campaign created in admin marketing console; pricing estimate calculated.
- **Main Flow:**
  1. User enters coupon code (e.g. `KSA-FOUNDATION-10`) during checkout or quotation preparation.
  2. Engine queries active campaign rules, verifies validity dates, minimum order value, and checks usage count against the verified Saudi Mobile Number.
  3. Engine applies discount atomically and logs coupon reservation to prevent concurrent double-redemption.
  4. System updates price breakdown: $\text{Final Price} = \text{Calculated Price} - \text{Coupon Discount}$.
- **Alternate / Error Flow:**
  - Expired, exhausted, or below minimum order value: Engine returns specific localized error (e.g., "This code requires a minimum order of 5,000 SAR").
  - Stacking with manual discount: System blocks stacking (`BR-PRICE-005`), requiring customer or sales rep to choose the higher discount.
- **Business Rules:** `BR-PRICE-005` (Coupon validation & non-stacking constraints).
- **Acceptance Criteria:**
  - Atomic database transactions prevent coupon usage count from exceeding campaign limits.
  - Expired coupons cannot be redeemed under any timezone ambiguity (evaluated in UTC+3 / AST).
- **Release:** Release 1
- **Dependency:** `FR-PRC-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 1.4.

---

### Module 6: Customer Enquiry Management

#### `FR-ENQ-001`: Online Enquiry Submission and Intake Queue
- **Module:** Customer Enquiry Management
- **Requirement Title:** Digital Enquiry Capture with Configuration Snapshot, Saudi Mobile Validation, and SMS OTP
- **Description:** Allow customers to submit custom design configurations, room notes, contact information, and delivery city for sales follow-up, with strict Saudi mobile number validation (`^(?:\+966|00966|0)?5[0-9]{8}$`), E.164 normalization, and SMS OTP identity verification.
- **Actor:** Customer
- **Priority:** Must Have
- **Preconditions:** Customer has finalized a configuration or clicked "Request a Quote".
- **Main Flow:**
  1. Customer fills in Name, Saudi Mobile Number, Email, City, and optional room delivery notes.
  2. Client and server validate mobile format against Saudi regex `^(?:\+966|00966|0)?5[0-9]{8}$` and normalize to `+9665xxxxxxxx` (`BR-LOC-003`).
  3. System triggers 4-digit SMS OTP via Saudi telecom gateway (Unifonic / Taqnyat / STC) with a 3-minute validity window.
  4. Customer enters valid OTP; system verifies identity and serializes current configuration state into an immutable JSON snapshot.
  5. System creates `Enquiry` record with status `NEW`.
  6. Customer receives confirmation message, reference token, and secure portal access link on-screen and via SMS (`BR-SEC-003`).
- **Alternate / Error Flow:**
  - Invalid mobile format: Client highlights field with localized Arabic/English error: "Please enter a valid 9-digit Saudi mobile starting with 5 (e.g. 05XXXXXXXX or +9665XXXXXXXX)".
  - Incorrect or expired OTP: User prompted to re-enter or request a resend after 60-second cooldown.
- **Business Rules:** `BR-CUST-001` (Immutable enquiry configuration snapshot), `BR-LOC-003` (Saudi mobile regex & OTP), `BR-SEC-004` (PII encryption at rest via AES-256).
- **Acceptance Criteria:**
  - Regex rejects non-Saudi numbers or invalid prefixes.
  - Numbers are normalized to `+9665xxxxxxxx` in the database.
  - Enquiry appears in Sales dashboard within 2 seconds of successful OTP verification.
- **Release:** Release 1
- **Dependency:** `FR-CFG-001`, `FR-AUTH-001`.
- **Source Reference:** Blueprint Section 4.1 & 4.3.

#### `FR-ENQ-002`: Incomplete Order & Abandoned Configurator Recovery Engine
- **Module:** Customer Enquiry Management
- **Requirement Title:** Abandoned Customizer Snapshotting & Automated WhatsApp/SMS Lead Recovery
- **Description:** Automatically save in-progress custom furniture designs to local session storage and cloud drafts, detecting abandoned configurations when a user exits without submitting, and triggering automated bilingual WhatsApp/SMS recovery sequences with 1-click 3D reload links adhering to Saudi PDPL privacy regulations.
- **Actor:** System (Automated), Sales Staff
- **Priority:** Must Have (Release 1)
- **Preconditions:** Customer adjusted dimensions or selected materials and provided a verified mobile number or logged in, but abandoned before quotation submission.
- **Main Flow:**
  1. System detects session inactivity ($> 30\text{ minutes}$) on a customized furniture configuration.
  2. System serializes configuration into a persistent draft and generates a signed reload token (`https://satco.sa/config?resume=...`).
  3. At $T + 1\text{ hour}$, system dispatches an automated polite WhatsApp recovery message in Arabic: *"مرحباً [الاسم]، تم حفظ تصميم خزانة ملابسك الخاصة! اضغط هنا لمعاينة التصميم ثلاثي الأبعاد وإكمال طلبك."*
  4. If order value exceeds $15,000\text{ SAR}$, lead is escalated to a Senior Sales Designer for personal phone outreach.
- **Alternate / Error Flow:**
  - Customer opts out: System marks record as `MARKETING_OPT_OUT` and halts all recovery messaging immediately.
- **Business Rules:** `BR-SEC-004` (Saudi PDPL privacy compliance; mandatory opt-out link).
- **Acceptance Criteria:**
  - Clicking recovery link restores 100% of the customer's previous dimensions, materials, and hardware options in the 3D configurator.
  - Zero messages sent to opted-out contacts.
- **Release:** Release 1
- **Dependency:** `FR-ENQ-001`, `FR-CFG-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 3.2.

---

### Module 7: Quotation Management

#### `FR-QTE-001`: Quotation Preparation, Revision, Discount Tiers, and Secure Portal Links
- **Module:** Quotation Management
- **Requirement Title:** Sales Quotation Lifecycle, Tiered Discount Governance, PDF Generation, and Signed Portal Links
- **Description:** Enable sales representatives to review incoming enquiries, adjust allowable line-item discounts governed by strict role-based approval tiers, apply delivery charges, generate formal bilingual PDF quotations, and transmit cryptographically signed Customer Portal links.
- **Actor:** Sales Staff, Sales Manager, Company Admin
- **Priority:** Must Have
- **Preconditions:** Enquiry exists; user authenticated with `quotes.write` permission.
- **Main Flow:**
  1. Sales staff opens Enquiry, reviews specifications, and clicks "Generate Quotation".
  2. System creates `Quotation` record (v1) binding current pricing rule version (`FR-RTE-001`).
  3. Sales staff inputs commercial discount governed by tiered approval thresholds (`BR-PRICE-004`):
     - $\le 5.0\%$ (Standard Sales Representative discretionary limit).
     - $> 5.0\%$ to $15.0\%$ (Mandates Sales Manager approval via `quotes.approve`).
     - $> 15.0\%$ (Mandates Company Admin / Executive signoff).
  4. If discount is within role allowance, quote can transition directly to `ISSUED`.
  5. System generates bilingual PDF and a cryptographically signed HMAC-SHA256 Customer Portal URL (`https://satco.sa/portal/quote?token=...`) with a 14-day Time-To-Live (TTL) (`BR-SEC-003`).
  6. Secure link is dispatched to customer via SMS and email.
- **Alternate / Error Flow:**
  - Sales staff enters discount exceeding their role limit: System sets status to `PENDING_DISCOUNT_APPROVAL`, locking quote issuance until an authorized manager approves or rejects the request with an audit note.
  - Customer requests specification alteration: Sales creates revision (v2); system archives v1 and immediately revokes v1's portal token (`BR-SEC-003`).
- **Business Rules:** `BR-PRICE-002` (Immutable rule versioning), `BR-PRICE-004` (Tiered discount governance), `BR-QTE-001` (Quotation state machine), `BR-SEC-003` (Cryptographically signed portal links).
- **Acceptance Criteria:**
  - Sales reps cannot issue quotes with discounts $> 5\%$ without manager approval.
  - Portal links expire after 14 days and reject tampered token signatures.
  - Issued quotes lock all rates; future rate increases do not alter issued quotes.
- **Release:** Release 1
- **Dependency:** `FR-PRC-001`, `FR-ENQ-001`, `FR-AUTH-002`.
- **Source Reference:** Blueprint Section 4.3.

---

### Module 8: Admin Dashboard and Business Management

#### `FR-ADM-001`: Central Operational Dashboard
- **Module:** Admin Dashboard and Business Management
- **Requirement Title:** Unified Operational KPI and Executive Dashboard
- **Description:** Provide executive and operational leaders with real-time analytics on new enquiries, open quotations, active production jobs, inventory alerts, and monthly sales pipeline.
- **Actor:** Company Admin, Production Manager
- **Priority:** Must Have
- **Preconditions:** User authenticated with administrative privileges.
- **Main Flow:**
  1. Admin logs into `/admin`.
  2. System aggregates operational counters scoped to the user's company tenant.
  3. Dashboard renders summary widgets: Conversion Funnel, Factory Stage Load, Low Stock Alerts, and Recent Activity Audit Feed.
- **Alternate / Error Flow:**
  - Database latency: Dashboard loads widget skeletons asynchronously.
- **Business Rules:** `BR-SAAS-001` (Tenant data isolation).
- **Acceptance Criteria:**
  - All metrics render within 1.5 seconds under standard database load.
- **Release:** Release 1
- **Dependency:** `FR-AUTH-002`.
- **Source Reference:** Blueprint Section 4.3.

#### `FR-SEC-002`: Anti-Fraud Shield, Bot Defense & Fake Order Mitigation
- **Module:** Admin Dashboard and Business Management
- **Requirement Title:** Bot Mitigation, Disposable Number Detection, and Pre-Production Financial Lock
- **Description:** Protect the factory floor from fabricating fraudulent, prank, or uncommitted custom furniture orders by deploying an automated anti-fraud shield that enforces bot mitigation, blocks disposable burner numbers/VoIP, checks IP reputation, and enforces an unbreakable financial gate: **zero manufacturing saw cuts without verified bank deposit**.
- **Actor:** System (Automated), Finance Officer, Production Manager
- **Priority:** Must Have (Release 1)
- **Preconditions:** Customer submits enquiry or order.
- **Main Flow:**
  1. System checks client IP, submission frequency, and phone prefix against threat databases.
  2. If threat score $> 70$, system blocks automated submission and presents Cloudflare Turnstile challenge.
  3. Pre-production financial gate (`BR-SEC-005`): Production job dispatch remains locked in `WAITING_DEPOSIT` state until accounting verifies customer deposit.
- **Alternate / Error Flow:**
  - Unverified deposit: Job cannot be released to cutting or material reservation under any circumstance.
- **Business Rules:** `BR-SEC-005` (Mandatory deposit before production cut).
- **Acceptance Criteria:**
  - 100% of production jobs released to factory floor have verified commercial deposit references.
- **Release:** Release 1
- **Dependency:** `FR-AUTH-001`, `FR-ORD-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 2.1.

#### `FR-CUST-002`: Customer Risk Profiling and Blacklist Management
- **Module:** Admin Dashboard and Business Management
- **Requirement Title:** Centralized Fraud Blacklist, Chargeback History, and Risk Scoring
- **Description:** Enable compliance and finance administrators to manage a centralized blacklist indexed by Saudi Mobile, National ID, and Email hash, automatically calculating customer risk scores (0–100) and preventing chronic dispute abusers or bad-faith actors from generating binding custom quotes.
- **Actor:** Company Admin, Finance Officer, System (Automated)
- **Priority:** Should Have (Release 1)
- **Preconditions:** User authenticated with administrative privileges.
- **Main Flow:**
  1. Admin inspects Customer profile in `/admin/customers`.
  2. System displays automated Risk Score derived from payment history, cancellation rate, and OTP failure counts.
  3. If customer has a documented fraudulent chargeback, Admin toggles `BLACKLISTED` status with audit reason.
  4. Subsequent quote requests from this identity are quarantined into an administrative review queue without notifying the client.
- **Alternate / Error Flow:**
  - False positive dispute: Admin can remove blacklist flag with mandatory executive signoff.
- **Business Rules:** `BR-SEC-002` (Immutable audit logging).
- **Acceptance Criteria:**
  - Blacklisted phone numbers cannot auto-generate signed customer portal contracts.
- **Release:** Release 1
- **Dependency:** `FR-ADM-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 2.2.

---

### Module 9: Authentication, Roles and Permissions

#### `FR-AUTH-001`: Secure Multi-Role Authentication
- **Module:** Authentication, Roles and Permissions
- **Requirement Title:** Next.js Session Management, Password Security, and 2FA Foundation
- **Description:** Provide secure email/password and session-based authentication with bcrypt hashing, brute-force rate limiting, and secure HTTP-only session cookies.
- **Actor:** All Internal Users (Admin, Sales, Factory, Store)
- **Priority:** Must Have
- **Preconditions:** User account provisioned by Company Admin.
- **Main Flow:**
  1. User enters email and password at `/auth/login`.
  2. Server verifies password hash against database.
  3. Server issues encrypted JWT/session cookie with role claims.
  4. User redirected to permitted module based on assigned role.
- **Alternate / Error Flow:**
  - 5 failed login attempts in 10 minutes: Account locked for 15 minutes; security event logged.
- **Business Rules:** `BR-SEC-001` (Backend enforcement), `BR-SEC-002` (Audit logging).
- **Acceptance Criteria:**
  - Passwords hashed using bcrypt (cost factor $\ge 12$).
  - Zero sensitive session tokens exposed to client-side localStorage.
- **Release:** Release 1
- **Dependency:** Baseline Next.js + PostgreSQL setup.
- **Source Reference:** Blueprint Section 4.3 & 5.1.

#### `FR-AUTH-002`: Granular Role-Based Access Control (RBAC)
- **Module:** Authentication, Roles and Permissions
- **Requirement Title:** Server-Side Permission Verification Guardrails
- **Description:** Enforce strict server-side middleware and database query filters verifying user permissions (`quotes.read`, `quotes.approve`, `production.assign`, `inventory.adjust`, etc.) before executing any API handler.
- **Actor:** System (Automated)
- **Priority:** Must Have
- **Preconditions:** Incoming request includes authenticated session.
- **Main Flow:**
  1. API route receives mutation request (e.g., `POST /api/inventory/adjust`).
  2. Authorization guard retrieves session user's effective permissions.
  3. Guard verifies required permission (`inventory.adjust`). If present, request executes.
- **Alternate / Error Flow:**
  - Permission missing: Server aborts execution and returns `403 Forbidden` JSON response. UI displays unauthorized toast. Hiding UI buttons alone is strictly prohibited as an authorization mechanism.
- **Business Rules:** `BR-SEC-001`.
- **Acceptance Criteria:**
  - Automated integration tests verify that unauthorized role API calls fail with 403.
- **Release:** Release 1
- **Dependency:** `FR-AUTH-001`.
- **Source Reference:** Blueprint Section 2.3 & 4.3.

---

### Module 10: Order Management

#### `FR-ORD-001`: Quotation-to-Order Conversion and Order Lifecycle Management
- **Module:** Order Management
- **Requirement Title:** Formal Sales Order Contract Locking and Commercial Lifecycle State Machine
- **Description:** Convert an approved customer quotation into a binding commercial `Order` record, locking financial terms, verifying customer deposit, and managing the complete commercial order lifecycle strictly separated from shop-floor production jobs.
- **Actor:** Sales Staff, Finance / Company Admin
- **Priority:** Must Have
- **Preconditions:** Quotation is in `CUSTOMER_ACCEPTED` status; customer deposit payment receipt verified.
- **Main Flow:**
  1. Sales staff clicks "Convert to Order" on accepted quotation.
  2. System executes an atomic database transaction:
     - Creates `Order` record with unique order number (e.g. `ORD-2026-0044`).
     - Initializes order status to `DEPOSIT_CONFIRMED` -> `PENDING_SPEC_REVIEW`.
     - Copies immutable configuration snapshot, contracted pricing, and delivery milestones.
     - Updates Quotation status to `CONVERTED`.
  3. Commercial Order lifecycle follows strict state machine (`BR-ORD-003`):
     $$\text{PENDING\_DEPOSIT} \longrightarrow \text{DEPOSIT\_CONFIRMED} \longrightarrow \text{PENDING\_SPEC\_REVIEW} \longrightarrow \text{SPEC\_APPROVED} \longrightarrow \text{IN\_PRODUCTION} \longrightarrow \text{PRODUCTION\_COMPLETED} \longrightarrow \text{PARTIALLY\_DELIVERED} \longrightarrow \text{DELIVERED} \longrightarrow \text{CLOSED}$$
  4. System emits `OrderApprovedEvent` notifying factory engineering for specification review.
- **Alternate / Error Flow:**
  - Spec review uncovers structural impossibility: Production Manager flags `SPEC_REJECTED` with engineering notes; sales staff alerted to revise with customer.
  - Customer cancels order: Order status transitions to `CANCELLED`; system automatically updates linked production jobs to `ON_HOLD - ORDER_CANCELLED` for supervisor review without deleting completed shop-floor records.
- **Business Rules:** `BR-ORD-001` (Traceable order lineage), `BR-ORD-002` (Immutable contract specifications), `BR-ORD-003` (Distinct Order vs. Production Job lifecycles).
- **Acceptance Criteria:**
  - Order references exact quotation version ID; subsequent quotation edits cannot modify the order.
  - Order states remain distinct from shop-floor job station stages.
- **Release:** Release 1
- **Dependency:** `FR-QTE-001`.
- **Source Reference:** Blueprint Section 4.3 & 6.2.

#### `FR-ORD-004`: Milestone Payments and Due Manager (Accounts Receivable)
- **Module:** Order Management
- **Requirement Title:** 3-Stage Milestone Payment Engine, Due Aging, and Factory Dispatch Hold
- **Description:** Govern the complete financial lifecycle of high-ticket custom furniture contracts by splitting payments into structured milestones (e.g. 50% Commitment Deposit, 40% Pre-Dispatch Balance, 10% Installation Signoff), maintaining an automated accounts receivable aging ledger, and enforcing a physical warehouse dispatch hold (`BR-ORD-005`) if pre-delivery balances remain unpaid.
- **Actor:** Finance Officer, Sales Staff, Storekeeper, Customer
- **Priority:** Must Have (Release 1)
- **Preconditions:** Commercial order created.
- **Main Flow:**
  1. System creates milestone ledger:
     - Milestone 1: $50\%$ on Order Confirmation.
     - Milestone 2: $40\%$ upon Quality Check (`QC`) completion before factory dispatch.
     - Milestone 3: $10\%$ upon physical installation signoff.
  2. When Milestone 1 is verified, order transitions to `IN_PRODUCTION`.
  3. When factory finishes assembly and packing, system automatically checks Milestone 2 status.
  4. If Milestone 2 is unpaid, system sets order status to `DISPATCH_HOLD - DUE_PAYMENT` and dispatches automated WhatsApp payment link to customer.
  5. Customer pays via mada / Apple Pay; system verifies receipt and clears logistics hold.
- **Alternate / Error Flow:**
  - Overdue aging $> 15\text{ days}$: Finance dashboard flags account; automated escalation notices dispatched to customer and assigned sales rep.
- **Business Rules:** `BR-ORD-005` (Pre-dispatch payment hold gate).
- **Acceptance Criteria:**
  - Logistics cannot print delivery manifest or assign delivery truck if an order is under `DISPATCH_HOLD`.
  - Accounts receivable aging buckets (Current, 1–15, 16–30, 30+ days) update in real time.
- **Release:** Release 1
- **Dependency:** `FR-ORD-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 3.1.

#### `FR-LOG-001`: Delivery & Logistics Fleet Slot Scheduling
- **Module:** Order Management
- **Requirement Title:** Scheduled Delivery Windows, Building Access Constraints, and Logistics Dispatch
- **Description:** Manage in-house delivery vehicle dispatching in Jeddah/KSA, allowing sales coordinators and customers to select confirmed delivery time windows (Morning 09:00–13:00 / Evening 16:00–21:00), record building access constraints (e.g., service elevator dimensions, floor number, narrow stairwells), and route dispatch manifests to in-house installation trucks.
- **Actor:** Logistics Coordinator, Field Installer / Technician, Customer
- **Priority:** Must Have (Release 1)
- **Preconditions:** Order passes factory QC and Milestone 2 pre-dispatch payment is verified.
- **Main Flow:**
  1. Logistics Coordinator selects delivery date and morning/evening slot.
  2. System records building logistics metadata: Villa vs Apartment, Service Elevator status, and Saudi National Address short code.
  3. Delivery manifest generated and assigned to SATCO in-house installation vehicle crew.
  4. Customer receives automated WhatsApp delivery notification with technician live dispatch update.
- **Alternate / Error Flow:**
  - Milestone 2 unpaid: System blocks slot confirmation under `DISPATCH_HOLD` (`BR-ORD-005`).
- **Business Rules:** `BR-ORD-005` (Pre-dispatch payment hold gate).
- **Acceptance Criteria:**
  - Cannot assign vehicle or confirm delivery window for orders with unverified pre-dispatch balances.
- **Release:** Release 1
- **Dependency:** `FR-ORD-004`.
- **Source Reference:** Analyst Review `prd analysis.md` Section 8.2.

#### `FR-INS-001`: In-House Installation & Field Technician Dispatch Management
- **Module:** Order Management
- **Requirement Title:** Mobile Field Installation App, Site Readiness Check, and Digital Handover Sign-Off
- **Description:** Provide SATCO's in-house field installation crews with a dedicated mobile tablet interface to view assigned room drawings, log site readiness (wall plaster/paint ready, electrical clearance), record on-site assembly completion, capture installation photos, and collect customer digital e-signatures (`BR-INS-001`) to authorize Milestone 3 release.
- **Actor:** Field Installer / Technician, Customer, Production Manager
- **Priority:** Must Have (Release 1)
- **Preconditions:** Delivery truck arrives at customer premises; installer authenticated via field app.
- **Main Flow:**
  1. Technician opens assigned Order on mobile app (`/installer/jobs/{id}`).
  2. Technician completes digital Site Readiness Checklist (photo verification of room condition).
  3. Crew executes physical cabinet assembly, door hinge alignment, and filler trim fitting.
  4. Technician initiates Handover Inspection: Customer inspects finished furniture and signs digitally on tablet screen.
  5. System records timestamped e-signature, marks order as `INSTALLED_HANDOVER`, and triggers Milestone 3 payment invoice (`FR-ORD-004`).
- **Alternate / Error Flow:**
  - Site not ready (e.g. room under active wet construction): Installer flags `SITE_NOT_READY` with photos; delivery rescheduled with automatic delay logging.
- **Business Rules:** `BR-INS-001` (Customer digital e-signature required for handover signoff).
- **Acceptance Criteria:**
  - Digital e-signature image permanently bound to order audit record.
  - Handover completion automatically unlocks final billing milestone.
- **Release:** Release 1
- **Dependency:** `FR-ORD-001`, `FR-LOG-001`.
- **Source Reference:** Stakeholder Confirmation & Analyst Review.

#### `FR-WAR-001`: Warranty Management, RMA & Fast-Track Single-Part Replacement
- **Module:** Order Management
- **Requirement Title:** Configurable 1/2-Year Warranty Governance, Defect Reporting, and Rapid CNC Re-Cut
- **Description:** Maintain configurable warranty coverage terms (standard 2-year structural board warranty and 1-to-2 year mechanical hardware warranty), enabling customers or field installers to submit defect claims with photos, and providing the factory floor with a fast-track single-part remake workflow that extracts the exact damaged panel from historical BOM part data without re-ordering the entire furniture unit.
- **Actor:** Customer, Field Installer, Production Manager, CAM Specialist
- **Priority:** Must Have (Release 1 / Release 2)
- **Preconditions:** Order status is `DELIVERED` or `INSTALLED_HANDOVER`.
- **Main Flow:**
  1. Field installer or customer reports damaged component (e.g. "Left Gable panel scratched during transit", Part Code: `P-044-02`).
  2. System verifies active warranty status based on product category rules (`BR-WAR-001`).
  3. Production Manager approves claim and clicks "Fast-Track Single-Part Remake".
  4. System generates isolated `RMA_Remake_Job` targeting only Part `P-044-02` with exact historical raw cut dimensions, edge-banding code, and CNC boring operations.
  5. Job routes directly to factory offcut saw/Homag CNC for expedited same-day turnaround.
- **Alternate / Error Flow:**
  - Warranty expired or damage caused by customer misuse: System routes claim to sales for paid replacement quoting.
- **Business Rules:** `BR-WAR-001` (Configurable warranty terms & single-part BOM extraction).
- **Acceptance Criteria:**
  - Single-part remake inherits 100% exact dimensions and CNC boring specs from the original approved order BOM without manual re-drafting.
- **Release:** Release 1 (Claim capture), Release 2 (CNC single-part re-cut).
- **Dependency:** `FR-ORD-001`, `FR-BOM-001`, `FR-INS-001`.
- **Source Reference:** Stakeholder Confirmation & Analyst Review.

---

### Module 11: Factory and Production Management

#### `FR-PRD-001`: Production Job Creation, Floor Routing, and Distinct Stage Lifecycle
- **Module:** Factory and Production Management
- **Requirement Title:** Production Job Dispatch, Workstation Progression, and Manufacturing State Machine
- **Description:** Allow Production Managers to create one or more production jobs from an approved commercial order, assign work to workshop stations, reserve materials, and track jobs through distinct physical manufacturing stages.
- **Actor:** Production Manager, Factory Operator
- **Priority:** Must Have
- **Preconditions:** Order status is `SPEC_APPROVED`.
- **Main Flow:**
  1. Production Manager reviews approved order and clicks "Generate Production Job(s)".
  2. System supports 1-to-many relationship: Manager can split a large multi-room order into discrete jobs (e.g. `JOB-2026-0044-A` for Carcass, `JOB-2026-0044-B` for Shutters/Doors).
  3. Production Job follows strict manufacturing state machine (`BR-ORD-003`):
     $$\text{DRAFT} \longrightarrow \text{PENDING\_BOM} \longrightarrow \text{BOM\_APPROVED} \longrightarrow \text{MATERIAL\_RESERVED} \longrightarrow \text{READY\_FOR\_PRODUCTION} \longrightarrow \text{CUTTING} \longrightarrow \text{EDGE\_BANDING} \longrightarrow \text{MACHINING} \longrightarrow \text{ASSEMBLY} \longrightarrow \text{QUALITY\_CHECK} \longrightarrow \text{PACKED} \longrightarrow \text{COMPLETED}$$
  4. Floor operators advance stages by scanning part barcodes at station tablets; system logs operator ID, workstation, and timestamp.
  5. When all linked ProductionJobs for an Order reach `COMPLETED`, system updates parent Order status to `PRODUCTION_COMPLETED`.
- **Alternate / Error Flow:**
  - Quality defect identified at Assembly or QC: Operator flags job as `ON_HOLD` with mandatory defect category (e.g., chipped edge, wrong hinge boring) and scrap quantity; system logs defect event and alerts Production Manager.
- **Business Rules:** `BR-MFG-001` (Traceable job linkage), `BR-MFG-002` (Strict status audit log), `BR-ORD-003` (Distinct Order vs. Production Job lifecycles).
- **Acceptance Criteria:**
  - Real-time Gantt/Kanban view reflects job status across all workshop stations.
  - Multi-job order relationships correctly roll up to the parent commercial order status.
- **Release:** Release 1
- **Dependency:** `FR-ORD-001`, `FR-BOM-001`.
- **Source Reference:** Blueprint Section 4.4.

---

### Module 12: Inventory and Material Tracking

#### `FR-INV-001`: Auditable Stock Movements and Material Reservation
- **Module:** Inventory and Material Tracking
- **Requirement Title:** Transactional Inventory Ledger, Reservations, and Low-Stock Alerts
- **Description:** Manage raw sheet stock (melamine, MDF), edge-banding reels, and hardware items using strict transactional stock movements (`RECEIPT`, `ISSUE_TO_JOB`, `RETURN_FROM_JOB`, `ADJUSTMENT`). Direct overwrite of stock quantities without a movement record is strictly blocked.
- **Actor:** Store / Inventory Staff, Production Manager
- **Priority:** Must Have
- **Preconditions:** Materials configured in catalogue; user has `inventory.*` permissions.
- **Main Flow:**
  1. Storekeeper receives shipment of 100 MDF sheets (18mm).
  2. Storekeeper logs `RECEIPT` transaction referencing supplier PO.
  3. System increments `StockBalance` and records immutable `StockMovement` row.
  4. When Production Job is approved, system automatically creates `MaterialReservation` holding required sheets.
  5. When cutting begins, storekeeper executes `ISSUE_TO_JOB`, reducing physical balance.
- **Alternate / Error Flow:**
  - Insufficient available stock for reservation: System sets job status to `MATERIAL_PENDING` and alerts Purchasing.
  - Manual stock discrepancy found during physical audit: User with `inventory.adjust` permission records `ADJUSTMENT` with mandatory audit reason code.
- **Business Rules:** `BR-INV-001` (No raw overwriting; auditable movements only), `BR-INV-002` (Pre-job reservation).
- **Acceptance Criteria:**
  - Sum of all historical `StockMovement` records exactly equals current `StockBalance`.
  - Negative inventory balances are strictly prohibited unless explicit backorder flag enabled.
- **Release:** Release 1
- **Dependency:** `FR-MAT-001`.
- **Source Reference:** Blueprint Section 4.5.


---

### Module 13: Furniture BOM and Parts Generator

#### `FR-BOM-001`: Parametric Bill of Materials (BOM) Generation
- **Module:** Furniture BOM and Parts Generator
- **Requirement Title:** Product-Specific Versioned BOM Extraction
- **Description:** Automatically convert an approved custom furniture specification into a detailed, hierarchical Bill of Materials listing all structural carcass panels, shelves, backboards, drawer boxes, edge-banding schedules, and assembly hardware.
- **Actor:** Production Manager, System (Automated)
- **Priority:** Must Have (for Release 2)
- **Preconditions:** Production Job created; product construction formulas defined and version-controlled.
- **Main Flow:**
  1. System triggers BOM generator for `ProductionJob`.
  2. Generator looks up active `BOMFormulaVersion` for the product type (e.g., Base Cabinet v2.1).
  3. Formula calculates parametric dimensions for every component based on overall $W, H, D$ and board thickness ($T$):
     - Left / Right Gable: $H \times D$, Qty 2.
     - Top / Bottom Rail: $(W - 2T) \times D$, Qty 2.
     - Backboard: $(W - 2T + 2 \times \text{Rebate}) \times (H - 2T + 2 \times \text{Rebate})$, Qty 1.
  4. System generates immutable `BOMRevision` record (e.g., Rev A) linked to the job.
- **Alternate / Error Flow:**
  - Formula contains missing parameter or unsupported joint logic: System halts, flags job as `BOM_GENERATION_FAILED`, and logs engineering exception for manual review.
- **Business Rules:** `BR-MFG-001` (Product-specific joinery formulas), `BR-MFG-004` (BOM version immutability), `BR-MFG-005` (Visual preview is not a manufacturing drawing).
- **Acceptance Criteria:**
  - Standard test cabinet configurations produce 100% mathematically correct part counts, lengths, and widths matching physical engineering mockups.
  - Changes to catalog templates generate a new BOM revision without altering active shop-floor jobs.
- **Release:** Release 2
- **Dependency:** `FR-PRD-001` (Production Jobs).
- **Source Reference:** Blueprint Section 4.6.

#### `FR-BOM-002`: Finished vs. Raw Part Dimensions and Grain Direction
- **Module:** Furniture BOM and Parts Generator
- **Requirement Title:** Substrate Sizing, Edge-Band Deduction, and Grain Alignment
- **Description:** Differentiate between finished external dimensions and raw substrate cut dimensions by deducting edge-band thickness (e.g., -1mm or -2mm per banded edge) and recording mandatory wood grain orientation (`GRAIN_LENGTH`, `GRAIN_WIDTH`, or `NONE`).
- **Actor:** System (Automated)
- **Priority:** Must Have (for Release 2)
- **Preconditions:** BOM parts generated.
- **Main Flow:**
  1. For each part, system checks edge-banding application flags ($L_1, L_2, W_1, W_2$).
  2. For edges with band thickness $E_t$, system computes raw cutting dimension:
     $$\text{Raw Length} = \text{Finished Length} - \sum E_{t,\text{length}}$$
     $$\text{Raw Width} = \text{Finished Width} - \sum E_{t,\text{width}}$$
  3. System stores both Raw and Finished dimensions alongside grain direction constraints.
- **Alternate / Error Flow:**
  - Edge-band deduction results in negative or non-physical dimension: Generator rejects part and alerts Production Manager.
- **Business Rules:** `BR-MFG-001`.
- **Acceptance Criteria:**
  - Raw cut size passed to optimizer equals finished dimension minus edge-band thickness.
- **Release:** Release 2
- **Dependency:** `FR-BOM-001`.
- **Source Reference:** Blueprint Section 4.6 & 4.8.

---

### Module 14: Panel Calculation and Cutting List

#### `FR-CUT-001`: Cutting List Aggregation and Material Grouping
- **Module:** Panel Calculation and Cutting List
- **Requirement Title:** Multi-Job Part Aggregation and Board Grouping
- **Description:** Group raw panel components from one or multiple approved production jobs by identical core substrate material, board thickness, and surface finish to create consolidated cutting batches.
- **Actor:** Production Manager
- **Priority:** Must Have (for Release 2)
- **Preconditions:** Approved BOM revisions exist for target jobs.
- **Main Flow:**
  1. Production Manager selects jobs for the day's cutting run.
  2. System groups all parts into discrete cutting list batches (e.g., "18mm White Melamine MDF Batch", "8mm White Backer Batch").
  3. System outputs a printable cutting list table detailing Part ID, Job Number, Raw Dimensions, Qty, Grain, and Edge-band callouts.
- **Alternate / Error Flow:**
  - Mixed material thicknesses in single batch: System strictly segregates parts by material ID.
- **Business Rules:** `BR-MFG-006` (Material segregation).
- **Acceptance Criteria:**
  - Zero cross-contamination of disparate materials or thicknesses in a single cutting list.
- **Release:** Release 2
- **Dependency:** `FR-BOM-002`.
- **Source Reference:** Blueprint Section 4.7.

---

### Module 15: Cutting Optimization

#### `FR-OPT-001`: Panel Nesting and Saw Kerf Optimization Algorithm
- **Module:** Cutting Optimization
- **Requirement Title:** Algorithmic 2D Rectangular Packing with Kerf, Trim, and Grain Controls
- **Description:** Compute optimized 2D cutting layouts for standard sheet stock (e.g., $2440 \times 1220\text{ mm}$ or $2800 \times 2070\text{ mm}$) incorporating perimeter edge trim ($10\text{ mm}$ default), saw blade kerf allowance ($3.2\text{ mm}\dots 4.5\text{ mm}$ default), grain rotation locks, and offcut identification.
- **Actor:** Production Manager, System (Automated)
- **Priority:** Must Have (for Release 2)
- **Preconditions:** Cutting list populated; raw board dimensions, usable area, and machine kerf configured in system.
- **Main Flow:**
  1. Manager initiates optimization run for a cutting batch.
  2. Optimizer applies guillotine or nesting algorithm adhering to:
     - Edge Trim Allowance ($T_{trim}$ on all 4 borders).
     - Saw Blade Kerf ($K_{saw}$) between every adjacent cut.
     - Grain Direction Lock (Parts with grain cannot rotate $90^\circ$; non-grained parts may rotate for higher yield).
  3. System renders visual 2D cutting diagrams, board count needed, and calculated scrap percentage.
  4. Authorized Manager reviews and clicks "Approve Cutting Plan".
- **Alternate / Error Flow:**
  - Part dimensions exceed usable sheet stock: System flags "Unplaced Part: Exceeds Usable Board Size" and blocks plan approval.
- **Business Rules:** `BR-CUT-001` (Strict physical constraints), `BR-CUT-002` (Advisory status until human approval).
- **Acceptance Criteria:**
  - Automated tests verify zero overlapping parts on any sheet.
  - Saw kerf is physically present between all parts; no part is placed within perimeter trim margins.
  - Calculated sheet waste displayed transparently before signoff.
- **Release:** Release 2
- **Dependency:** `FR-CUT-001`.
- **Source Reference:** Blueprint Section 4.7.

---

### Module 16: Edge-Banding

#### `FR-EDG-001`: Edge-Banding Specification and Linear Meter Takeoff
- **Module:** Edge-Banding
- **Requirement Title:** Edge-Banding Takeoff, Material Mapping, and Station Guidance
- **Description:** Calculate total linear meters of edge-banding material required per job/batch, generate edge-banding schedules detailing application edges ($L_1, L_2, W_1, W_2$) and tape thickness ($0.4\text{ mm}, 1.0\text{ mm}, 2.0\text{ mm}$), and track shop-floor edge-banding completion.
- **Actor:** Storekeeper, Factory Operator
- **Priority:** Must Have (for Release 2)
- **Preconditions:** BOM parts generated with edge assignments.
- **Main Flow:**
  1. System compiles total edge-banding length by tape type and color:
     $$\text{Total Length} = \sum (\text{Edge Length}) \times 1.05\text{ (5\% overrun allowance)}$$
  2. Storekeeper issues required rolls from inventory.
  3. Edge-bander operator scans part label at machine station; screen displays highlighted visual edges requiring banding.
  4. Operator marks part as banded.
- **Alternate / Error Flow:**
  - Tape roll runs out: Operator logs roll changeover in station tablet.
- **Business Rules:** `BR-MFG-001`.
- **Acceptance Criteria:**
  - Accurate linear meter takeoff prevents tape shortages during active runs.
- **Release:** Release 2
- **Dependency:** `FR-BOM-002`.
- **Source Reference:** Blueprint Section 4.8.

---

### Module 17: Barcode / QR Labels

#### `FR-LBL-001`: Thermal Barcode / QR Part Label Generation
- **Module:** Barcode / QR Labels
- **Requirement Title:** High-Density Industrial Part Label Generation
- **Description:** Generate and print industrial adhesive barcode/QR labels for every cut panel. Labels display unique Part UUID, Job Number, Customer Order Ref (anonymized), Part Name (e.g., "Left Gable"), Raw/Finished Dimensions, Core Material, Edge-banding Indicator Diagram, and Next Workstation.
- **Actor:** Factory Operator, Production Manager
- **Priority:** Must Have (for Release 2)
- **Preconditions:** Cutting plan approved and released to floor.
- **Main Flow:**
  1. Operator prints label batch for an approved cutting layout on industrial thermal printer.
  2. As panels come off the saw/router, operator affixes label to the non-decorative inner face.
  3. Subsequent operators scan the barcode at Edge-Bander, Drilling, and Assembly stations to log completion.
- **Alternate / Error Flow:**
  - Label damaged or smudged: Operator scans adjacent part or looks up Job ID in tablet to reprint single label (`labels.print`).
- **Business Rules:** `BR-LBL-001` (Privacy guardrail: labels encode internal UUIDs; zero customer PII exposed).
- **Acceptance Criteria:**
  - Standard 2D barcode scanner decodes label in $< 100\text{ ms}$.
  - Scan events correctly update station progress in backend database.
- **Release:** Release 2
- **Dependency:** `FR-OPT-001`.
- **Source Reference:** Blueprint Section 4.8.

---

### Module 18: CNC Production Data and File Export

#### `FR-CNC-001`: Machine-Independent Production Data Generator (Stage 1 & Tier 1 Failsafe)
- **Module:** CNC Production Data and File Export
- **Requirement Title:** Universal Manufacturing Data Interchange Schema & Workshop Paper Traveler
- **Description:** Produce machine-independent, standardized JSON/CSV/XML data packages detailing parts, coordinates, edge callouts, and drilling references before any machine-specific post-processing occurs. Functions as the **Tier 1 Ultimate Failsafe**: if CNC machinery or software fails, production proceeds seamlessly via printed cutting lists and manual panel saw travelers (`BR-CNC-005`).
- **Actor:** Production Manager, Factory Operator
- **Priority:** Must Have (for Release 2)
- **Preconditions:** BOM and cutting plan approved.
- **Main Flow:**
  1. System compiles approved job data into structured neutral interchange file.
  2. Data validated against internal manufacturing schema.
  3. System renders printable, high-density cutting list travelers and edge-banding callout cards.
  4. Production team uses data for manual sliding table saw operations or generic shop planning.
- **Alternate / Error Flow:**
  - Validation error in schema: Export blocked; exception recorded.
- **Business Rules:** `BR-CNC-001` (Stage 1 machine-independence), `BR-CNC-005` (3-tier CNC fallback).
- **Acceptance Criteria:**
  - Interchange file valid against JSON Schema; zero machine vendor dependencies.
  - Factory floor can cut, edge-band, and assemble an entire order using only Tier 1 traveler outputs.
- **Release:** Release 2
- **Dependency:** `FR-OPT-001`.
- **Source Reference:** Blueprint Section 4.9.

#### `FR-CNC-002`: Verified CNC File Export Framework & Manual USB Import (Stage 2 & Tier 2 Primary Fallback)
- **Module:** CNC Production Data and File Export
- **Requirement Title:** Verified Adapter-Based CAM/CAD Export & Manual USB/Network Machine Import
- **Description:** Provide an extensible adapter framework generating machine-compatible CAM files (e.g., DXF with standardized layer conventions, WoodWOP MPR, or vendor G-Code) for verified factory equipment (such as the Homag CNC router), with mandatory human signoff prior to machine loading. Functions as the **Tier 2 Primary Operational Fallback** if automated bridge services are offline or unsupported (`BR-CNC-005`).
- **Actor:** Production Manager, CAM Specialist, Machine Operator
- **Priority:** Must Have (for Release 2)
- **Preconditions:** Machine brand, model, controller, software version, tooling library, and vendor sample files formally verified (`DEC-007`).
- **Main Flow:**
  1. User selects target verified machine adapter (e.g., `Homag-Router-Adapter-v1.0`).
  2. Adapter processes cutting plan and outputs machine files into a secure staged directory.
  3. CAM specialist inspects toolpaths in vendor simulator software (e.g. WoodWOP / NC-Studio).
  4. Specialist signs off file in SATCO portal (`cnc.approve`); file marked `APPROVED_FOR_MACHINE_IMPORT`.
  5. Operator downloads file to an authorized, encrypted factory USB drive or local SMB folder and manually imports it into the machine console.
- **Alternate / Error Flow:**
  - Target machine compatibility not verified by vendor documentation: Export disabled. System displays **"Pending Hardware Discovery"** and automatically defaults to Tier 1 manual cutting lists.
  - Simulation detects geometry or tooling error: Specialist rejects export file in portal with diagnostic note; status set to `REJECTED_CAM_SIMULATION`.
- **Business Rules:** `BR-CNC-002` (Mandatory human approval), `BR-CNC-003` (No unverified machine adapters), `BR-CNC-005` (3-tier CNC fallback).
- **Acceptance Criteria:**
  - Exported DXF/MPR files load cleanly into vendor CAM software without geometry errors or missing layers.
  - Physical test cut executed on Homag machine matches part tolerances ($\pm 0.5\text{ mm}$).
- **Release:** Release 2
- **Dependency:** `FR-CNC-001`, `DEC-007` (CNC Hardware Verification).
- **Source Reference:** Blueprint Section 4.9 & 8.1.

#### `FR-CNC-003`: Controlled Factory PC Bridge Service (Stage 3 & Tier 3 Automated Delivery)
- **Module:** CNC Production Data and File Export
- **Requirement Title:** Secure Local Factory Bridge, Automated File Push, and Air-Gapped Machine Protection
- **Description:** Deploy a lightweight, authenticated local bridge agent on a dedicated Factory PC within the local workshop network to transfer approved CAM files to the machine console directory and poll local status logs where permitted, without exposing machine controllers to the public internet. Functions as **Tier 3 Automated Delivery**; if interrupted, system falls back to Tier 2 (Manual USB) or Tier 1 (Manual Cut List) seamlessly (`BR-CNC-005`).
- **Actor:** Factory Operator, System (Automated)
- **Priority:** Could Have (Release 4)
- **Preconditions:** Release 2 manual workflow fully validated; Factory PC local network secured.
- **Main Flow:**
  1. Bridge daemon authenticates to SATCO cloud API using mTLS / rotating API token.
  2. Bridge polls for approved export files flagged for this factory node.
  3. Bridge downloads approved file and deposits it into machine's local watched directory.
  4. Machine software processes file; Bridge reads permitted completion log and updates cloud job status.
- **Alternate / Error Flow:**
  - Bridge service offline or LAN disconnected: System gracefully degrades to **Tier 2 Manual Export** with an on-screen prompt: "Bridge offline: Download CAM file manually for USB import".
  - Controller directly exposed to WAN: Prohibited by system architecture (`BR-CNC-004`).
- **Business Rules:** `BR-CNC-004` (Air-gapped security guardrail: machine controller NEVER on public IP), `BR-CNC-005` (3-tier CNC fallback).
- **Acceptance Criteria:**
  - Penetration testing verifies zero ingress attack vector to CNC controller from outside the local factory network.
  - Bridge service outage does not block factory production (Tier 2/1 fallbacks function 100%).
- **Release:** Release 4
- **Dependency:** `FR-CNC-002`, `FR-AUTH-001`.
- **Source Reference:** Blueprint Section 4.9 & Section 11.

---

### Module 19: 3D Furniture Configurator

#### `FR-3D-001`: WebGL 3D Parametric Viewer
- **Module:** 3D Furniture Configurator
- **Requirement Title:** Interactive WebGL Furniture Visualization (Three.js / React Three Fiber)
- **Description:** Provide an interactive, browser-based 3D canvas rendering low-poly glTF/GLB models of configurable furniture, supporting camera orbit, zoom, pan, dimensional morphing within approved bounds, and dynamic texture/material swaps.
- **Actor:** Customer, Sales Staff
- **Priority:** Should Have (Release 3)
- **Preconditions:** Approved 3D asset library deployed to CDN; WebGL-supported browser.
- **Main Flow:**
  1. User opens 3D visualizer on product page.
  2. WebGL canvas loads base model with realistic lighting and environment map.
  3. User modifies $W, H, D$ sliders; 3D mesh scales parametrically (preserving joinery and door border proportions via morph targets / modular node transformation).
  4. User clicks material swatch; texture maps (Diffuse, Normal, Roughness) update seamlessly.
  5. User clicks "Save Configuration"; system stores camera angle and parametric state.
- **Alternate / Error Flow:**
  - WebGL context lost or unsupported GPU: System gracefully falls back to static 2D high-resolution renders.
- **Business Rules:** `BR-3D-001` (3D preview is an artistic approximation, not a production drawing), `BR-MFG-003` (Dimensional constraint lock).
- **Acceptance Criteria:**
  - Maintains $\ge 30\text{ FPS}$ on standard mid-range mobile devices (e.g., iPhone 12, Samsung Galaxy S21).
  - Mesh scaling never distorts functional hardware (handles, hinges remain unskewed).
- **Release:** Release 3
- **Dependency:** `FR-CFG-001`, `DEC-008` (3D Asset Pipeline).
- **Source Reference:** Blueprint Section 4.10.

---

### Module 20: AI Room Design

#### `FR-AI-001`: AI-Assisted Room Concept Visualizer
- **Module:** AI Room Design
- **Requirement Title:** Generative Room Layout Suggestion and Catalogue Product Matching
- **Description:** Allow customers to upload a room photograph, specify room type (Bedroom, Living Room, Kitchen) and aesthetic style (Modern, Scandinavian, Traditional Saudi/Neoclassical), and receive AI-generated interior concept images with matched SATCO furniture pieces.
- **Actor:** Customer, Sales Staff
- **Priority:** Could Have (Release 3)
- **Preconditions:** AI provider abstraction layer configured with API budget and rate limits.
- **Main Flow:**
  1. Customer uploads room image and enters approximate room dimensions.
  2. Server sanitizes image, strips EXIF metadata, and calls AI provider abstraction.
  3. AI returns conceptual room layout image.
  4. Platform runs computer-vision / embedding match against SATCO catalogue to suggest similar real products.
  5. Customer reviews suggestion and clicks "Configure Matched Items".
- **Alternate / Error Flow:**
  - Inappropriate image uploaded: Content safety filter rejects image and prompts user.
  - AI API quota exceeded: System queues request and displays estimated wait time.
- **Business Rules:** `BR-AI-001` (Advisory disclaimer: AI designs are artistic concepts, NOT verified architectural drawings), `BR-AI-002` (Mandatory customer measurement confirmation).
- **Acceptance Criteria:**
  - UI displays prominent, persistent disclaimer: **"AI Concept Only: Requires On-Site Measurement Confirmation"**.
  - Generated designs cannot be added to cart or converted into a production job without manual dimension confirmation.
- **Release:** Release 3
- **Dependency:** `FR-3D-001`, `DEC-009` (AI Provider & Privacy Policy).
- **Source Reference:** Blueprint Section 4.11.

---

### Module 21: AR Furniture Preview

#### `FR-AR-001`: Augmented Reality (AR) Furniture Placement
- **Module:** AR Furniture Preview
- **Requirement Title:** WebXR and Device-Native AR Quick Look with 3D Fallback
- **Description:** Enable mobile users on supported devices to launch Augmented Reality preview directly from the mobile browser (Apple AR Quick Look / USDZ for iOS; Google Scene Viewer / WebXR for Android) to view configured furniture at true 1:1 physical scale in their living space.
- **Actor:** Mobile Customer
- **Priority:** Could Have (Release 3)
- **Preconditions:** User accessing site via AR-capable mobile device; USDZ/GLB asset available.
- **Main Flow:**
  1. Customer taps "View in Your Space" on mobile PDP or configurator.
  2. System detects client OS:
     - iOS: Triggers native AR Quick Look with calibrated USDZ model.
     - Android: Triggers Google Scene Viewer intent with calibrated GLB model.
  3. User points camera at floor; furniture renders at exact physical 1:1 scale.
  4. User can walk around piece, verify fit, and tap "Return to Order".
- **Alternate / Error Flow:**
  - Unsupported desktop or non-AR mobile browser: System displays modal explaining device incompatibility and opens the interactive 3D WebGL viewer as fallback.
- **Business Rules:** `BR-AR-001` (Calibrated 1:1 scale derived from validated configuration; visual placement does not waive site measurement check).
- **Acceptance Criteria:**
  - Scale tolerance within $\pm 3\%$ of actual physical dimensions on ARKit/ARCore calibrated surfaces.
  - Zero crashes on unsupported browsers.
- **Release:** Release 3
- **Dependency:** `FR-3D-001`, `DEC-010` (Target Mobile Hardware Baseline).
- **Source Reference:** Blueprint Section 4.12.

---

### Module 22: Multi-Tenant SaaS

#### `FR-TEN-001`: Multi-Tenant Isolation and Company Provisioning
- **Module:** Multi-Tenant SaaS
- **Requirement Title:** Server-Side Tenant Scoping and Data Isolation
- **Description:** Enable independent furniture manufacturing companies to register, onboard, and manage their own isolated data realms (users, products, material rates, customers, orders, inventory, and machine configs) within a unified multi-tenant software architecture.
- **Actor:** SaaS Super Admin, Company Admin
- **Priority:** Must Have (for Release 4)
- **Preconditions:** Release 1–3 single-company workflows stabilized.
- **Main Flow:**
  1. Prospective furniture company signs up for SATCO SaaS.
  2. System provisions `Company` record with unique slug, isolated file storage folder, and company administrator.
  3. All subsequent database operations automatically apply server-side `company_id` filter via Prisma middleware / Row-Level Security.
- **Alternate / Error Flow:**
  - Client attempts to query another tenant's entity by spoofing `company_id` in payload: Server middleware rejects request with `403 Forbidden` and logs security alert.
- **Business Rules:** `BR-SAAS-001` (Mandatory server-side tenant scoping), `BR-SAAS-002` (Automated cross-tenant data leakage tests).
- **Acceptance Criteria:**
  - Automated integration test suite proves 100% of API endpoints reject cross-tenant data access.
- **Release:** Release 4
- **Dependency:** `FR-AUTH-002`.
- **Source Reference:** Blueprint Section 4.13.

---

### Module 23: Subscription and Billing

#### `FR-SUB-001`: Subscription Tiers, Feature Limits and Payment Processing
- **Module:** Subscription and Billing
- **Requirement Title:** SaaS Plan Governance, Usage Metering, and Webhook Reconciliation
- **Description:** Manage company subscription tiers (Starter, Professional, Enterprise), enforce feature limits (active users, monthly production jobs, storage quota), integrate payment provider abstraction (e.g., Moyasar, Tap, or Stripe), and handle automated subscription renewals and cancellations.
- **Actor:** SaaS Super Admin, Company Admin
- **Priority:** Must Have (for Release 4)
- **Preconditions:** Multi-tenant architecture operational; payment provider credentials verified.
- **Main Flow:**
  1. Company Admin selects "Professional Plan" ($X\text{ SAR/month}$).
  2. User enters corporate payment method via hosted checkout.
  3. Payment gateway executes transaction and fires cryptographic webhook event.
  4. Server validates webhook signature, upgrades `Subscription` status to `ACTIVE`, and sets tenant feature limits.
- **Alternate / Error Flow:**
  - Payment fails: Subscription transitions to `PAST_DUE`; grace period banner shown for 7 days before downgrading to read-only access.
- **Business Rules:** `BR-SAAS-003` (Cryptographic webhook validation), `BR-SAAS-004` (Grace period data protection).
- **Acceptance Criteria:**
  - Feature limits immediately restrict actions when breached (e.g., attempting to create 11th user on 10-user plan).
- **Release:** Release 4
- **Dependency:** `FR-TEN-001`, `DEC-011` (Payment Provider Selection).
- **Source Reference:** Blueprint Section 4.13.

---

### Module 24: Reports, Audit Logs and Notifications

#### `FR-RPT-001`: Comprehensive Operational Reporting and Export
- **Module:** Reports, Audit Logs and Notifications
- **Requirement Title:** Multi-Domain Analytics, Scrap Tracking, and Financial Margin Reports
- **Description:** Provide exportable tabular and graphical reports covering Sales Quotation Conversion, Order Turnaround Lead Times, Inventory Valuation, Material Consumption vs. Waste, Workshop Station Bottlenecks, and CNC Export Logs.
- **Actor:** Company Admin, Production Manager, Read-Only Report User
- **Priority:** Must Have (Release 1 through Release 4)
- **Preconditions:** User has `reports.view` permission.
- **Main Flow:**
  1. User navigates to `/admin/reports`.
  2. User selects Date Range and Report Domain (e.g., "Sheet Yield & Waste Analysis").
  3. System aggregates metrics and renders on-screen graphs and interactive data grid.
  4. User clicks "Export to Excel / CSV" or "Generate PDF Summary".
- **Alternate / Error Flow:**
  - Large query date range ($> 1\text{ year}$): Server queues background job and sends in-app notification when download is ready.
- **Business Rules:** `BR-SEC-001`.
- **Acceptance Criteria:**
  - Financial calculations match ledger transactions exactly.
- **Release:** Release 1 (Core reports), expanded in Release 2–4.
- **Dependency:** `FR-ADM-001`.
- **Source Reference:** Blueprint Section 4.3 & 7.1.

#### `FR-RPT-002`: Immutable Security and Operational Audit Log
- **Module:** Reports, Audit Logs and Notifications
- **Requirement Title:** Tamper-Proof Activity and System Change Audit Trail
- **Description:** Record all critical business mutations (Pricing rule modifications, discount overrides, quote approvals, order cancellations, stock adjustments, manual CNC file approvals, and user permission changes) into an append-only audit log capturing Actor ID, Timestamp, IP Address, Previous State, and New State.
- **Actor:** System (Automated)
- **Priority:** Must Have (Release 1)
- **Preconditions:** Any mutation executed on auditable entities.
- **Main Flow:**
  1. Mutation event occurs (e.g., `updateMaterialRate`).
  2. Middleware intercepts transaction and appends row to `AuditLog` table.
  3. Audit record is immutable (no update or delete permissions granted to any application role).
- **Alternate / Error Flow:**
  - Audit logging failure: Abort the primary business transaction to maintain audit compliance.
- **Business Rules:** `BR-SEC-002` (Immutable audit trail).
- **Acceptance Criteria:**
  - Zero application mechanisms exist to edit or delete rows in `AuditLog`.
- **Release:** Release 1
- **Dependency:** `FR-AUTH-001`.
- **Source Reference:** Blueprint Section 4.3, 6.1, 7.1.

#### `FR-RPT-003`: Total Reporting & Executive BI Command Center
- **Module:** Reports, Audit Logs and Notifications
- **Requirement Title:** Cross-Domain Business Intelligence, P&L, Factory Yield, and Accounts Receivable Aging
- **Description:** Provide the CEO, CFO, and Factory Operations Manager with an executive business intelligence command dashboard unifying commercial sales conversion funnels, real-time profit & loss (P&L), accounts receivable due aging, factory raw sheet scrap yield, and station throughput metrics.
- **Actor:** Company Admin, Executive Leadership, Finance Officer
- **Priority:** Must Have (Release 1 / Release 2)
- **Preconditions:** User authenticated with `reports.view` permission.
- **Main Flow:**
  1. Executive opens `/admin/reports/executive-bi`.
  2. Dashboard displays real-time aggregated metrics:
     - Commercial Funnel: Web Visits $\to$ Configurator Opens $\to$ Enquiries $\to$ Quotes $\to$ Orders.
     - Cash Flow & Dues: Total Booked Value, Verified Cash Inflow, Uncollected Dues by Aging Bucket (1–15, 16–30, 30+ days).
     - Factory Yield: Total Board Sheets Consumed, Net Panel Area vs. Total Scrap Overhead, CNC Spindle Run-Time, Station Work-in-Progress (WIP).
  3. Executive filters by date range, furniture category, or factory production line, and exports executive briefing PDFs.
- **Alternate / Error Flow:**
  - Heavy data aggregation: Analytical queries execute against read-only replicas or materialized views to guarantee $< 1.0\text{s}$ dashboard load without locking transactional tables.
- **Business Rules:** `BR-SEC-001` (RBAC data visibility), `BR-SAAS-001` (Tenant data isolation).
- **Acceptance Criteria:**
  - Financial numbers reconcile 100% against the sales order and payment transaction ledgers.
- **Release:** Release 1 (Baseline), expanded in Release 2.
- **Dependency:** `FR-ORD-001`, `FR-ORD-004`, `FR-PRD-001`, `FR-RPT-001`.
- **Source Reference:** Strategic Backlog `idea.md` Section 4.3.

---

## 9. Business Rules

The following core business rules represent absolute constraints governing the platform's calculation engines, security boundaries, and factory workflows. Every rule must be enforced on the server.

| Rule ID | Domain | Business Rule Statement & Mathematical Logic | Enforcement Mechanism | Source Reference |
| :--- | :--- | :--- | :--- | :--- |
| **`BR-PRICE-001`** | Pricing | **Prohibition of Pure Volumetric Pricing:** A furniture price shall NEVER be computed solely using external dimensions ($W \times H \times D \times \text{Rate}$). Pricing must derive from product-specific formulas factoring substrate square meters, edging linear meters, hardware unit rates, labor operations, and scrap overhead. | Server Pricing Engine validation | Blueprint Section 4.2 |
| **`BR-PRICE-002`** | Pricing | **Immutability of Pricing Rule Versions:** Every issued quotation must bind and store an immutable `pricing_rule_version_id` and snapshot of unit rates. Future modifications to company rate cards or formula parameters shall never rewrite or alter previously approved quotations. | Database foreign key and snapshot schema | Blueprint Section 4.2 & 6.1 |
| **`BR-PRICE-003`** | Pricing | **Zero Guesswork / Mandatory Fallback:** If any required material rate, hardware cost, or construction formula coefficient is missing or unverified, the pricing engine is strictly prohibited from guessing or returning zero. It must output `REQUEST_A_QUOTE` / `REQUIRES_MANUAL_REVIEW`. | Pricing Engine exception handling | Blueprint Section 4.2 & Section 11 |
| **`BR-MFG-001`** | Manufacturing | **Product-Specific Joinery Logic:** Bill of Materials (BOM) formulas and part dimensional extraction rules are strictly product-specific and version-controlled. The system shall never assume generic joinery deductions across different cabinet categories. | BOM Template versioning | Blueprint Section 4.6 |
| **`BR-MFG-002`** | Manufacturing | **Approved Order Lineage:** A Production Job cannot be created in isolation. It must be strictly bound to an Approved Sales Order (`order_id`) and an approved manufacturing specification revision (`bom_revision_id`). | Database foreign key constraint | Blueprint Section 4.4 & 6.2 |
| **`BR-MFG-003`** | Manufacturing | **Dimensional Hard Bounds:** Parametric configurations must strictly respect engineering limits ($W_{min}\dots W_{max}$, $H_{min}\dots H_{max}$, $D_{min}\dots D_{max}$). Inputs outside bounds must be rejected on the server. | Zod / JSON Schema server validation | Blueprint Section 4.2 & 4.10 |
| **`BR-MFG-004`** | Manufacturing | **BOM Revision Immutability:** Once a BOM revision is released to cutting, it cannot be modified in place. Engineering alterations require generating a new incremented revision (e.g., Rev B) with logged change rationale. | Append-only revision tables | Blueprint Section 4.6 |
| **`BR-MFG-005`** | Manufacturing | **Visual Preview Disclaimer:** A customer-facing 3D preview, CAD wireframe, or AR placement model is an aesthetic approximation and is NEVER a manufacturing drawing. Workshop fabrication requires an approved BOM. | UI labeling & architectural data isolation | Blueprint Section 1, 4.10, 11 |
| **`BR-MFG-006`** | Manufacturing | **Material Batch Segregation:** The cutting list engine and optimizer must strictly segregate parts by identical material ID and thickness. Mixed-substrate nesting is physically prohibited. | Optimizer pre-filtering logic | Blueprint Section 4.7 |
| **`BR-INV-001`** | Inventory | **Auditable Stock Movements Only:** Direct manual overwriting of stock balance quantities in the database is prohibited. Every inventory change must be logged as a discrete `StockMovement` row (`RECEIPT`, `ISSUE`, `RETURN`, `ADJUSTMENT`) with user attribution and reason. | Database trigger / Service layer encapsulation | Blueprint Section 4.5 |
| **`BR-INV-002`** | Inventory | **Pre-Production Material Reservation:** Approval of a production job triggers automatic reservation of required sheet stock and hardware. Unreserved stock cannot be allocated to new jobs. | Transactional inventory reservation service | Blueprint Section 4.5 |
| **`BR-CUT-001`** | Cutting | **Physical Boundary & Kerf Enforcement:** A cutting plan must account for perimeter trimming ($T_{trim}$ on 4 sides), saw blade kerf ($K_{saw}$ between cuts), and wood grain rotation locks. No placed part can exceed usable board area. | Algorithmic geometry verifier | Blueprint Section 4.7 |
| **`BR-CUT-002`** | Cutting | **Human Approval of Optimization Plans:** Algorithmic cutting plans are treated as recommendations until an authorized production supervisor reviews and explicitly approves the layout for floor release. | Approval state machine (`cutting.approve`) | Blueprint Section 4.7 & 12 |
| **`BR-LBL-001`** | Labels | **Part Label Privacy & Security:** Barcode and QR labels affixed to furniture panels shall encode only internal secure UUID tokens. No customer names, phone numbers, or delivery addresses shall be encoded in the barcode string. | Label generator serializer | Blueprint Section 4.8 |
| **`BR-CNC-001`** | CNC | **Stage 1 Machine Independence:** The primary production data generator must output standardized, vendor-neutral data structures (BOM, cut lists, edge schedules) independent of any specific CNC machine brand or controller. | Architecture boundary | Blueprint Section 4.9 |
| **`BR-CNC-002`** | CNC | **Mandatory Human-in-the-Loop CAM Approval:** Generated CNC export files (DXF, MPR, G-code) must be reviewed by a human operator in machine simulation software and formally signed off before being released for machine execution. | State machine gate (`cnc.approve`) | Blueprint Section 4.9 & 12 |
| **`BR-CNC-003`** | CNC | **Vendor Compatibility Pre-Verification:** No machine-specific export adapter shall be deployed into production until vendor documentation, controller specifications, tooling tables, and physical test cut samples are verified. | Release gate verification | Blueprint Section 4.9 & 8.1 |
| **`BR-CNC-004`** | CNC | **Air-Gapped Machine Controller Protection:** CNC controllers, workshop saws, and routing machines must NEVER be exposed directly to the public Internet. Communication occurs exclusively through local, authenticated factory bridge services. | Network architecture & security policy | Blueprint Section 4.9 & Section 11 |
| **`BR-AI-001`** | AI | **Advisory AI Status:** AI-generated room renderings and spatial arrangements are artistic concepts and advisory suggestions only. They must never be treated as verified room measurements or production-ready drawings. | UI watermark & service contract | Blueprint Section 4.11 & Section 11 |
| **`BR-AI-002`** | AI | **Mandatory Room Measurement Confirmation:** A customer cannot convert an AI room design into a binding quotation or sales order without manually inputting and confirming real physical wall dimensions. | Form wizard validation gate | Blueprint Section 4.11 |
| **`BR-AR-001`** | AR | **True 1:1 Scale Calibration:** AR previews must calibrate virtual asset scale directly from validated configuration dimensions ($W, H, D$ in mm). Scaling controls must maintain 100% physical fidelity. | USDZ / WebXR calibration layer | Blueprint Section 4.12 |
| **`BR-SAAS-001`** | Multi-Tenancy | **Mandatory Server-Side Tenant Scoping:** Every database query affecting tenant data must enforce `company_id` scoping at the backend service/ORM layer. Client-supplied tenant IDs must never be blindly trusted. | Prisma query middleware / RLS | Blueprint Section 4.13 & Section 11 |
| **`BR-SAAS-002`** | Multi-Tenancy | **Automated Data Isolation Proof:** Automated security integration tests must execute before every release to prove that Tenant A cannot access or mutate Tenant B's data under any condition. | CI/CD test gate | Blueprint Section 4.13 & 7.3 |
| **`BR-SAAS-003`** | Multi-Tenancy | **Server-Side Payment Webhook Verification:** Subscription plan state changes and payment authorizations must be verified server-side using cryptographic webhook signatures. Client callbacks are untrusted. | Cryptographic HMAC validation | Blueprint Section 4.13 |
| **`BR-SEC-001`** | Security | **Server-Side RBAC Enforcement:** User permissions must be strictly verified on the server for every API route. Hiding, disabling, or graying out UI buttons does not constitute authorization. | API middleware guards | Blueprint Section 2.3 & 7.1 |
| **`BR-SEC-002`** | Security | **Immutable Audit Trail:** All approvals, price modifications, manual discounts, stock adjustments, file exports, and role reassignments must create an immutable, append-only audit record. | Database append-only table | Blueprint Section 4.3 & 7.1 |
| **`BR-MAT-001`** | Materials | **Physical Catalogue Decoupling:** Physical material parameters (dimensions, core substrates, thicknesses, finishes, SKUs) are managed independently from financial rate cards. Storekeepers maintain physical specifications (`materials.write`) but cannot alter pricing rates. | Schema separation & API RBAC | Blueprint Section 4.5 |
| **`BR-RTE-001`** | Pricing | **Financial Rate Authority Separation:** Material purchase costs, square-meter board rates, edging rates, labor hourly rates, and margin markups can ONLY be modified by users with `rates.write` (Company Admin / Finance). Workshop storekeepers are strictly excluded. | API middleware RBAC gate | Blueprint Section 4.2 & 4.3 |
| **`BR-PRICE-004`** | Quotation | **Tiered Commercial Discount Approvals:** Sales Representatives can apply discounts up to $5.0\%$ (discretionary). Discounts between $5.01\%$ and $15.0\%$ mandate Sales Manager approval (`quotes.approve`). Discounts exceeding $15.0\%$ mandate Company Admin executive approval. | Server-side discount state machine | Blueprint Section 4.3 |
| **`BR-QTE-001`** | Quotation | **Quotation State Transitions & Expiry:** Quotations transition through `DRAFT` $\to$ `PENDING_APPROVAL` (if discount exceeds author's limit) $\to$ `ISSUED` $\to$ `CUSTOMER_ACCEPTED` / `REVISED` / `EXPIRED` (14 days default) $\to$ `CONVERTED`. Revisions generate a new version and revoke previous customer acceptance. | Quotation lifecycle service | Blueprint Section 4.3 |
| **`BR-SEC-003`** | Security | **Cryptographically Signed Portal Links:** Customer portal quotation URLs must utilize HMAC-SHA256 signed tokens with a 14-day TTL. Links must never expose sequential database IDs. Tokens are immediately revoked upon quotation revision, conversion, or cancellation. | Cryptographic URL generator & middleware | Blueprint Section 4.1 & 7.1 |
| **`BR-SEC-004`** | Privacy | **Saudi PDPL Compliance & Shop-Floor PII Masking:** In accordance with Saudi Personal Data Protection Law (Royal Decree M/19), customer PII is encrypted at rest (AES-256) and in transit (TLS 1.3). Shop-floor travelers, station screens, and barcode labels MUST NEVER expose customer names or phone numbers. | KMS encryption & label serializer | Blueprint Section 7.1 & 4.8 |
| **`BR-ORD-003`** | Order / Mfg | **Distinct Order vs. Production Job Lifecycles:** Commercial Sales Orders and physical Production Jobs have independent state lifecycles. One Order can spawn multiple ProductionJobs. Order cancellation halts linked jobs (`ON_HOLD - ORDER_CANCELLED`) without altering executed cutting data. | Service domain boundary | Blueprint Section 4.4 & 6.2 |
| **`BR-LOC-003`** | Localization | **Saudi Mobile Number Validation & Normalization:** All customer mobile numbers must pass regex `^(?:\+966|00966|0)?5[0-9]{8}$` and normalize to E.164 (`+9665xxxxxxxx`). Submitting high-value quotes requires 4-digit SMS OTP verification via a licensed Saudi telecom gateway. | Zod validator & SMS service | Blueprint Section 4.1 & 9 |
| **`BR-CNC-005`** | CNC | **3-Tier Hierarchical CNC Integration Fallback:** Factory operations implement a 3-tier fallback hierarchy: Tier 3 (Automated Factory PC Bridge over LAN), Tier 2 (Manual CAM file export via USB/network share), and Tier 1 (Machine-independent workshop cut list travelers & barcodes). Factory production never halts if CNC software or network bridge is unavailable. | Multi-tier export service | Blueprint Section 4.9 & 8.1 |
| **`BR-PRICE-005`** | Pricing | **Coupon Non-Stacking & Budget Safeguard:** Promotional coupons cannot stack with sales representative discretionary discounts (`BR-PRICE-004`). If a rep applies a manual discount, the coupon code is deactivated, or the customer must select the higher discount. Total campaign redemptions are constrained by an absolute budgetary cap in SAR. | Pricing Engine validation & atomic coupon locks | Strategic Backlog `idea.md` Section 1.4 |
| **`BR-ORD-005`** | Due Mgmt | **Mandatory Milestone 2 Pre-Dispatch Hold Gate:** Completed furniture orders cannot be assigned to delivery manifests or loaded onto transport vehicles if Milestone 2 (Pre-Dispatch balance, e.g. 40%) is unpaid. The logistics interface locks shipping generation with `DISPATCH_HOLD - DUE_PAYMENT` until payment receipt is verified. | Order state machine & logistics lock | Strategic Backlog `idea.md` Section 3.1 |
| **`BR-SEC-005`** | Anti-Fraud | **Zero Saw Blade Cuts Without Commercial Deposit:** A Production Job cannot transition to `READY_FOR_PRODUCTION` or execute physical panel sawing without a confirmed, verified bank/payment gateway deposit record. Unfunded orders are strictly quarantined to protect raw board inventory and workshop throughput. | State transition guard & financial ledger check | Strategic Backlog `idea.md` Section 2.1 |
| **`BR-INS-001`** | Installation | **Mandatory Customer Digital Handover E-Signature:** Order status cannot transition from `OUT_FOR_DELIVERY` to `INSTALLED_HANDOVER` or unlock Milestone 3 final payment billing without capturing an on-site customer digital e-signature verifying physical room inspection and assembly sign-off. | Field app e-signature canvas & order state gate | Stakeholder Decision Nov 2026 |
| **`BR-WAR-001`** | Warranty | **Configurable Warranty Governance & Single-Part RMA:** Custom furniture carries a configurable warranty: standard 2-year substrate structural warranty and 1-to-2 year mechanical hardware warranty. In-warranty defect claims for damaged panels trigger isolated single-part RMA jobs extracting historical BOM dimensions directly to the CNC without full unit remake. | Warranty service & single-part BOM generator | Stakeholder Decision Nov 2026 |
| **`BR-SMP-001`** | Samples | **Material Sample Box Terms & Order Credit:** Online requests for material sample boxes are free for customer pickup at SATCO factory or showroom; courier delivery requires a nominal deposit (e.g. 100 SAR) that is 100% credited against any subsequent furniture order exceeding 5,000 SAR. | Sample voucher service & checkout discount validator | Stakeholder Decision Nov 2026 |

---

## 10. User Journeys and End-to-End Workflows

### `UJ-01`: Customer Product Browse $\to$ Configure $\to$ Enquiry / Quote Request (Saudi Mobile & OTP)
- **Actor:** Customer (B2C Homeowner or Interior Designer)
- **Preconditions:** Customer visits SATCO bilingual website; published products exist in catalogue.
- **Main Steps:**
  1. Customer browses catalogue categories (e.g., "Modular Wardrobes") and selects a base product model.
  2. Customer adjusts parametric dimensions ($W = 2400\text{ mm}, H = 2600\text{ mm}, D = 600\text{ mm}$) within permitted limits.
  3. Customer selects board material (e.g., "Oak Textured Melamine 18mm"), matching edge-banding, and soft-close hinges.
  4. Pricing Engine computes instantaneous estimated price breakdown using active `PricingRuleVersion` (`FR-PRC-001`, `FR-RTE-001`).
  5. Customer clicks "Request Formal Quotation", inputs Name, Saudi Mobile (validated via regex `^(?:\+966|00966|0)?5[0-9]{8}$` and normalized to `+9665xxxxxxxx`), Delivery City, and room notes.
  6. System dispatches a 4-digit SMS OTP via Saudi telecom gateway (Unifonic / Taqnyat / STC) with a 3-minute TTL (`BR-LOC-003`).
  7. Customer enters valid OTP; system validates identity, serializes configuration snapshot, creates `Enquiry` record, and returns a cryptographically signed portal tracking link (`BR-SEC-003`).
- **Alternative / Error Flow:**
  - *Invalid Phone or OTP Failure:* Invalid phone format prevents form submission; expired OTP allows 1-click resend after 60s cooldown.
  - *Missing Rate:* If selected finish lacks an active rate, Pricing Engine displays "Request a Quote"; customer submits enquiry without an invented price (`BR-PRICE-003`).
- **Expected Outcome:** Verified enquiry queued in Sales dashboard; customer receives secure portal link via SMS and email.

### `UJ-02`: Sales Enquiry Review $\to$ Quotation Prepare $\to$ Tiered Discount $\to$ Signed Portal Link
- **Actor:** Sales Staff, Sales Manager, Company Admin
- **Preconditions:** Unassigned enquiry exists in queue; sales staff has `quotes.write` permission.
- **Main Flow:**
  1. Sales representative claims enquiry from Sales Inbox and reviews customer configuration snapshot.
  2. Sales clicks "Prepare Quotation"; system calculates baseline pricing from active `PricingRuleVersion` (`FR-PRC-001`, `FR-RTE-001`).
  3. Sales applies commercial discount governed by tiered approval thresholds (`BR-PRICE-004`):
     - Discretionary up to $5.0\%$ (Sales Rep).
     - $> 5.0\%$ to $15.0\%$ mandates Sales Manager approval (`quotes.approve`).
     - $> 15.0\%$ mandates Company Admin executive approval.
  4. Once approved, quote status transitions to `ISSUED` (14-day expiry timer begins).
  5. System generates bilingual PDF and a cryptographically signed HMAC-SHA256 Customer Portal URL (`https://satco.sa/portal/quote?token=...`) with 14-day TTL (`BR-SEC-003`).
  6. Customer opens link, enters SMS OTP to view contract terms, and clicks "Accept Quote"; status transitions to `CUSTOMER_ACCEPTED`.
- **Alternative / Error Flow:**
  - *Discount Exceeds Rep Limit:* Status sets to `PENDING_DISCOUNT_APPROVAL`; manager receives dashboard alert and approves/rejects with audit note.
  - *Customer Requests Spec Change:* Sales creates revision (v2); system archives v1 and immediately revokes v1's portal token (`BR-SEC-003`).
- **Expected Outcome:** Binding, version-locked quotation accepted via secure signed portal link.

### `UJ-03`: Customer Accepted Quotation $\to$ Deposit Verification $\to$ Formal Order Creation
- **Actor:** Sales Staff, Finance / Company Admin
- **Preconditions:** Quotation is in `CUSTOMER_ACCEPTED` status; customer deposit payment received.
- **Main Flow:**
  1. Sales staff verifies customer deposit payment against company bank account.
  2. Sales clicks "Convert to Order" on accepted quotation.
  3. System initiates atomic database transaction:
     - Creates `Order` record with unique commercial number (e.g. `ORD-2026-0044`).
     - Initializes order status: `DEPOSIT_CONFIRMED` $\to$ `PENDING_SPEC_REVIEW`.
     - Locks commercial price, VAT calculations, delivery commitments, and specification snapshot.
     - Transitions Quotation status to `CONVERTED`.
  4. System emits `OrderApprovedEvent` notifying factory engineering for specification review (`BR-ORD-003`).
- **Alternative / Error Flow:**
  - *Deposit Unverified:* Order conversion blocked until deposit receipt is approved.
- **Expected Outcome:** Immutable commercial sales order created and queued for factory engineering review.

### `UJ-04`: Approved Order $\to$ Production Specification Review $\to$ Production Job(s) Dispatch
- **Actor:** Production Manager
- **Preconditions:** Order status is `PENDING_SPEC_REVIEW`.
- **Main Flow:**
  1. Production Manager opens Order detail screen and verifies manufacturing feasibility against factory machine capabilities.
  2. Manager clicks "Approve Production Specification"; order status transitions to `SPEC_APPROVED`.
  3. Manager clicks "Generate Production Job(s)"; system supports 1-to-many relationship (e.g., splitting a 4-room order into `JOB-2026-0044-A` and `JOB-2026-0044-B`).
  4. Each ProductionJob follows its dedicated shop-floor state machine (`BR-ORD-003`):
     $$\text{DRAFT} \longrightarrow \text{PENDING\_BOM} \longrightarrow \text{BOM\_APPROVED} \longrightarrow \text{MATERIAL\_RESERVED} \longrightarrow \text{READY\_FOR\_PRODUCTION} \longrightarrow \text{CUTTING} \longrightarrow \text{EDGE\_BANDING} \longrightarrow \text{MACHINING} \longrightarrow \text{ASSEMBLY} \longrightarrow \text{QUALITY\_CHECK} \longrightarrow \text{PACKED} \longrightarrow \text{COMPLETED}$$
  5. Parent Order automatically reflects `IN_PRODUCTION` once jobs enter the floor.
- **Alternative / Error Flow:**
  - *Engineering Feasibility Rejection:* Manager flags `SPEC_REJECTED` with technical notes; sales notified to consult customer.
  - *Customer Cancels Order:* Order status transitions to `CANCELLED`; system updates linked jobs to `ON_HOLD - ORDER_CANCELLED` without deleting executed cutting data.
- **Expected Outcome:** Clear separation between commercial order contract and physical workshop jobs.

### `UJ-05`: Material Availability $\to$ Reservation $\to$ Issue $\to$ Return / Adjustment
- **Actor:** Storekeeper, Production Manager
- **Preconditions:** Production job created; BOM parts defined.
- **Main Flow:**
  1. System checks BOM material requirements against current warehouse `StockBalance`.
  2. System creates `MaterialReservation` reserving 12 sheets of 18mm White Melamine MDF and 45m of 1mm Edge-band.
  3. When cutting begins, storekeeper executes `ISSUE_TO_JOB` on station tablet; physical inventory decrements and movement ledger records transaction.
  4. After production, 1 unopened sheet remains unused; storekeeper records `RETURN_FROM_JOB`, restoring 1 sheet to active inventory.
- **Alternative / Error Flow:**
  - *Stockout:* Insufficient free sheets; system sets job to `MATERIAL_PENDING` and triggers inventory reorder alert.
  - *Damage Scrap:* 1 sheet damaged during handling; storekeeper logs `ADJUSTMENT` with reason code `DAMAGED_IN_TRANSIT` (`BR-INV-001`).
- **Expected Outcome:** 100% auditable inventory ledger with zero manual balance tampering.

### `UJ-06`: Production Job $\to$ BOM $\to$ Parts $\to$ Cutting Plan $\to$ Approval
- **Actor:** Production Manager
- **Preconditions:** Production job in `READY_FOR_PRODUCTION` status.
- **Main Flow:**
  1. Manager triggers "Generate BOM"; system executes product-specific joinery formulas and extracts individual panels.
  2. System derives raw cutting dimensions by deducting edge-band thickness and tags wood grain direction.
  3. Manager groups parts into cutting batches by material/thickness.
  4. Manager executes "Optimize Cutting Plan"; algorithm nests parts onto standard sheets respecting saw kerf, edge trim, and grain rotation locks.
  5. Manager reviews visual cutting diagrams, sheet count, and waste percentage (e.g., 9.4% scrap).
  6. Manager clicks "Approve Cutting Plan"; layout is locked for shop floor release (`BR-CUT-002`).
- **Alternative / Error Flow:**
  - *Oversized Part:* Component length exceeds maximum board size (e.g., panel is 2900mm on 2440mm board); optimizer flags "Unplaced Part: Exceeds Board Dimension" and halts approval.
- **Expected Outcome:** Approved, physically valid cutting plan ready for operator execution.

### `UJ-07`: CNC Export $\to$ Human Review $\to$ 3-Tier Fallback Execution $\to$ Production Outcome
- **Actor:** Production Manager, CAM Specialist, CNC Machine Operator
- **Preconditions:** Cutting plan approved; Homag machine adapter verified (`DEC-007`).
- **Main Flow:**
  1. CAM Specialist selects target machine adapter (`Homag-CNC-Router-v1.0`) and clicks "Generate Machine Files" (`FR-CNC-002`).
  2. Adapter processes cutting layout and generates machine files (DXF/MPR with standardized layer definitions).
  3. Specialist opens files in vendor simulation software (WoodWOP / NC-Studio) and inspects tooling paths.
  4. Specialist signs off in SATCO portal (`cnc.approve`); file marked `APPROVED_FOR_MACHINE_IMPORT`.
  5. **Tier 3 (Automated Bridge):** Local Factory PC Bridge daemon detects approved file and deposits it into machine input watch folder on workshop LAN (`FR-CNC-003`).
  6. Operator confirms file at machine console, cuts panels, prints barcode labels, and logs cutting stage completion.
- **Alternative / Error Flow (3-Tier Hierarchical Fallback - `BR-CNC-005`):**
  - *Bridge Outage (Tier 2 Fallback):* If the local bridge daemon or LAN drops, operator downloads approved files manually onto an encrypted factory USB drive or local SMB folder to load into the machine console.
  - *Machine Hardware / CAM Failure (Tier 1 Fallback):* If CNC router software fails, controller is unverified, or machine is down for service, factory immediately falls back to **Tier 1 Failsafe**: operator uses printed machine-independent cutting lists, manual sliding table saw travelers, edge callout sheets, and thermal barcode labels (`FR-CNC-001`). Workshop throughput never halts.
  - *Simulation Tooling Error:* Specialist rejects file in portal with diagnostic note; status set to `REJECTED_CAM_SIMULATION`.
- **Expected Outcome:** Panels fabricated accurately on physical machinery with 100% operational continuity regardless of software/network state.

### `UJ-08`: 3D Configuration $\to$ Save $\to$ Quotation Request
- **Actor:** Customer
- **Preconditions:** WebGL-compatible browser; 3D configurator active on PDP.
- **Main Flow:**
  1. Customer launches 3D view and orbits camera around furniture model.
  2. Customer drags parametric handles to expand wardrobe width; 3D model scales realistically while maintaining door frame proportions.
  3. Customer swaps finishes to "Dark Walnut Melamine"; textures and reflections update in real time.
  4. Customer clicks "Save Design"; system saves 3D state and generates unique shareable design token.
  5. Customer proceeds to submit quotation request bound to the saved 3D design token.
- **Alternative / Error Flow:**
  - *Exceeding 3D Limits:* Customer attempts to stretch cabinet beyond 3000mm; handles lock at maximum permitted boundary with warning tooltip.
- **Expected Outcome:** Saved 3D configuration linked to sales enquiry for sales team reference.

### `UJ-09`: AI Room Design $\to$ Customer Measurement Confirmation $\to$ Product Matching $\to$ Quotation
- **Actor:** Customer, Sales Consultant
- **Preconditions:** AI room design feature enabled; customer on mobile or desktop.
- **Main Flow:**
  1. Customer uploads smartphone photo of empty bedroom and selects "Modern Neoclassical" style.
  2. AI generates conceptual interior design suggestion displaying arranged furniture.
  3. Platform computer-vision engine identifies wardrobe and nightstands, matching them to SATCO catalog items.
  4. System prompts customer with mandatory dialog: *"Confirm Actual Room Dimensions Before Quoting"*.
  5. Customer inputs confirmed wall measurements ($4200\text{ mm} \times 3800\text{ mm}$).
  6. Matched catalog items are populated in the parametric configurator with confirmed dimensions and submitted for quote.
- **Alternative / Error Flow:**
  - *Customer Skips Measurement:* Customer attempts to quote directly from AI image without confirming dimensions; system blocks checkout and displays mandatory measurement step (`BR-AI-002`).
- **Expected Outcome:** Customer inspired by AI visuals, but quote generated purely from verified physical dimensions.

### `UJ-10`: AR Preview $\to$ Saved Configuration / 3D Fallback
- **Actor:** Mobile Customer
- **Preconditions:** Customer configuring furniture on smartphone.
- **Main Flow:**
  1. Customer taps "View in Your Room" on mobile device.
  2. System detects ARKit (iOS) or ARCore (Android) support.
  3. Camera opens; customer scans floor plane; 3D model appears at calibrated 1:1 physical scale.
  4. Customer verifies clearance against adjacent door swing and bedroom walls.
  5. Customer taps "Confirm Fit & Return"; configuration saved.
- **Alternative / Error Flow:**
  - *Incompatible Device:* Customer opens link on laptop or unsupported mobile browser; system displays toast: *"AR not supported on this device. Viewing in interactive 3D"* and launches WebGL viewer smoothly.
- **Expected Outcome:** Customer confident in physical fit; zero UI crashes across legacy devices.

### `UJ-11`: SaaS Tenant Onboarding $\to$ Users and Permissions $\to$ Subscription Lifecycle
- **Actor:** External Furniture Company Admin, SaaS Super Admin
- **Preconditions:** Multi-tenant SaaS module active (Release 4).
- **Main Flow:**
  1. Furniture Company registers at `/saas/signup`, selects "Professional Plan", and inputs billing info.
  2. System provisions tenant workspace (`company_id`), default warehouse, and company administrator user.
  3. Company Admin invites 5 team members (Sales, Production, Storekeeper) assigning specific RBAC roles.
  4. Tenant configures company brand logo, standard sheet sizes, and custom material rate cards.
  5. Monthly subscription recurs automatically; payment provider fires webhook; system logs invoice and keeps account in `ACTIVE` state.
- **Alternative / Error Flow:**
  - *Card Expiry / Payment Failure:* Payment fails; system marks subscription `PAST_DUE`, enters 7-day grace period with warning banner, and prevents new job creation after grace expiry while preserving data read access.
- **Expected Outcome:** Fully isolated tenant operating independently with automated SaaS billing.

---

## 11. User Roles and Permission Requirements

### 11.1 Role-to-Permission Matrix
The following matrix defines the baseline permissions across system roles. Every permission check must be verified on the server for each API call. Hiding UI elements alone does not constitute authorization (`BR-SEC-001`).

| Permission Code | Description | Customer | Sales Staff | Production Manager | Store / Inventory | Factory Operator | Field Installer | Company Admin | SaaS Super Admin | Read-Only User |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `products.read` | View published products and pricing bounds | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | No | **Yes** | **Yes** | **Yes** |
| `products.write` | Create, edit, translate, archive products/categories | No | No | No | No | No | No | **Yes** | **Yes** | No |
| `materials.read` | View physical board specifications, thicknesses, SKUs | No | **Yes** | **Yes** | **Yes** | **Yes** | No | **Yes** | **Yes** | **Yes** |
| `materials.write`| Manage physical material specs, board sizes, finishes | No | No | No | **Yes** | No | No | **Yes** | **Yes** | No |
| `rates.read` | View material rate cards, board $\text{m}^2$ rates, labor costs | No | **Yes** | No | **Yes** *(Valuation)* | No | No | **Yes** | **Yes** | **Yes** |
| `rates.write` | Create/edit pricing rule versions, margins, unit rates | No | No | No | **No (Forbidden)** | No | No | **Yes** | **Yes** | No |
| `quotes.read` | View customer enquiries and quotations | Self | **Yes** | **Yes** | No | No | No | **Yes** | **Yes** | **Yes** |
| `quotes.write` | Prepare, calculate, and revise quotations | No | **Yes** | No | No | No | No | **Yes** | **Yes** | No |
| `quotes.approve` | Formally approve binding quotes / discount overrides | No | Tier 2 *(Mgr)* | No | No | No | No | **Yes** | **Yes** | No |
| `orders.manage` | Convert quotes, update order state, cancel orders | Self | **Yes** | No | No | No | No | **Yes** | **Yes** | No |
| `production.assign`| Create production jobs, assign floor stations | No | No | **Yes** | No | No | No | **Yes** | **Yes** | No |
| `production.update`| Update manufacturing stage, report station scrap | No | No | **Yes** | No | **Yes** | No | **Yes** | **Yes** | No |
| `inventory.read` | View stock balances, warehouses, movement logs | No | No | **Yes** | **Yes** | No | No | **Yes** | **Yes** | **Yes** |
| `inventory.adjust`| Execute stock receipts, issue to jobs, manual scrap | No | No | No | **Yes** | No | No | **Yes** | **Yes** | No |
| `reports.view` | View operational KPIs, margin analysis, yield stats | No | No | **Yes** | No | No | No | **Yes** | **Yes** | **Yes** |
| `installation.read`| View assigned delivery routes, room specs, parts lists | No | No | No | No | No | **Yes** | **Yes** | **Yes** | No |
| `installation.update`| Log on-site arrival, site readiness, assembly progress | No | No | No | No | No | **Yes** | **Yes** | **Yes** | No |
| `handover.signoff`| Capture customer digital signature, mark handover complete | No | No | No | No | No | **Yes** | **Yes** | **Yes** | No |
| `warranty.manage`| Review defect claims, authorize single-part CNC remakes | No | No | **Yes** | No | No | No | **Yes** | **Yes** | No |
| `users.manage` | Invite, edit, deactivate company users and roles | No | No | No | No | No | No | **Yes** | **Yes** | No |
| `roles.manage` | Author custom role definitions and permission maps | No | No | No | No | No | No | **Yes** | **Yes** | No |
| `cnc.export` | Generate machine-independent/CAM export files | No | No | **Yes** | No | No | No | **Yes** | **Yes** | No |
| `cnc.approve` | Review and sign off export files for machine import | No | No | **Yes** | No | No | No | **Yes** | **Yes** | No |
| `platform.superadmin`| Global tenant provisioning, SaaS plan billing setup | No | No | No | No | No | No | No | **Yes** | No |

*Note on Customer Access:* Customer users authenticate via public customer portal and access only their own quotations (`quotes.read` where `customer_id = session.user.id`) and order delivery statuses.


---

## 12. Data and Information Requirements

### 12.1 Conceptual Entity Mapping by Domain

| Domain | Core Conceptual Entities | Architectural Purpose |
| :--- | :--- | :--- |
| **Identity** | `User`, `Role`, `Permission`, `UserRole`, `Session` | Authentication, multi-role credential verification, session token tracking |
| **Company / SaaS** | `Company`, `CompanyMember`, `Subscription`, `Plan`, `UsageRecord` | Tenant scoping, subscription lifecycle, account quotas |
| **Catalogue** | `Category`, `Product`, `ProductVariant`, `ProductImage`, `ProductSpecification` | Hierarchical product catalog, bilingual content, imagery |
| **Configuration** | `FurnitureConfiguration`, `ConfigurationOption`, `DimensionRule` | Parametric dimension bounds, user option state, structural joinery flags |
| **Pricing** | `MaterialRate`, `HardwareRate`, `LabourRate`, `PricingRule`, `PricingRuleVersion` | Versioned costing parameters, formula definitions, margin thresholds |
| **Customer & Sales**| `Customer`, `Enquiry`, `Quotation`, `QuotationItem`, `Order`, `OrderItem` | Lead capture, versioned quotes, binding sales orders, contract locking |
| **Materials** | `Material`, `BoardSpecification`, `HardwareItem`, `EdgeBandMaterial` | Substrate catalog, sheet sizes, edging reels, hardware items |
| **Inventory** | `Warehouse`, `StockBalance`, `StockMovement`, `MaterialReservation` | Multi-warehouse balance tracking, transactional movement ledger, job holds |
| **Production** | `ProductionJob`, `ProductionOperation`, `WorkAssignment`, `ProductionEvent` | Job routing, workshop station stages, operator time logs |
| **Manufacturing** | `BOM`, `BOMRevision`, `Part`, `PartOperation`, `EdgeBandingSpecification` | Hierarchical parts breakdown, raw vs finished dimensions, grain direction |
| **Cutting** | `CuttingPlan`, `CuttingPlanItem`, `Board`, `Offcut` | 2D nesting layouts, kerf/trim parameters, scrap records, offcut storage |
| **CNC** | `Machine`, `Controller`, `MachineSoftware`, `CNCAdapter`, `ExportFile`, `ExportHistory` | Verified machine specs, export files, simulation signoffs, bridge events |
| **Labels** | `PartLabel`, `BarcodeRecord`, `ScanEvent` | Scannable label metadata, station scan tracking |
| **Design** | `FurnitureModel3D`, `SavedDesign`, `RoomDesign`, `ARSession` | 3D mesh references, camera tokens, room images, AR calibration logs |
| **Platform** | `FileAsset`, `Notification`, `AuditLog`, `SystemSetting` | S3 asset metadata, multi-channel notifications, immutable audit entries |

### 12.2 Critical Data Storage Rules
1. **Financial Precision:** Currency, unit rates, tax amounts, and discount calculations must be stored using exact decimal data types (PostgreSQL `NUMERIC(12, 4)` / Prisma `Decimal`). Floating-point types (`FLOAT`, `DOUBLE`) are strictly forbidden in financial calculations.
2. **Dimension Normalization:** All dimensional measurements ($W, H, D, T$, kerf, trim) must be stored as integers or exact decimals with explicit millimeter (`mm`) normalization. Units must be declared on every entity interface.
3. **Stable Identifiers:** Primary keys must utilize stable, globally unique UUIDv4 or KSUID formats. Sequential integers shall only be exposed for human-facing document numbers (e.g., `ORD-2026-00123`).
4. **Historical Immutability & Versioning:** Quotations, Pricing Rule sets, BOM definitions, and CNC Export files must implement immutable versioning. Historical records reference foreign keys of specific version records to ensure that future catalog updates never retroactively modify historical financial or manufacturing contracts.
5. **Distinct State Machine Enums:**
   - `OrderStatus`: `PENDING_DEPOSIT`, `DEPOSIT_CONFIRMED`, `PENDING_SPEC_REVIEW`, `SPEC_APPROVED`, `SPEC_REJECTED`, `IN_PRODUCTION`, `PRODUCTION_COMPLETED`, `PARTIALLY_DELIVERED`, `DELIVERED`, `CLOSED`, `CANCELLED`.
   - `ProductionJobStatus`: `DRAFT`, `PENDING_BOM`, `BOM_APPROVED`, `MATERIAL_RESERVED`, `READY_FOR_PRODUCTION`, `CUTTING`, `EDGE_BANDING`, `MACHINING`, `ASSEMBLY`, `QUALITY_CHECK`, `PACKED`, `COMPLETED`, `ON_HOLD`, `CANCELLED`.
6. **Saudi PDPL Encryption at Rest:** Customer PII fields (`Customer.full_name`, `Customer.mobile`, `Customer.email`, `Customer.national_id`, `Customer.address`, `Customer.gps_coordinates`) must be encrypted at rest using AES-256 (`BR-SEC-004`).
7. **Database Transactions:** All multi-entity state transitions (Quotation to Order conversion, Job release with material reservation, Stock movement with balance increment/decrement) must execute within ACID database transactions (`prisma.$transaction`).
8. **Tenant Isolation:** In multi-tenant modes (Release 4), every tenant-owned table must include a foreign key index on `company_id`.

---

## 13. Non-Functional Requirements (NFR)

### 13.1 Security & Data Privacy
- **`NFR-SEC-001` (Input Validation):** All incoming API payloads must be validated server-side using strict schema validators (Zod) before reaching business service layers.
- **`NFR-SEC-002` (Injection & OWASP Defense):** All database interactions must execute through parameterized ORM queries (Prisma) to eliminate SQL injection vulnerabilities. Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) protections must be active on all public and authenticated endpoints.
- **`NFR-SEC-003` (Secrets Protection):** Secret keys (database credentials, JWT signing keys, payment secrets, AI tokens) must be injected strictly via environment variables. Zero credentials shall be committed to version control.
- **`NFR-SEC-004` (Air-Gapped CNC Protection):** Workshop machine controllers shall be network-isolated behind local factory firewalls. No CNC controller shall be directly reachable from the public Internet (`BR-CNC-004`).
- **`NFR-SEC-005` (Cryptographic Portal Tokens):** Customer quotation access links must utilize HMAC-SHA256 signed random 256-bit tokens with a 14-day TTL. Links must enforce rate limiting (max 10 req/min/IP) and reject tampered or expired signatures (`BR-SEC-003`).
- **`NFR-PRIV-001` (Customer PII Protection & Floor Masking):** In compliance with Saudi PDPL, customer personal data (names, Saudi mobile numbers, national IDs, delivery addresses) must be encrypted at rest using AES-256 and masked on all factory floor screens, cut lists, and thermal barcode labels (`BR-LBL-001`, `BR-SEC-004`).
- **`NFR-PRIV-002` (Saudi PDPL Compliance):** The platform must adhere to the Kingdom of Saudi Arabia's Personal Data Protection Law (Royal Decree M/19), providing user consent mechanisms, data access logs, and rights to request data rectification.

### 13.2 Performance & Scalability
- **`NFR-PERF-001` (Catalog Response Latency):** Public catalogue browsing and product detail pages must achieve 95th-percentile response times $< 500\text{ ms}$ under standard server load.
- **`NFR-PERF-002` (Pricing Engine Latency):** Parametric calculation API calls must return computed price breakdowns within $< 300\text{ ms}$.
- **`NFR-PERF-003` (Cutting Optimization Compute Time):** The panel nesting optimizer must generate an optimized cutting plan for batches up to 100 parts in $< 15\text{ seconds}$.
- **`NFR-SCAL-001` (Concurrent Users):** Baseline single-tenant architecture must comfortably handle 100 concurrent website visitors and 20 simultaneous admin/factory sessions without performance degradation. Multi-tenant target TBD during Release 4 discovery.

### 13.3 Availability & Reliability
- **`NFR-REL-001` (Operational Uptime):** The web platform shall maintain 99.5% service availability during core Saudi business hours (08:00 to 20:00 AST).
- **`NFR-REL-002` (Database Backups):** Automated daily full database snapshots and continuous Point-in-Time Recovery (PITR) with a Recovery Point Objective (RPO) $\le 1\text{ hour}$ and Recovery Time Objective (RTO) $\le 4\text{ hours}$.
- **`NFR-ERR-001` (Graceful Error Degradation):** Unhandled server errors must return sanitized error responses to clients without exposing stack traces, database schema details, or environment variables.

### 13.4 Localization & Cultural Adaptation
- **`NFR-LOC-001` (Bilingual Architecture):** The system must natively support English and Arabic across all public and back-office user interfaces.
- **`NFR-LOC-002` (Saudi Mobile Validation & OTP):** Mobile inputs must enforce regex `^(?:\+966|00966|0)?5[0-9]{8}$`, normalize to E.164 (`+9665xxxxxxxx`), and support 4-digit SMS OTP verification with a 3-minute TTL via licensed Saudi telecom gateways (`BR-LOC-003`).
- **`NFR-RTL-001` (Bidirectional Layout Support):** The frontend layout must dynamically switch between Left-to-Right (`dir="ltr"`) for English and Right-to-Left (`dir="rtl"`) for Arabic, properly mirroring margins, paddings, navigation drawers, and table columns without text clipping or styling distortion.

### 13.5 Auditability & Monitoring
- **`NFR-AUD-001` (Append-Only Audit Logging):** All financial overrides, pricing edits, stock adjustments, role changes, and CNC file approvals must write append-only records containing Actor ID, Timestamp, IP address, and JSON diffs of changed attributes.
- **`NFR-MON-001` (Telemetry & Monitoring):** System health metrics, API error rates, and slow database queries must be logged via structured JSON application logs and monitored via standard application telemetry.

### 13.6 Client Device & AR Compatibility
- **`NFR-CMP-001` (Responsive Web):** Full visual responsiveness across modern desktop (Chrome, Edge, Safari, Firefox $\ge$ last 2 versions) and mobile viewports (iOS Safari $\ge$ v15, Android Chrome $\ge$ v90).
- **`NFR-CMP-002` (AR Compatibility & Fallback):** Augmented Reality features must support Apple AR Quick Look on iOS and Google Scene Viewer on ARCore-enabled Android devices. Incompatible devices must automatically receive an interactive 3D WebGL fallback without system errors.

---

## 14. Integration Requirements

```
                       ┌───────────────────────────────────────────┐
                       │    SATCO Cloud Platform (Next.js / API)    │
                       └─────┬──────────────┬──────────────┬───────┘
                             │              │              │
         ┌───────────────────┘              │              └──────────────────┐
         ▼                                  ▼                                 ▼
┌──────────────────┐              ┌──────────────────┐              ┌──────────────────┐
│  AI Provider API │              │ S3-Compatible    │              │ Payment Gateway  │
│  (OpenAI/Gemini/ │              │ Object Storage   │              │ (Moyasar / Tap / │
│   Anthropic)     │              │ (Images/CAD/PDF) │              │  Stripe / Hyper) │
└──────────────────┘              └──────────────────┘              └──────────────────┘
                                            │
                                            ▼
                                  ┌──────────────────┐
                                  │ Thermal Barcode  │
                                  │ Label Printers   │
                                  └──────────────────┘
                                            │
                                            ▼
                           ┌─────────────────────────────────┐
                           │   Local Factory Network (LAN)   │
                           │ ┌─────────────────────────────┐ │
                           │ │ Factory PC Bridge Service   │ │
                           │ └──────────────┬──────────────┘ │
                           │                ▼                │
                           │ ┌─────────────────────────────┐ │
                           │ │ Vendor CAM Software         │ │
                           │ └──────────────┬──────────────┘ │
                           │                ▼                │
                           │ ┌─────────────────────────────┐ │
                           │ │ Homag CNC Router / Saw     │ │
                           │ └─────────────────────────────┘ │
                           └─────────────────────────────────┘
```

### 14.1 AI Provider Abstraction
- The platform must implement a vendor-neutral service interface (`AIServiceInterface`) encapsulating generative room design requests.
- Concrete adapters for OpenAI, Google Gemini, or Anthropic can be swapped via configuration without changing core business logic.
- Outgoing images must be scrubbed of metadata; user data privacy and cost budget ceilings must be governed by system settings (`DEC-009`).

### 14.2 Cloud File Storage
- Store product imagery, generated quotation PDFs, 3D glTF/USDZ models, and CNC export files in an S3-compatible object storage service.
- Public customer assets (product thumbnails) served via CDN with caching headers.
- Private business assets (signed quotations, CAM files, audit attachments) served strictly via short-lived pre-signed URLs verified against user permissions.

### 14.3 Industrial Barcode / QR Label Hardware
- Generate printable label streams (PDF / standard 203 DPI thermal printer commands) formatted for standard industrial label dimensions (e.g., $100\text{ mm} \times 50\text{ mm}$ or $80\text{ mm} \times 40\text{ mm}$).
- Compatible with Zebra, TSC, or Honeywell industrial thermal transfer printers over USB or local network IP.

### 14.4 CNC Machine Integration, Safety Protocol & 3-Tier Fallback Hierarchy
- **Discovery Baseline:** Blueprint explicitly identifies factory equipment under consideration as **Homag Industrial CNC Machinery**.
- **3-Tier Hierarchical Fallback Strategy (`BR-CNC-005`):**
  ```
  [Tier 3: Automated Factory PC Bridge] ──(Network or Daemon Outage)──►
            │
            ▼
  [Tier 2: Manual USB / Network Share CAM Import] ──(Machine/Format Incompatible)──►
            │
            ▼
  [Tier 1: Machine-Independent Workshop Traveler & Paper Cut Lists]
  ```
  1. **Tier 3 (Automated Bridge):** Local Factory PC Bridge daemon on workshop LAN polls cloud API, validates signed CAM files, and places them into the machine's watched directory automatically.
  2. **Tier 2 (Primary Operational Fallback):** If Bridge service is offline or unsupported by the machine controller, authorized staff download verified CAM files (DXF/MPR) onto a secure, encrypted factory USB drive or local SMB share for manual import.
  3. **Tier 1 (Ultimate Failsafe):** If CAM post-processor encounters unverified tooling or machine is offline, workshop floor executes panel processing using standardized machine-independent cutting lists, manual sliding table saws, edge-banding schedules, and thermal barcode labels. Factory production never halts.
- **Mandatory Pre-Flight Compatibility Checklist:** Prior to authorizing direct export or machine bridging, the following parameters must be formally collected and documented in `MACHINE_INFORMATION.md`:
  1. Exact Machine Brand & Model Number (e.g., Homag Panel Saw / CNC Nesting Router).
  2. Controller Brand, Hardware Model, and Firmware Version (e.g., Syntec, Weihong, Siemens, LNC).
  3. CAM / Machine Software Suite & Version (e.g., WoodWOP, NC-Studio, AlphaCAM, ArtCAM).
  4. Supported Import File Formats (DXF with specific layer names, MPR, G-code, XML).
  5. Machine Tooling Library (Spindle diameter, drill bank grid spacing, tool changer slots).
  6. Machine Axis Conventions, Origin Point ($X_0, Y_0, Z_0$), and Dimensional Units (Metric mm).
  7. Physical test sample file provided by machine vendor and dry-run executed on factory floor.
- **Air-Gapped Safety Guardrail:** Machine controllers must NEVER be directly assigned public IP addresses or exposed to the public Internet (`BR-CNC-004`).

### 14.5 Payment Provider Abstraction
- Modular payment service interface (`PaymentGatewayInterface`) supporting Saudi-preferred payment gateways (Moyasar, Tap Payments, HyperPay, or Stripe).
- Supports mada debit cards, Visa/Mastercard, and Apple Pay.
- Webhook endpoints must cryptographically verify gateway signatures before triggering subscription upgrades or order state transitions (`BR-SAAS-003`).

### 14.6 Notifications & Messaging
- Dispatch localized transactional notifications (Order Received, Quote Ready, Production Milestone Reached) via SMS (Saudi telecom gateway provider) and Email (SMTP / transactional provider like SendGrid/Postmark).

### 14.7 Web Analytics & Event Tracking (GA4 & Data Layer)
- Standardized client-side Google Tag Manager (GTM) data layer interface pushing e-commerce events (`view_item`, `customize_dimension`, `begin_checkout`, `purchase`).
- Server-side GA4 Measurement Protocol integration for cryptographically verified quote submission and order deposit tracking with zero client-side ad-blocker drop-off.
- Fully compliant with Saudi PDPL regulations (all IP addresses anonymized; zero customer PII transmitted in analytics payloads).

### 14.8 Dynamic Catalog Product Feeds
- Automated XML (Google RSS 2.0 / Atom) and JSON product feeds for Google Merchant Center, Meta (Facebook/Instagram) Catalog, and TikTok Ads.
- Dynamically calculates standard baseline "Starting From" price in SAR using active `PricingRuleVersion`.
- Edge-cached on CDN with automated purge upon product catalog changes.

### 14.9 Automated WhatsApp & SMS Recovery Gateway
- Official WhatsApp Business API and Saudi SMS gateway integration (Unifonic / Taqnyat) for:
  - 1-hour abandoned 3D configurator recovery with persistent 1-click restore links.
  - Milestone 2 pre-dispatch due payment notifications with secure direct mada / Apple Pay checkout URLs.
  - Immediate opt-out mechanism honoring customer communications preferences.

---

## 15. UI / UX Requirements

### 15.1 Public Website & Digital Showroom
- **Purpose:** Brand engagement, category browsing, custom furniture discovery, and enquiry initiation.
- **Key User Actions:** Switch language (EN/AR), search catalog, filter by collection, view 360-degree imagery, launch parametric configurator, submit quote request.
- **UX Standards:** Mobile-first responsive layout, accessible typography, high-contrast imagery, smooth transitions between LTR and RTL.

### 15.2 Product Listing and Product Detail Screens
- **Purpose:** Present individual furniture models with dimensional capabilities and material options.
- **Key User Actions:** View specifications, inspect standard dimension ranges, view high-res finish swatches, click "Customize".

### 15.3 Custom Furniture Configurator Screen
- **Purpose:** Interactive customer-facing and sales-facing customization workspace.
- **Key User Actions:** Adjust dimension inputs/sliders (W, H, D in mm), select board material swatches, choose hardware accessories, view instant calculated price estimate or "Request a Quote" badge, submit enquiry.

### 15.4 Customer Quotation Request & Confirmation Screen
- **Purpose:** Capture customer delivery information and issue instant reference tokens.
- **Key User Actions:** Fill customer name, Saudi phone number, delivery city, room delivery notes; submit form; view confirmation card and download reference PDF.

### 15.5 Central Admin Dashboard
- **Purpose:** High-level operational command center for business owners and managers.
- **Key User Actions:** View operational revenue charts, pending quotation counters, active factory stage bottlenecks, low-stock inventory warnings, and recent audit activity feed.

### 15.6 Sales Management Screens (Enquiries & Quotes)
- **Purpose:** Manage commercial sales pipeline and quote issuance.
- **Key User Actions:** Review enquiry queue, inspect configuration snapshots, calculate line-item pricing, apply authorized commercial discounts, issue formal quotations, convert approved quotes to orders.

### 15.7 Production Management Screens (Job Dispatch & Stages)
- **Purpose:** Factory floor scheduling, job creation, and stage monitoring.
- **Key User Actions:** Review approved orders, verify engineering specifications, generate production jobs, assign jobs to factory workstations, monitor Gantt/Kanban progress, log quality holds.

### 15.8 Inventory Management Screens (Materials & Stock Ledger)
- **Purpose:** Track board sheets, edge-banding reels, and hardware stocks across warehouses.
- **Key User Actions:** Search material balances, log incoming shipments (`RECEIPT`), issue sheets to active jobs (`ISSUE`), log scrap returns (`RETURN`), execute physical count adjustments (`ADJUSTMENT`).

### 15.9 Manufacturing & Parts Screens (BOM, Nesting & Labels)
- **Purpose:** Prepare engineering data, optimize cutting plans, and print barcodes.
- **Key User Actions:** Generate and review versioned BOM parts, trigger 2D sheet nesting optimizer, inspect visual cut diagrams and scrap percentage, approve cutting plan, trigger thermal barcode label batch printing.

### 15.10 SaaS Super-Admin Screens (Multi-Tenancy)
- **Purpose:** Global platform governance across subscriber furniture companies.
- **Key User Actions:** Provision new tenant companies, assign subscription tiers, monitor platform API health, configure billing plans, inspect global audit telemetry.

---

## 16. Reporting and Audit Requirements

| Report / Log Name | Primary Audience | Core Data Points Captured | Generation Frequency | Export Formats |
| :--- | :--- | :--- | :--- | :--- |
| **Product & Catalogue Performance Report** | Sales & Admin | Product views, configurator engagement rates, quote request conversion rate by model | On-Demand / Monthly | CSV, Excel, PDF |
| **Quotation & Sales Conversion Report** | Sales & Leadership | Issued quotes, win/loss ratio, average quote turnaround time, discount override frequency | Daily / Weekly / Monthly | Excel, PDF |
| **Order Fulfilment & Lead Time Report** | Production & Sales | Order approval date, spec signoff lead time, factory stage durations, on-time delivery rate | Weekly / Monthly | Excel, PDF |
| **Inventory Valuation & Balance Report** | Finance & Storekeeper | Raw board stock, edge-band reels, hardware count, unit costs, total inventory valuation | Monthly / Audit periods | Excel, PDF |
| **Stock Movement Audit Log** | Storekeeper & Auditor | Movement Type (`RECEIPT`, `ISSUE`, `RETURN`, `ADJUSTMENT`), Quantity, Job Ref, User ID, Timestamp | Continuous / Real-time | CSV, Audit Search |
| **Material Consumption & Wastage Report** | Production & Finance | Board area consumed vs. placed part area, actual sheet scrap percentage, offcut recovery | Per Cutting Batch / Monthly | Excel, PDF |
| **Factory Station Bottleneck Report** | Production Manager | Active jobs per station (Cutting, Banding, Machining, Assembly, QC), dwell time per stage | Real-time / Daily | Screen Dashboard, PDF |
| **CNC Export & Machine File Audit** | CAM Lead & Auditor | Export file name, machine adapter ID, part count, human signoff user ID, simulation pass flag | Continuous / Per Job | Audit Search, CSV |
| **System Security & Mutation Audit Trail** | Super Admin & Security | User auth attempts, role assignments, pricing rule edits, manual discount overrides | Continuous / Immutable | Audit Search, JSON |


---

## 17. Acceptance Criteria and Definition of Done

A module or release is NOT complete merely because frontend screens or user interface mockups exist. Completion evidence must be verifiable through automated tests, user acceptance testing (UAT), and signed operational signoffs.

### 17.1 Module Completion Evidence (Release Gates)

| Module | Mandatory Completion Evidence & Testable Artifacts | Verification Method |
| :--- | :--- | :--- |
| **Website & Catalogue** | Customer can browse published products on desktop and mobile in both English (LTR) and Arabic (RTL); unpublished or draft products are verified as inaccessible via public routes; enquiry submissions persist correctly in database. | Automated E2E tests + Bilingual manual test |
| **Parametric Configurator** | Validated dimensional configuration produces exact, reproducible mathematical calculations; invalid dimensions outside product constraints are strictly blocked with user guidance; no client-side pricing tampering is possible. | Unit tests + Server API integration tests |
| **Pricing Engine** | Pricing calculation deterministically reproduces wholesale and retail margins; missing rates or formula parameters reliably return "Request a Quote" (`BR-PRICE-003`); rate card updates do not alter issued quotes (`BR-PRICE-002`). | Unit test suite with edge-case parameter matrices |
| **Quotation Management** | Authorized sales staff can review, revise, apply role-restricted discounts, and formally approve quotes; generated bilingual PDF quotes contain complete itemized breakdowns, legal clauses, and locked pricing rule references. | UAT with Sales team + PDF layout verification |
| **Admin & Security RBAC** | Server-side authorization blocks unauthorized API calls with `403 Forbidden` (`BR-SEC-001`); hiding UI elements alone is rejected as security; user role changes create immediate audit log entries. | Automated security regression tests |
| **Inventory Ledger** | Physical stock receipts, issues to jobs, scrap returns, and manual adjustments create immutable `StockMovement` transactions (`BR-INV-001`); current stock balances exactly equal the sum of movement transactions. | Integration tests + Warehouse physical audit reconciliation |
| **Production Management** | Approved sales orders can be converted into unique, traceable production jobs (`BR-MFG-002`); jobs can be scheduled, assigned to factory stations, and advanced through standard stages with user timestamps and notes. | Factory workflow UAT with Production Manager |
| **Furniture BOM Engine** | Approved test cabinet models generate mathematically accurate parts lists, component counts, raw substrate sizes, finished sizes, and edge-banding assignments matching engineering mockups (`BR-MFG-001`). | Engineering signoff against physical sample builds |
| **Cutting & Optimization** | Panel cutting optimizer accounts for board margins, saw kerf ($K_{saw}$), and grain direction locks; no part exceeds usable sheet area; unplaced parts are flagged; waste percentage is reported; plans require human signoff. | Algorithmic test suite + Production Manager review |
| **Barcode / QR Labels** | High-density industrial labels print cleanly on thermal printer; labels encode secure internal UUIDs without customer PII (`BR-LBL-001`); 2D barcode scanner decodes part data and logs stage progression in $< 100\text{ ms}$. | Factory physical scanner testing |
| **CNC Export Framework** | Export files (DXF, MPR, G-code) pass format-specific schema validation; files open cleanly in vendor machine CAM software without geometry errors; export files require human review and signoff before floor release (`BR-CNC-002`). | Machine software simulation + CAM Specialist review |
| **Factory Workflow & Bridge** | Workshop operators can import approved files, execute test dry-runs on factory equipment, and record production outcomes; machine controllers remain network-isolated from the public Internet (`BR-CNC-004`). | Factory floor test cut + Network security audit |
| **3D Configurator** | Parametric models render smoothly ($\ge 30\text{ FPS}$) within approved dimensional limits; mesh scaling maintains door/handle proportions; visual view is explicitly watermarked as an artistic approximation (`BR-MFG-005`). | Cross-device WebGL test matrix |
| **AI Room Design** | AI suggestions generate aesthetic concepts; system displays prominent advisory disclaimer (`BR-AI-001`); quote conversion strictly mandates customer confirmation of physical room measurements (`BR-AI-002`). | UI/UX validation + Wizard workflow test |
| **AR Furniture Preview** | Calibrated 1:1 scale verified on supported iOS (Quick Look) and Android (Scene Viewer) devices; unsupported devices receive seamless 3D fallback without errors (`BR-AR-001`). | Physical device calibration testing |
| **Multi-Tenant SaaS** | Automated cross-tenant tests prove that Company A cannot read or write Company B's data under any condition (`BR-SAAS-001`, `BR-SAAS-002`); tenant quotas are strictly enforced at API boundaries. | CI/CD automated cross-tenant exploit tests |
| **Subscription & Billing** | Subscription tier transitions (Starter, Pro, Enterprise) and usage feature limits pass tests; payment gateway webhooks verify cryptographic signatures and accurately update account state (`BR-SAAS-003`). | Mock webhook integration test suite |

---

## 18. Dependencies, Risks and Constraints

### 18.1 Project Dependencies
1. **SATCO Brand & Content Assets:** Provision of high-resolution vector logos, approved color palettes, and certified Arabic/English marketing copy.
2. **Product Engineering Rules & Rate Cards:** Formal documentation of allowable dimension ranges, board wholesale costs, hardware unit prices, and edge-banding rates.
3. **Furniture Joinery Formulas:** Approved structural cabinet formulas (dowel/screw/minifix setbacks, backboard rebates, drawer slide deductions) provided by factory engineering.
4. **CNC Machine Access & Documentation:** Access to the physical factory equipment (specifically the Homag CNC panel saw/router) for controller, software, tooling, and post-processor verification.
5. **3D Asset Pipeline:** Provision of optimized, textured low-poly 3D models matching SATCO's physical furniture catalog.
6. **External Service Providers:** Commercial accounts for SMS delivery (Saudi telecom gateway), Payment Gateway (Moyasar/Tap), and AI Generative Vision APIs.

### 18.2 Risk Management Matrix

| Risk ID | Risk Description | Blueprint Impact | Likelihood | Mitigation Strategy | Owner |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`RSK-001`** | **Missing or Delayed Material Rate Cards:** Without verified rates, pricing engine cannot compute final prices. | High | High | Implement mandatory "Request a Quote" fallback (`BR-PRICE-003`); allow manual sales quoting while rates are finalized. | TBD (Commercial Lead) |
| **`RSK-002`** | **Inaccurate Cabinet Construction Formulas:** Unverified joinery deductions cause physical parts to misalign during factory assembly. | Critical | Medium | Restrict initial BOM generation to verified standard test cabinets; require physical dry-assembly signoff before volume release. | TBD (Production Manager) |
| **`RSK-003`** | **CNC Hardware Incompatibility:** Machine controller does not accept generated DXF layers or proprietary CAM formats. | Critical | High | Implement 3-stage CNC roadmap; decouple production data (BOM/cut lists) from machine files; retain manual import as primary fallback. | TBD (CAM / Factory Lead) |
| **`RSK-004`** | **Machine Controller Network Compromise:** Direct internet exposure of factory machinery poses severe operational and safety hazards. | Critical | Low | Strictly enforce air-gapped machine network architecture (`BR-CNC-004`); connect only via controlled, authenticated local Factory PC Bridge. | TBD (Security Lead) |
| **`RSK-005`** | **Customer Misinterpreting AI Images as Final Build:** Customer expects complex non-standard features generated in AI rendering. | Medium | High | Display prominent watermarks on AI images (`BR-AI-001`); mandate manual confirmation of physical dimensions before quotation (`BR-AI-002`). | TBD (Product Manager) |
| **`RSK-006`** | **3D / AR Mobile Performance Degradation:** High polygon assets cause mobile browser crashes or low frame rates. | Medium | Medium | Enforce strict polygon budgets ($\le 50\text{k}$ triangles), texture atlas compression (KTX2/Basis), and automated 3D fallback for low-tier hardware. | TBD (Frontend Lead) |
| **`RSK-007`** | **Cross-Tenant Data Leakage in SaaS Phase:** Software bug allows Tenant A to view Tenant B's confidential pricing or customer data. | Critical | Low | Enforce server-side Prisma middleware tenant scoping (`BR-SAAS-001`); implement automated multi-tenant penetration tests in CI/CD pipeline. | TBD (Lead Architect) |
| **`RSK-008`** | **Solo Developer Capacity & Schedule Variance:** Planning baseline of 36–38 weeks may slip due to hardware discovery and third-party dependencies. | High | Medium | Follow modular release gates strictly; stabilize Release 1 core business workflows before embarking on advanced 3D/AI/CNC modules. | TBD (Project Sponsor) |

---

## 19. Open Questions and Pending Decisions

The following architectural, commercial, and operational decisions are currently unresolved in the project blueprint and must be formally answered by designated stakeholders prior to initiating dependent modules.

| Decision ID | Decision Title & Question | Rationale & Impact | Needed Before Module / Release | Status | Responsible Person |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`DEC-001`** | **SATCO Brand Guidelines & Asset Pack:** What are the official brand guidelines, primary/secondary color hex codes, vector logos, and localized typography for English and Arabic? | Required to finalize Tailwind design tokens and layout styling. | Module 1 / Release 1 | **Pending** | TBD (Marketing / Brand Lead) |
| **`DEC-002`** | **Official Arabic Translation & Tone of Voice:** Who is responsible for reviewing and approving localized Arabic copywriting, technical furniture terminology, and transactional messaging? | Required to prevent layout breakages and cultural misalignments in Saudi market. | Module 1 & 6 / Release 1 | **Pending** | TBD (Operations / Content Lead) |
| **`DEC-003`** | **Core Furniture Product Catalog & Dimensional Limits:** What are the exact initial product models to launch, and what are their approved engineering bounds ($W, H, D$ min/max)? | Required to configure database seed scripts and configurator constraint rules. | Module 2 & 3 / Release 1 | **Pending** | TBD (Production / Design Lead) |
| **`DEC-004`** | **Material, Hardware & Edge-Banding Rate Cards:** What are the baseline costs per square meter of board, per linear meter of edging, and unit costs for hinges, slides, and handles? | Required to calibrate the Parametric Pricing Engine. | Module 4 & 5 / Release 1 | **Pending** | TBD (Procurement / Finance Lead) |
| **`DEC-005`** | **Certified Cabinet Construction & Joinery Formulas:** What exact formulas govern carcass joinery (dowel spacing, screw offsets, rebate depths, drawer runner allowances)? | Required to program the automated Furniture BOM and Parts Generator. | Module 13 / Release 2 | **Pending** | TBD (Factory Engineering Lead) |
| **`DEC-006`** | **Standard Sheet Stock Dimensions & Machine Kerf:** What are the exact standard sheet dimensions purchased (e.g., $2440 \times 1220$ vs $2800 \times 2070$), blade kerf, and trim margin? | Required to configure the Panel Cutting Optimizer. | Module 14 & 15 / Release 2 | **Pending** | TBD (Production Manager) |
| **`DEC-007`** | **Homag CNC Machine Hardware & Controller Audit:** What is the exact machine model, controller type (Power Control/Syntec), CAM software (WoodWOP/NC-Studio), and supported file formats? | Required to build and validate the CNC export adapter. | Module 18 / Release 2 & 4 | **Pending** | TBD (Factory Technical Specialist) |
| **`DEC-008`** | **3D Modeling Pipeline & Poly-Count Standards:** Who will author and optimize the 3D glTF/GLB models, and what are the asset polygon/texture budgets? | Required to build the WebGL 3D Configurator without performance regressions. | Module 19 / Release 3 | **Pending** | TBD (3D / UX Specialist) |
| **`DEC-009`** | **AI Vision Provider Selection & Monthly API Budget:** Which generative AI provider (OpenAI, Google Gemini, Anthropic) will be utilized, and what is the monthly operational cost ceiling? | Required to implement the AI provider abstraction and rate limiter. | Module 20 / Release 3 | **Pending** | TBD (Executive Sponsor) |
| **`DEC-010`** | **Target Mobile Device Support Baseline for AR:** What are the minimum iOS (ARKit) and Android (ARCore) device specifications formally supported for 1:1 AR preview? | Required to define QA test matrices and calibration tolerances. | Module 21 / Release 3 | **Pending** | TBD (QA / Mobile Lead) |
| **`DEC-011`** | **Payment Gateway Merchant Provider in Saudi Arabia:** Which payment gateway (Moyasar, Tap Payments, HyperPay) will be contracted for customer deposits and SaaS billing? | Required to implement payment SDK integration and webhook reconciliation. | Module 23 / Release 4 | **Pending** | TBD (Finance / Commercial Lead) |
| **`DEC-012`** | **SaaS Subscription Pricing & Tier Entitlements:** What are the monthly subscription fees, user limits, and job quotas for Starter, Professional, and Enterprise SaaS plans? | Required to configure tenant subscription limits and paywall middleware. | Module 22 & 23 / Release 4 | **Pending** | TBD (Executive Leadership) |

---

## 20. Roadmap and Milestones

The platform roadmap adopts a **36 to 38-week planning baseline** structured around an incremental modular monolith development strategy. 

> **Important Planning Disclaimer:** *This schedule represents an engineering planning baseline assuming full-time dedicated development. Actual milestone delivery dates are subject to team sizing, third-party vendor responsiveness, and physical factory machine availability (specifically the Homag CNC discovery and physical cutting trials).*

```
Week 01-04: Phase 1 — Project Foundation & Bilingual Website Shell
Week 05-08: Phase 2 — Configurator, Material Selector & Pricing Engine
Week 09-12: Phase 3 — Admin Portal, RBAC, Inventory Ledger & Production Jobs
             [>>> RELEASE 1 GATE: Core Furniture Business Platform <<<]
Week 13-16: Phase 4 — WebGL 3D Furniture Configurator
Week 17-20: Phase 5 — AI Room Design & Customer Measurement Confirmation Flow
Week 21-24: Phase 6 — WebXR / Native AR Preview & Graceful 3D Fallback
             [>>> RELEASE 3 GATE: 3D, AI and AR Experiences <<<]
Week 25   : Phase 7A — CNC On-Site Discovery & Machine Compatibility Audit
Week 26   : Phase 7B — Furniture BOM & Parametric Parts Generator
Week 27   : Phase 7C — Cutting List, Nesting Optimizer, Barcodes & Export Framework
Week 28   : Phase 7D — Production File Approval & Manual Machine Import Workflow
             [>>> RELEASE 2 GATE: Manufacturing Data & CNC Preparation <<<]
Week 29-32: Phase 8 — Multi-Tenant SaaS Architecture, Tenant Scoping & Billing
Week 33-36: Phase 9 — Controlled Factory Bridge, End-to-End Hardening & Launch Candidate
             [>>> RELEASE 4 GATE: Machine Bridge & Multi-Tenant SaaS <<<]
Week 37-38: Phase 10 — Buffer & Contingency (Vendor Delays, Factory Pilot, Training)
```

### 20.1 Detailed Phase Breakdown

| Phase | Duration | Core Work Streams | Major Deliverables | Exit Verification Gate |
| :--- | :--- | :--- | :--- | :--- |
| **Phase 1: Foundation & Website** | Weeks 1–4 | Repository setup, Next.js, Prisma, PostgreSQL, Bilingual responsive shell (LTR/RTL), Category and Product browsing. | Public Website & Catalogue Foundation | Responsive bilingual catalog accessible; categories filterable. |
| **Phase 2: Configurator & Pricing** | Weeks 5–8 | Parametric dimension inputs, material/hardware swatches, Pricing Engine with versioned rules, Enquiry capture form. | Working Furniture Quoting Engine | Deterministic price calculations; "Request a Quote" fallback operational. |
| **Phase 3: Admin & Factory Core** | Weeks 9–12 | Admin portal, RBAC permissions, Quotation management, Order conversion, Production jobs, Transactional stock movements. | Core Business Platform (Release 1) | Quotation $\to$ Order $\to$ Job workflow validated; inventory ledger active. |
| **Phase 4: 3D Configurator** | Weeks 13–16| Three.js / React Three Fiber integration, glTF model pipeline, parametric mesh scaling within bounds, material swaps. | WebGL 3D Furniture Viewer | $\ge 30\text{ FPS}$ 3D preview within locked dimensional bounds. |
| **Phase 5: AI Room Design** | Weeks 17–20| Room photo upload, AI vision integration, catalog item matching, mandatory room dimension confirmation wizard. | AI Conceptual Room Visualizer | Advisory watermarks active; measurement confirmation gate enforced. |
| **Phase 6: AR Preview** | Weeks 21–24| iOS Quick Look (USDZ), Android Scene Viewer (GLB), 1:1 scale calibration, automatic fallback for legacy devices. | Device-Native AR Experience (Release 3) | Verified 1:1 scale on supported devices; zero crashes on fallback. |
| **Phase 7A: CNC Discovery** | Week 25 | On-site audit of Homag machine, controller firmware, CAM software, tooling table, and test cut protocols. | Machine Compatibility Report (`MACHINE_INFORMATION.md`) | Vendor documentation and sample CAM files signed off. |
| **Phase 7B: BOM & Parts Engine**| Week 26 | Parametric joinery formulas, finished vs. raw part sizing, edge-banding deduction, wood grain tagging. | Machine-Independent BOM Engine | Test cabinet parts match engineering drawings 100%. |
| **Phase 7C: Cutting & Optimization**| Week 27 | 2D nesting algorithm, saw kerf and trim margins, scrap estimation, thermal barcode label generator. | Approved Cutting Lists & Barcode Labels | Nesting verifies kerf/trim; barcode decodes in $< 100\text{ ms}$. |
| **Phase 7D: CNC Export & Approval**| Week 28 | Verified CAM export adapters (DXF/MPR), human approval workflow, manual USB machine import procedure. | Manufacturing Release (Release 2) | Export file passes machine simulation and physical test cut. |
| **Phase 8: Multi-Tenant SaaS** | Weeks 29–32| Tenant database architecture, Prisma server-side tenant scoping, subscription tiers, payment gateway integration. | Multi-Tenant Platform Core | Automated test suite proves 100% tenant data isolation. |
| **Phase 9: Integration & Bridge**| Weeks 33–36| Local Factory PC Bridge daemon, bi-directional job status sync, penetration testing, performance tuning, UAT. | Commercial Launch Candidate (Release 4) | Air-gapped factory bridge operational; UAT signoff complete. |
| **Phase 10: Contingency Buffer**| Weeks 37–38| Buffer for machine vendor delays, mobile AR compatibility fixes, operator shop-floor training, final rollout. | Final Production Stabilization | All release acceptance criteria verified. |

---

## 21. Requirement Traceability Matrix

| PRD Requirement ID | Blueprint Source | Requirements Validation ID | Target Module | Release Target | Acceptance Criteria Reference | Status / Open Dependency |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| `FR-WEB-001` | Section 4.1 | Not assigned (REQUIREMENTS_VALIDATION.md missing) | Customer Website | R1 | Section 8 (`FR-WEB-001`), Section 17 | Baseline Approved |
| `FR-WEB-002` | Section 4.1 | Not assigned | Product Catalogue | R1 | Section 8 (`FR-WEB-002`), Section 17 | Baseline Approved |
| `FR-WEB-003` | Section 4.1 | Not assigned | Product Detail | R1 | Section 8 (`FR-WEB-003`), Section 17 | Baseline Approved |
| `FR-CAT-001` | Section 4.1 | Not assigned | Category & Products | R1 | Section 8 (`FR-CAT-001`), Section 17 | Baseline Approved |
| `FR-CFG-001` | Section 4.2 | Not assigned | Custom Configurator | R1 | Section 8 (`FR-CFG-001`), Section 17 | Baseline Approved |
| `FR-MAT-001` | Section 4.2 | Not assigned | Material Selection | R1 | Section 8 (`FR-MAT-001`), Section 17 | Baseline Approved |
| `FR-MAT-002` | Section 4.5 | Not assigned | Material Catalogue | R1 | Section 8 (`FR-MAT-002`), Section 17 | Baseline Approved (`materials.write`) |
| `FR-RTE-001` | Section 4.2 | Not assigned | Rate Card Management| R1 | Section 8 (`FR-RTE-001`), Section 17 | Requires `DEC-004` (`rates.write` only) |
| `FR-PRC-001` | Section 4.2 | Not assigned | Pricing Engine | R1 | Section 8 (`FR-PRC-001`), Section 17 | Requires `DEC-004` (Rate cards) |
| `FR-ENQ-001` | Section 4.1 | Not assigned | Enquiry Management | R1 | Section 8 (`FR-ENQ-001`), Section 17 | Baseline Approved |
| `FR-QTE-001` | Section 4.3 | Not assigned | Quotation Management| R1 | Section 8 (`FR-QTE-001`), Section 17 | Baseline Approved |
| `FR-ADM-001` | Section 4.3 | Not assigned | Admin Dashboard | R1 | Section 8 (`FR-ADM-001`), Section 17 | Baseline Approved |
| `FR-AUTH-001`| Section 4.3 | Not assigned | Authentication | R1 | Section 8 (`FR-AUTH-001`), Section 17 | Baseline Approved |
| `FR-AUTH-002`| Section 2.3 | Not assigned | RBAC Permissions | R1 | Section 8 (`FR-AUTH-002`), Section 17 | Baseline Approved |
| `FR-ORD-001` | Section 4.3 | Not assigned | Order Management | R1 | Section 8 (`FR-ORD-001`), Section 17 | Baseline Approved |
| `FR-PRD-001` | Section 4.4 | Not assigned | Production Management| R1| Section 8 (`FR-PRD-001`), Section 17 | Baseline Approved |
| `FR-INV-001` | Section 4.5 | Not assigned | Inventory Tracking | R1 | Section 8 (`FR-INV-001`), Section 17 | Baseline Approved |
| `FR-BOM-001` | Section 4.6 | Not assigned | Furniture BOM | R2 | Section 8 (`FR-BOM-001`), Section 17 | Requires `DEC-005` (Joinery formulas) |
| `FR-BOM-002` | Section 4.6 | Not assigned | Parts Generator | R2 | Section 8 (`FR-BOM-002`), Section 17 | Requires `DEC-005` |
| `FR-CUT-001` | Section 4.7 | Not assigned | Cutting List | R2 | Section 8 (`FR-CUT-001`), Section 17 | Requires `DEC-006` (Board sizes) |
| `FR-OPT-001` | Section 4.7 | Not assigned | Cutting Optimization| R2 | Section 8 (`FR-OPT-001`), Section 17 | Requires `DEC-006` |
| `FR-EDG-001` | Section 4.8 | Not assigned | Edge-Banding Engine | R2 | Section 8 (`FR-EDG-001`), Section 17 | Baseline Approved |
| `FR-LBL-001` | Section 4.8 | Not assigned | Barcode / QR Labels | R2 | Section 8 (`FR-LBL-001`), Section 17 | Baseline Approved |
| `FR-CNC-001` | Section 4.9 | Not assigned | Stage 1 Production Data| R2 | Section 8 (`FR-CNC-001`), Section 17 | Baseline Approved |
| `FR-CNC-002` | Section 4.9 | Not assigned | Stage 2 CNC File Export| R2 | Section 8 (`FR-CNC-002`), Section 17 | Requires `DEC-007` (CNC verification) |
| `FR-3D-001`  | Section 4.10| Not assigned | 3D Configurator | R3 | Section 8 (`FR-3D-001`), Section 17 | Requires `DEC-008` (3D Assets) |
| `FR-AI-001`  | Section 4.11| Not assigned | AI Room Design | R3 | Section 8 (`FR-AI-001`), Section 17 | Requires `DEC-009` (AI Provider) |
| `FR-AR-001`  | Section 4.12| Not assigned | AR Furniture Preview| R3 | Section 8 (`FR-AR-001`), Section 17 | Requires `DEC-010` (Mobile Hardware) |
| `FR-TEN-001` | Section 4.13| Not assigned | Multi-Tenant SaaS | R4 | Section 8 (`FR-TEN-001`), Section 17 | Requires `DEC-012` (SaaS plans) |
| `FR-SUB-001` | Section 4.13| Not assigned | Subscription & Billing| R4 | Section 8 (`FR-SUB-001`), Section 17 | Requires `DEC-011` (Payment gateway) |
| `FR-CNC-003` | Section 4.9 | Not assigned | Stage 3 Factory Bridge | R4 | Section 8 (`FR-CNC-003`), Section 17 | Requires `DEC-007` & R2 validation |
| `FR-RPT-001` | Section 4.3 | Not assigned | Operational Reports | R1–R4 | Section 8 (`FR-RPT-001`), Section 17 | Baseline Approved |
| `FR-RPT-002` | Section 4.3 | Not assigned | Audit Trail Ledger | R1–R4 | Section 8 (`FR-RPT-002`), Section 17 | Baseline Approved |

---

## 22. Release Approval Checklist

Before any release is promoted to production, every item on the relevant release gate checklist must be formally verified and signed off by authorized stakeholders.

### 22.1 Release 1 Gate Checklist — Core Furniture Business Platform
- [ ] **Scope Verification:** Website, product catalogue, configurator, pricing engine, enquiry workflow, admin RBAC, production job tracking, inventory ledger, and core reports fully implemented.
- [ ] **Bilingual & Layout Audit:** English LTR and Arabic RTL layouts verified across desktop and mobile without text clipping or styling distortion.
- [ ] **Pricing Engine Precision:** Pricing engine unit tests confirm exact decimal arithmetic; missing rates reliably return "Request a Quote" (`BR-PRICE-003`).
- [ ] **Inventory Movement Audit:** Automated tests verify that inventory balances cannot be overwritten directly; all changes log `StockMovement` transactions (`BR-INV-001`).
- [ ] **Security & Authorization:** Server-side RBAC verified; unauthorized API requests return `403 Forbidden` (`BR-SEC-001`); no credentials committed to git.
- [ ] **User Acceptance Testing (UAT):** Sales staff successfully convert customer enquiry to approved quote and sales order.
- [ ] **Data Backup & Recovery:** Database automated snapshot and restore verified in staging environment.
- [ ] **Formal Signoff:** Release 1 Approval signed by SATCO Project Sponsor and Lead Architect.

### 22.2 Release 2 Gate Checklist — Manufacturing Data and CNC Preparation
- [ ] **Scope Verification:** BOM engine, parts generator, cutting list, 2D nesting optimizer, edge-banding schedule, barcode labels, and manual export framework operational.
- [ ] **Cabinet Joinery Verification:** Physical sample cabinet built from generated BOM parts; joinery fits with zero dimensional rework (`BR-MFG-001`).
- [ ] **Cutting Optimizer Verification:** Nesting algorithm respects blade kerf ($K_{saw}$), edge trim ($T_{trim}$), and grain locks; no parts exceed usable sheet size (`BR-CUT-001`).
- [ ] **Barcode Scanning Audit:** Thermal labels printed and verified with factory handheld 2D barcode scanner ($< 100\text{ ms}$ decode latency).
- [ ] **CNC Software Simulation:** Generated export files (DXF/MPR) successfully loaded into vendor CAM simulator without geometry errors (`BR-CNC-002`).
- [ ] **Human Signoff Workflow:** System enforces mandatory CAM specialist approval before export files can be transferred to machines.
- [ ] **Formal Signoff:** Release 2 Approval signed by Production Manager and CAM Lead.

### 22.3 Release 3 Gate Checklist — 3D, AI and AR Experiences
- [ ] **Scope Verification:** WebGL 3D configurator, AI room concept generator, customer measurement confirmation wizard, and device-native AR preview operational.
- [ ] **3D Performance Audit:** $\ge 30\text{ FPS}$ maintained on standard mobile devices; mesh scaling respects hard dimensional constraints (`BR-MFG-003`).
- [ ] **AI Advisory Guardrail:** All AI room concepts clearly display advisory watermarks (`BR-AI-001`); quotes strictly mandate customer measurement confirmation (`BR-AI-002`).
- [ ] **AR Calibration Audit:** Physical 1:1 scale verified within $\pm 3\%$ tolerance on supported iOS and Android devices (`BR-AR-001`).
- [ ] **Fallback Verification:** Non-AR devices and legacy browsers receive smooth 3D WebGL fallback without system crashes.
- [ ] **Formal Signoff:** Release 3 Approval signed by Product Manager and UI/UX Lead.

### 22.4 Release 4 Gate Checklist — Machine Bridge and Multi-Tenant SaaS
- [ ] **Scope Verification:** Local Factory PC Bridge service, verified machine adapter, multi-tenant database isolation, subscription billing, and SaaS super-admin dashboard operational.
- [ ] **Air-Gapped CNC Protection:** Network penetration tests verify machine controllers are completely inaccessible from the public Internet (`BR-CNC-004`).
- [ ] **Tenant Isolation Proof:** Automated CI/CD test suite proves 100% server-side tenant data isolation with zero cross-tenant data leakage (`BR-SAAS-001`, `BR-SAAS-002`).
- [ ] **Subscription & Payment Audit:** Payment gateway webhooks verify cryptographic signatures; feature limits immediately restrict over-quota actions (`BR-SAAS-003`).
- [ ] **Bridge Communication Security:** Factory PC Bridge communicates over secure mTLS / authenticated HTTPS with offline queueing support.
- [ ] **Formal Signoff:** Release 4 Approval signed by SATCO Executive Sponsor and Security Lead.

---

## 23. Glossary

| Term / Abbreviation | Definition & Technical Context |
| :--- | :--- |
| **BOM (Bill of Materials)** | Comprehensive, hierarchical engineering list of all raw panels, components, edge-banding tapes, and hardware required to manufacture a specific piece of furniture. |
| **CNC (Computer Numerical Control)** | Automated manufacturing machine tools (e.g., nesting routers, panel saws, boring machines) operated by programmed computer commands. |
| **CAM (Computer-Aided Manufacturing)** | Software that translates CAD part geometries into toolpaths, tooling operations, and CNC machine instructions. |
| **Kerf ($K_{saw}$)** | The physical width of material removed by the saw blade or CNC router bit during a cut (typically $3.2\text{ mm}$ to $4.5\text{ mm}$). Must be accounted for in cutting optimization. |
| **Trim ($T_{trim}$)** | Perimeter margin sliced off the four edges of a raw board sheet to eliminate factory handling damage and establish clean, square reference edges (typically $10\text{ mm}$ to $15\text{ mm}$). |
| **Offcut / Remnant** | Usable leftover portion of a sheet of raw material generated during cutting, cataloged in inventory for reuse in smaller parts. |
| **Edge-Banding** | Thin plastic (PVC/ABS) or wood veneer tape bonded to the exposed raw edges of cut melamine or MDF panels for aesthetics and moisture protection. |
| **Grain Direction** | The natural or printed visual orientation of wood grain fibers on decorative board surfaces. Grained panels cannot be arbitrarily rotated during sheet nesting. |
| **G-Code** | Standard programming language used to instruct CNC machinery on coordinates, feed rates, spindle speeds, and tool selections. |
| **Post-Processor** | Software translator that converts generic CAM toolpaths into machine-specific G-code or proprietary formats matching a specific CNC controller. |
| **RTL / LTR** | Right-to-Left (Arabic script) and Left-to-Right (English script) layout rendering directions in web applications. |
| **RBAC** | Role-Based Access Control; an authorization mechanism restricting system actions based on assigned user roles and granular permissions. |
| **SKU** | Stock Keeping Unit; distinct identifier for raw materials, hardware items, or catalog furniture models. |
| **SaaS** | Software-as-a-Service; multi-tenant cloud hosting model allowing independent companies to use the platform on a subscription basis. |
| **Tenant** | An independent customer company operating within a multi-tenant software system with strictly isolated data, users, and settings. |
| **WebXR** | Web standard providing access to virtual reality (VR) and augmented reality (AR) devices directly through web browsers. |
| **USDZ / GLB** | Optimized 3D file formats; USDZ is standard for Apple AR Quick Look (iOS), while GLB/glTF is the open binary standard for WebGL and Android Scene Viewer. |

---

## 24. Appendix and Source References

### 24.1 Document Traceability & Source Locations
This Product Requirements Document (PRD) was compiled through rigorous analysis of the primary engineering artifacts and blueprints governing the SATCO AI Smart Furniture Platform:

1. **`SATCO_Final_Project_Blueprint.md`** (Designated in Section 10/14 as `docs/PROJECT_BLUEPRINT.md`):
   - Path: Root of repository / project workspace (`d:\furniture project for saudi\SATCO_Final_Project_Blueprint.md`).
   - Referenced Sections:
     - Section 1: Executive Summary & Core Product Principle.
     - Section 2: Vision, Objectives, and User Personas.
     - Section 3: Release Strategy (Releases 1 through 4).
     - Section 4: Functional Module Specifications (4.1 through 4.13).
     - Section 5: Technology Architecture & Initial Tech Stack.
     - Section 6: Core Data Model & Initial Entity Map.
     - Section 7: Security, Reliability, and Testing Strategy.
     - Section 8: Development Roadmap (Weeks 1 through 38).
     - Section 9: First 10 Working Days Project Kickoff.
     - Section 10: Project Documentation Structure.
     - Section 11: Cursor AI Agent Master Development Prompt.
     - Section 12: Definition of Done & Release Gate Matrix.
     - Section 13: Required Decisions & Dependency Schedule.
     - Section 14: Immediate Project Start Checklist.

2. **Project Audit Notes & Historical Files:**
   - `recommad file.docx`: Explanatory operational notes regarding multi-phase roadmap, modular technology stack, and Cursor AI workflow guidelines.
   - `3 month a kaj ta jeno ami complete korte pari road map dap.docx`: Supplemental development milestone considerations.
   - `SATCO_AI_Smart_Furniture_Platform_Presentation.pptx`: Platform executive presentation slides.

3. **Status of Expected Repository Files (as of 2026-11-25):**
   - `docs/requirements/REQUIREMENTS_VALIDATION.md`: **Missing** (Traceability designated as Not Assigned / Baseline Approved).
   - `docs/requirements/PROJECT_SCOPE.md`: **Missing** (Synthesized in Section 6).
   - `docs/requirements/USER_ROLES.md`: **Missing** (Synthesized in Section 5 and Section 11).
   - `docs/requirements/ACCEPTANCE_CRITERIA.md`: **Missing** (Synthesized in Section 8 and Section 17).
   - `docs/cnc-compatibility/MACHINE_INFORMATION.md`: **Missing** (Tracked under `DEC-007`).
