# SATCO AI Smart Furniture Platform
## Strategic Product Ideation, Growth & Operational Resilience Backlog

**Document Title:** Enterprise Feature Ideation & Strategic Innovation Backlog  
**Source Path:** `idea.md`  
**Target Platform:** SATCO AI Smart Furniture Platform (KSA)  
**Status:** Living Backlog & Strategic Ideation Baseline  
**Maintainers:** Product Management, System Architecture, Commercial Growth Team  

---

## Executive Overview

This document captures high-value commercial, marketing, anti-fraud, financial risk mitigation, and operational intelligence capabilities designed to scale the SATCO AI Smart Furniture Platform in the Saudi Arabian market.

Custom-manufactured furniture differs fundamentally from standard retail e-commerce:
1. **Irreversibility of Cutting:** Once an engineered panel is cut and edge-banded from a $2440 \times 1220\text{ mm}$ raw sheet, it cannot be returned to stock. Unverified orders or payment defaults result in complete physical scrap loss.
2. **High Average Order Value (AOV):** Custom room setups and modular wardrobes range from $5,000\text{ SAR}$ to $60,000+\text{ SAR}$, mandating rigorous milestone cash-flow control (Due Management) and fraud protection.
3. **Omnichannel Growth:** High customer acquisition costs in the GCC demand sophisticated analytics (GA4 / Data Layer), automated product advertising (Dynamic Feeds), and targeted retargeting of incomplete/abandoned configurations.

---

## 1. Growth, Marketing & Omnichannel Analytics Engine

### 1.1 GA4 (Google Analytics 4) Server & Client-Side Integration
- **Objective:** Establish enterprise-grade visibility into the full customer discovery, customization, configuration, and conversion lifecycle.
- **Strategic Implementation:**
  - Dual-tagging architecture: Client-side Google Tag Manager (GTM) coupled with Server-Side GA4 Measurement Protocol to bypass ad-blockers and iOS Safari ITP cookie restrictions.
  - Custom Event Hierarchy:
    - `view_furniture_item`: Triggered when PDP loads with default parameters.
    - `customize_dimension`: Captures parametric slider interactions ($W, H, D$ changes).
    - `select_material_swatch`: Tracks popular boards, surface finishes, and hardware tiers.
    - `price_calculation_rendered`: Records estimated price and pricing rule version.
    - `request_quote_initiated`: Customer begins Saudi mobile OTP verification.
    - `quote_accepted`: Customer formally accepts commercial contract.
    - `deposit_paid`: High-value macro-conversion event sent with hashed transactional metadata.

### 1.2 Data Layer Standard for Single Page Apps (SPA) & 3D Configurator
- **Objective:** Provide a standardized, predictable, asynchronous JavaScript `window.dataLayer` interface adhering to GA4 Enhanced E-commerce specifications.
- **Strategic Implementation:**
  - Real-time payload emission on every interactive state transition:
    ```javascript
    window.dataLayer.push({
      event: "customize_furniture",
      ecommerce: {
        currency: "SAR",
        value: 12450.00,
        items: [{
          item_id: "SATCO-WARDROBE-MODULAR",
          item_name: "Master Bedroom Modular Wardrobe",
          item_category: "Wardrobes",
          item_variant: "18mm Egger Oak / Matte Black Handles",
          dimension_w: 2400,
          dimension_h: 2600,
          dimension_d: 600
        }]
      }
    });
    ```
  - Enables plug-and-play integration with Google Ads, Meta Pixel, TikTok Pixel, Snapchat Pixel (vital in KSA), and Hotjar heatmapping without altering core React components.

### 1.3 Dynamic Product Feed (Google Merchant Center, Meta Catalog, TikTok Ads)
- **Objective:** Automatically syndicate SATCO catalog products, live price ranges, high-res renders, and stock availability directly to social ad networks and Google Shopping.
- **Strategic Implementation:**
  - Automated XML (Google RSS 2.0 / Atom) and JSON-LD dynamic endpoint: `/api/feeds/google-merchant.xml` and `/api/feeds/meta-catalog.xml`.
  - Bilingual feed support: Arabic feed (`ar_SA`, `SAR`) and English feed (`en_SA`, `SAR`).
  - Parametric "Starting From" price logic for customizable items, updated synchronously with active `PricingRuleVersion`.
  - Scheduled daily edge-caching via Cloudflare/CDN to ensure microsecond response times and zero database load during ad-bot crawling.

### 1.4 Promotional Coupon & Discount Code Engine
- **Objective:** Drive promotional campaigns, seasonal sales (Saudi National Day, Foundation Day, Ramadan specials), and B2B designer partner commissions.
- **Strategic Implementation:**
  - **Discount Archetypes:**
    1. *Percentage Discount:* e.g., $10\%$ off total cabinet carcass (capped at maximum SAR amount).
    2. *Fixed Amount (SAR):* e.g., $500\text{ SAR}$ off orders exceeding $5,000\text{ SAR}$.
    3. *Free Upgrade / Service:* Free soft-close hinges or complimentary white-glove assembly in Jeddah.
  - **Safeguards & Anti-Abuse Rules:**
    - Per-customer usage caps linked to verified Saudi Mobile Number.
    - Minimum order threshold enforcement.
    - Non-stackable with sales rep discretionary discounts (`BR-PRICE-004`).
    - Expiration dates and budget spend ceilings (e.g., campaign shuts down automatically after $50,000\text{ SAR}$ total redeemed discounts).

---

## 2. Risk Mitigation, Anti-Fraud & Factory Protection Shield

### 2.1 Fake Order Prevention Solution
- **The Core Business Problem:** Unlike ready-made retail, custom furniture cannot be put back on a warehouse shelf. A fake order that reaches the factory cutting table destroys raw MDF sheets, wastes CNC spindle run-time, and consumes labor.
- **Multi-Layer Defensive Shield:**
  1. *Layer 1 — Bot & Disposable Number Defense:* Rate limit quote submissions; block virtual VoIP numbers and disposable burner SIM cards.
  2. *Layer 2 — Mandatory Saudi Mobile OTP:* 4-digit verification sent through a certified Saudi telecom gateway (Unifonic / Taqnyat).
  3. *Layer 3 — Geolocation & IP Reputation Score:* Flag submissions from proxies, VPNs, or foreign IPs pretending to order Jeddah local delivery.
  4. *Layer 4 — Mandatory Pre-Production Deposit Gate (`BR-SEC-005`):* **Zero saw blade cuts without verified bank deposit.** No job can advance to `READY_FOR_PRODUCTION` without verified payment confirmation in the accounting ledger.

### 2.2 Fraud Customer Risk Profiling & Blacklist Management
- **Objective:** Automatically identify, flag, and block bad actors, chronic cancellation abusers, and payment dispute fraud across the platform.
- **Strategic Implementation:**
  - **Customer Risk Score (0 to 100):**
    - High-risk signals: History of unverified chargebacks, multiple refused quote requests with fake dimensions, fake addresses, or repeated OTP spamming.
    - Low-risk signals: Verified Saudi National Address (Wasel), completed previous orders, prompt milestone deposits.
  - **Centralized Blacklist:** Searchable index matching Saudi Mobile, Email Hash, and National ID.
  - **Operational Action:** Blacklisted actors cannot generate instant quote contracts; their submissions are routed silently to a "Review Queue" without alerting the fraudster.

---

## 3. Revenue Operations, Cash Flow & Incomplete Order Recovery

### 3.1 Due Manager (Milestone Payments & Accounts Receivable Tracking)
- **The Core Business Problem:** Custom furniture manufacturing requires upfront working capital for raw boards, edging, and hardware. Extended payment delays or unpaid final balances crush factory cash flow.
- **Strategic Implementation:**
  - **Automated 3-Stage Milestone Payment Architecture:**
    1. *Milestone 1 — Commitment Deposit ($50\%$):* Required to approve order, generate engineering BOM, and reserve warehouse boards.
    2. *Milestone 2 — Pre-Dispatch Balance ($40\%$):* Required once quality check (`QC`) passes at the factory before shipping trucks depart.
    3. *Milestone 3 — Handover / Installation ($10\%$):* Collected upon customer signoff and assembly completion at the residence.
  - **Factory Dispatch Hold Gate (`BR-ORD-005`):** Warehouse management software physically locks logistics dispatch if Milestone 2 is unpaid.
  - **Automated Due Aging & Notifications:**
    - Visual aging buckets: Current, 1–15 days overdue, 16–30 days, 30+ days.
    - Automated bilingual WhatsApp and SMS payment reminders with 1-click mada / Apple Pay checkout links.

### 3.2 Incomplete Order & Abandoned Configurator Recovery
- **The Core Business Problem:** High-intent customers spend 20+ minutes configuring their dream wardrobe, adjusting dimensions, and selecting finishes, but drop off right before submitting an enquiry or paying a deposit.
- **Strategic Implementation:**
  - **Automated Session Snapshotting:** The configurator auto-saves design state to local storage and backend drafts.
  - **Lead Recovery Sequences (WhatsApp + SMS):**
    - *T + 1 Hour:* Gentle automated WhatsApp message in Arabic: *"Hi [Name], your custom wardrobe design is saved! Click here to preview your 3D room render and continue where you left off."*
    - *T + 24 Hours:* Sales Representative alert in CRM: High-value abandoned configuration ($> 15,000\text{ SAR}$) assigned to dedicated designer for personalized phone outreach.
    - *T + 72 Hours:* Limited-time promotional nudge (e.g., complimentary drawer dividers if completed within 48 hours).
  - **Saudi PDPL Privacy Adherence:** Clear opt-out link included in every recovery notification.

### 3.3 Material Sample Box Request & Factory/Showroom Pickup Protocol
- **The Core Business Problem:** In luxury custom cabinetry ($15,000 - $60,000+\text{ SAR}$), customers hesitate to pay a 50% commitment deposit without feeling the tactile quality of the board substrate, lacquer finish, and edge-banding.
- **Strategic Implementation:**
  - Online swatch request flow offering:
    - *Option A:* Free self-pickup at SATCO factory (Jeddah Industrial City) or main showroom.
    - *Option B:* Home courier delivery with a nominal conditional deposit ($100\text{ SAR}$).
  - Deposit is 100% credited against any subsequent furniture order exceeding $5,000\text{ SAR}$, transforming sample requests into a high-converting sales qualification funnel (`BR-SMP-001`).

---

## 4. Trust, Social Proof & Catalog Intelligence

### 4.1 Rating & Review System (Verified Buyer Trust Engine)
- **Objective:** Convert customer satisfaction into powerful social proof, elevating conversion rates for high-ticket custom cabinetry.
- **Strategic Implementation:**
  - **Verified Buyer Exclusivity:** Reviews can ONLY be submitted by customers whose orders have reached `DELIVERED` / `COMPLETED` status. Public reviews carry a prominent **"Verified SATCO Buyer"** badge.
  - **Rich Media Reviews:** Customers can upload photos and videos of their installed furniture in their actual homes.
  - **Saudi Cultural & Privacy Moderation Queue:**
    - To respect Saudi family privacy, photo submissions pass through an admin moderation queue before publication to prevent accidental exposure of private home interiors, family members, or sensitive documents.
  - **Aggregate Schema.org Markup:** Injects star ratings (`AggregateRating`) into Google search results to boost organic CTR.

### 4.2 Enterprise Product Manager (PIM)
- **Objective:** Empower product managers, factory engineers, and merchandisers to govern complex configurable furniture families, options, and operational rules at scale.
- **Strategic Implementation:**
  - Multi-dimensional variant matrices: Manage hundreds of finish/hardware combinations without duplicating catalog items.
  - Visual dimension constraint builder: Intuitive admin UI to define formulas, step span increments, and max width bounds without writing code.
  - Material linkage: Directly link catalog options to physical warehouse raw boards (`FR-MAT-002`) and rate cards (`FR-RTE-001`).
  - Bulk import/export: Support Excel/CSV uploads of product templates, pricing coefficients, and technical drawings.

### 4.3 Total Reporting & Executive BI Command Center
- **Objective:** Provide the CEO, CFO, and Factory General Manager with a unified, real-time command dashboard reconciling commercial sales funnels, financial cash flow, and factory operational yield.
- **Key Metric Pillars:**
  1. *Commercial Funnel:* Web Traffic $\to$ Configurator Opens $\to$ Quote Enquiries $\to$ Issued Quotes $\to$ Closed Orders.
  2. *Financial & Due Health:* Total Booked Revenue, Cash Collected, Accounts Receivable Outstanding (Aging buckets), Net Margin per Job.
  3. *Factory Operational Yield:* Total Raw Sheets Consumed vs. Offcut Scrap Percentage, Edge-Banding Linear Meters Used, CNC Spindle Run-Time, Station Bottlenecks (Cutting vs Edge vs Assembly).
  4. *Customer & Lead Intelligence:* CAC (Customer Acquisition Cost), Regional Distribution (Jeddah, Jeddah, Dammam), Abandoned Design Recovery Rate.

### 4.4 In-House Field Installation App & Digital Customer Handover
- **Objective:** Eliminate site disputes, verify room readiness, track in-house technicians, and collect legal digital customer handover e-signatures on mobile tablets to unlock Milestone 3 final billing.
- **Strategic Implementation:**
  - Site readiness pre-check: Technician photographs room conditions (plaster, floor levels, power sockets) before unloading panels.
  - Digital Handover Canvas: Customer signs on tablet after physical inspection; signature is timestamped and attached to order contract.

### 4.5 Configurable Warranty Governance & Rapid Single-Part RMA Re-Cut
- **Objective:** Eliminate delays and catastrophic cost overruns when a single component is damaged during transit or installation.
- **Strategic Implementation:**
  - Standard warranty terms: Configurable 2-year substrate structural warranty and 1-to-2 year mechanical hardware warranty (`BR-WAR-001`).
  - Fast-Track RMA: Factory isolates the single damaged panel code from historical BOM data and dispatches an expedited single-panel cut to the Homag CNC without re-running the full furniture unit.

---

## Summary Priority Matrix

| Feature | Primary Business Impact | Implementation Phase | Priority |
| :--- | :--- | :---: | :---: |
| **Fake Order Solution** | Prevents physical board scrap & wasted labor | Release 1 | **Must Have** |
| **Due Manager** | Protects cash flow & working capital | Release 1 | **Must Have** |
| **In-House Field Installation**| Guarantees quality assembly & digital signoff | Release 1 | **Must Have** |
| **GA4 & Data Layer** | Essential conversion tracking & marketing analytics | Release 1 | **Must Have** |
| **Incomplete Order Recovery**| Recovers high-intent lost sales via WhatsApp | Release 1 | **Must Have** |
| **Fast-Track Single-Part RMA**| Rapid warranty fixes without re-cutting units | Release 1 / 2 | **Must Have** |
| **Material Sample Box** | Converts hesitant high-ticket prospects | Release 1 | **Should Have** |
| **Coupon Engine** | Drives seasonal promotions & campaign conversions | Release 1 | **Should Have** |
| **Product Manager (PIM)** | Scales catalog governance & variant mapping | Release 1 | **Should Have** |
| **Rating & Review System** | Establishes high-ticket buyer social proof | Release 1 | **Should Have** |
| **Total Reporting (BI)** | Executive oversight across sales, factory & P&L | Release 1 / 2 | **Must Have** |
| **Fraud Customer Blacklist**| Blocks chronic dispute abusers & spam bots | Release 1 / 2 | **Should Have** |
| **Dynamic Feed (Google/Meta)**| Omnichannel social ads & retargeting automation | Release 2 | **Should Have** |
