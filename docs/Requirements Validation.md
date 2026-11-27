# Requirements Validation Document

**Project:** SATCO AI Smart Furniture Platform  
**Document:** `docs/requirements/REQUIREMENTS_VALIDATION.md`  
**Version:** 1.0  
**Status:** Initial validation baseline — pending stakeholder review  
**Source Baseline:** `PROJECT_BLUEPRINT.md` (Version 1.0)  
**Purpose:** Validate that project requirements are clear, complete enough to implement, testable, traceable, and approved before development of each dependent module.

---

## 1. Purpose and Validation Principles

This document turns the project blueprint into a practical requirements validation process. It is not evidence that the requirements have already been approved or that any feature has been implemented.

Each requirement must satisfy the following validation criteria:
1. **Clear** — Understandable without relying on undocumented assumptions.
2. **Complete** — Includes the necessary inputs, rules, outputs, and exception handling for its scope.
3. **Consistent** — Does not conflict with another approved requirement.
4. **Feasible** — Technically and operationally achievable with verified dependencies.
5. **Testable** — Has observable acceptance criteria and a reproducible test.
6. **Traceable** — Linked to a module, release, acceptance test, and decision where relevant.
7. **Approved** — Reviewed by the responsible business owner before implementation.

### Validation Status Values

| Status | Meaning |
| :--- | :--- |
| **Not Reviewed** | No formal validation has been performed. |
| **Needs Clarification** | The requirement is ambiguous or missing information. |
| **Blocked** | A required business, technical, vendor, or security dependency is unavailable. |
| **Ready for Approval** | Clear and testable; awaiting authorized approval. |
| **Approved** | Reviewed and accepted by the responsible stakeholder. |
| **Rejected** | Explicitly not accepted; record the reason. |
| **Implemented — Not Verified** | Code exists, but acceptance evidence has not passed. |
| **Verified** | Acceptance criteria passed and evidence is recorded. |

> [!NOTE]
> **Initial Status:** All requirements in this document start as **Not Reviewed** unless a reviewer records a different status. The blueprint's "Ready for project initiation" status does not mean every detailed requirement or external dependency is validated.

---

## 2. Scope and Release Validation

Validate the release boundary before implementation. Do not treat later-phase capabilities as part of the initial release unless the project owner formally changes the scope.

| Release | Included Scope | Required Validation Gate |
| :--- | :--- | :--- |
| **Release 1 — Core Furniture Business Platform** | Website, catalogue, custom configuration, material/hardware selection, pricing, enquiries, quotations, admin/RBAC, basic production jobs, inventory, status tracking and reports | Core customer-to-quotation and approved-order-to-production workflows pass UAT. |
| **Release 2 — Manufacturing Data and CNC Preparation** | BOM, parts generator, panel calculations, cutting list/optimization, edge-banding, labels, export framework, manual machine-software import, file history and approval | Test products generate correct, reviewed manufacturing data; export format is verified against the actual target software before production use. |
| **Release 3 — 3D, AI and AR** | 3D configurator, constrained dimensions/options, AI room suggestions, confirmed room measurements, 3D room layout and AR preview/fallback | Visual output is clearly separated from approved manufacturing data; dimensions and device compatibility are validated. |
| **Release 4 — Machine Bridge and SaaS** | Factory PC Bridge where supported, verified machine adapter, supported status exchange, multi-tenancy, subscriptions, limits, payment abstraction and SaaS admin | Machine compatibility/security is verified; automated tests prove tenant isolation and payment events are verified server-side. |

### Scope Validation Checklist
- [ ] Business owner confirms the four-release strategy.
- [ ] Release 1 exclusions and dependencies are documented.
- [ ] Each release has a named business approver.
- [ ] Each release has acceptance criteria and test evidence requirements.
- [ ] Change requests are recorded with impact on schedule, cost, architecture, and risk.
- [ ] No future-phase feature is silently treated as a Release 1 commitment.

---

## 3. Requirement Register

The following IDs provide traceability. They describe requirements from the project blueprint; they are not proof of approval.

### 3.1 Customer Website and Catalogue

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **WEB-001** | The website must be responsive on supported desktop and mobile screen sizes. | Execute agreed viewport tests; key pages remain usable without layout breakage. | Must | Not Reviewed |
| **WEB-002** | Customers can browse published product categories and product details. | Seed published products; verify category listing and product detail navigation. | Must | Not Reviewed |
| **WEB-003** | Product details can display images, descriptions, dimensions and available options. | Verify required fields and behavior when optional content is absent. | Must | Not Reviewed |
| **WEB-004** | Product search, filtering and sorting are available. | Define supported search fields, filters and sort order; test representative data. | Should | Needs Clarification |
| **WEB-005** | Customers can submit contact and enquiry forms. | Valid submission is stored and visible to authorized staff; invalid input is rejected clearly. | Must | Not Reviewed |
| **WEB-006** | The interface supports English and Arabic with LTR/RTL layouts. | Review translations and test navigation, forms and tables in both directions. | Must | Needs Clarification |
| **WEB-007** | Product pages are SEO-friendly. | Agree SEO fields and verify rendered metadata and indexability requirements. | Should | Needs Clarification |
| **WEB-008** | Admin users can create, edit, publish and archive products. | Role-authorized CRUD and publication tests pass. | Must | Not Reviewed |
| **WEB-009** | Unpublished products are not exposed publicly. | Direct URL/API access to unpublished products is denied or safely handled. | Must | Not Reviewed |

---

### 3.2 Furniture Configuration and Pricing

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **CFG-001** | Configuration supports approved furniture type/model, dimensions and quantity. | Product-specific allowed inputs and boundary values are documented and tested. | Must | Needs Clarification |
| **CFG-002** | Configuration supports applicable board, thickness, colour, finish, edging, hardware and accessories. | Approved option catalogue is available; incompatible options are blocked. | Must | Needs Clarification |
| **PRICE-001** | Pricing uses product-specific formulas, approved BOM rules, material rates and configurable pricing rules. | Business-approved sample calculations match independently checked expected results. | Must | Needs Clarification |
| **PRICE-002** | Pricing accounts for applicable material, hardware, edge-banding, labour, wastage, other charges, tax, discount and margin rules. | Each applicable component has a defined formula, unit, rate source and rounding rule. | Must | Needs Clarification |
| **PRICE-003** | The system must not calculate final price using only width × height × depth. | Code review and tests demonstrate use of approved product-specific rules. | Must | Not Reviewed |
| **PRICE-004** | Invalid dimensions or missing required rates return a clear error or "Request a Quote", not an invented price. | Test invalid dimensions and missing-rate scenarios. | Must | Not Reviewed |
| **PRICE-005** | Each quotation stores the pricing-rule version used. | Historical quotation retains its original rule/rate snapshot after later rate changes. | Must | Not Reviewed |
| **PRICE-006** | Identical inputs and the same pricing-rule version produce reproducible results. | Repeat calculation tests produce the same result under the same inputs/version. | Must | Not Reviewed |
| **PRICE-007** | Admin rate changes do not silently rewrite previously approved quotations. | Change a rate and verify previously approved quote totals and audit history remain unchanged. | Must | Not Reviewed |

> [!IMPORTANT]
> **Business Information Required Before Approval:** Product-specific pricing formulas, units, currency, decimal precision, rounding policy, tax treatment, discount authority, margin rules, wastage policy, labour-rate basis, and who can approve or override a quotation.

---

### 3.3 Admin, Users and Permissions

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **ADM-001** | Admin provides secure login and session management. | Authentication, session expiry and logout tests pass. | Must | Not Reviewed |
| **ADM-002** | The system supports user and role management. | Authorized admin can manage users and role assignments; unauthorized actions are denied. | Must | Not Reviewed |
| **ADM-003** | Permissions are enforced by the backend, not only by hiding frontend controls. | Direct API/server-action authorization tests cover protected operations. | Must | Not Reviewed |
| **ADM-004** | Permission keys are defined for relevant actions, including product, quote, production, inventory and reports. | Permission matrix is approved and automated tests cover allow/deny cases. | Must | Needs Clarification |
| **ADM-005** | Important changes are recorded in an audit log. | Verify actor, action, timestamp, target record and relevant change details for defined events. | Must | Needs Clarification |
| **ADM-006** | Admin manages products, materials, hardware, rates, customers, enquiries, quotations and orders according to role. | Role-based end-to-end tests pass for each management workflow. | Must | Not Reviewed |

---

### 3.4 Quotations, Orders and Production

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **QTE-001** | Staff can review, revise, approve and expire quotations. | Test each state transition, permission and recorded revision. | Must | Needs Clarification |
| **QTE-002** | An approved quotation can be converted into an order. | Conversion preserves customer, items, configuration, price snapshot and references. | Must | Not Reviewed |
| **PROD-001** | An approved customer order can be reviewed and converted into a traceable production job. | Production job references the approved order and exact approved specification revision. | Must | Not Reviewed |
| **PROD-002** | Production supports defined stages such as cutting, edge-banding, machining, assembly, quality check and completion. | Stakeholders approve the status list and transition rules; test valid/invalid transitions. | Must | Needs Clarification |
| **PROD-003** | Production work can be assigned to authorized staff. | Assignment and access tests confirm only permitted users can assign/update work. | Must | Not Reviewed |
| **PROD-004** | Each production status change records who changed it, when, and any note/reason. | Audit/event records are verified for status changes. | Must | Not Reviewed |
| **PROD-005** | Production status and operational reports are available to permitted users. | Report definitions, filters and access rules are approved and tested. | Should | Needs Clarification |

---

### 3.5 Inventory and Materials

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **INV-001** | The material catalogue supports boards, edging, hardware, accessories and consumables. | Approved material types and required fields are documented. | Must | Needs Clarification |
| **INV-002** | Inventory supports units of measure and, where needed, warehouse/location. | Unit conversion and location rules are agreed and tested. | Must | Needs Clarification |
| **INV-003** | Inventory records opening stock, receipts, production issues, returns and adjustments. | Each transaction creates an auditable stock movement. | Must | Not Reviewed |
| **INV-004** | Stock quantity is not changed by directly overwriting a balance without a movement record. | Code review and tests verify all stock changes use transaction records. | Must | Not Reviewed |
| **INV-005** | Low-stock thresholds and reorder information can be maintained. | Threshold behavior and responsible users are agreed and tested. | Should | Needs Clarification |
| **INV-006** | Materials can be reserved for approved production jobs. | Reservation, release, consumption and shortage scenarios are tested. | Must | Needs Clarification |
| **INV-007** | Stock movements retain history and adjustment reasons. | Authorized adjustment test verifies reason, actor and timestamp. | Must | Not Reviewed |

---

### 3.6 BOM and Parts Generation

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **BOM-001** | An approved furniture specification can be transformed into a structured manufacturing definition. | Approved test product produces expected BOM and part records. | Must | Needs Clarification |
| **BOM-002** | Parts can record code/name, parent reference, quantity, dimensions, thickness and material. | Required field schema is approved and validated. | Must | Needs Clarification |
| **BOM-003** | Applicable parts record grain direction, raw/finished dimensions, edge-banding and operations. | Product-specific rules and test fixtures verify each applicable attribute. | Must | Needs Clarification |
| **BOM-004** | Part formulas are product-specific and version-controlled. | Formula revision creates a new revision; released jobs retain the old revision. | Must | Not Reviewed |
| **BOM-005** | BOM and parts require review/approval before production release. | Unauthorized or unapproved BOM cannot be released. | Must | Not Reviewed |
| **BOM-006** | Customer-facing 3D models remain separate from manufacturing BOM data. | Data-flow and permission tests prove visual models cannot silently create/rewrite BOMs. | Must | Not Reviewed |

> [!IMPORTANT]
> **Business Information Required Before Approval:** Approved construction drawings, product-specific assembly rules, panel thicknesses, clearances, joinery rules, hardware placement, machining operations, edge treatment, raw-versus-finished dimension rules and revision ownership.

---

### 3.7 Cutting, Optimization, Edge-Banding and Labels

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **CUT-001** | Parts are grouped by board material and thickness for cutting preparation. | Grouping tests use a representative approved BOM. | Must | Not Reviewed |
| **CUT-002** | Cutting plans account for board size, usable dimensions, kerf, trim, grain and rotation restrictions where configured. | Approved test fixtures verify constraints and expected placement. | Must | Needs Clarification |
| **CUT-003** | Unplaced parts and invalid constraints are reported. | Deliberately impossible test cases return explicit errors and affected part references. | Must | Not Reviewed |
| **CUT-004** | Offcuts/remnants and estimated board usage/waste can be recorded. | Define remnant rules and verify calculations with sample cases. | Should | Needs Clarification |
| **CUT-005** | Cutting optimization remains a recommendation until constraints and output are validated. | UI/export clearly identifies review state; no unapproved plan can be released. | Must | Not Reviewed |
| **EDGE-001** | Edge-banding specifications identify part, edges, material, colour, thickness and applicable quantity/length. | Approved sample parts produce expected edge specifications. | Must | Needs Clarification |
| **LABEL-001** | Each production part or label unit has a unique barcode/QR identifier. | Uniqueness and repeat-print behavior are tested. | Must | Not Reviewed |
| **LABEL-002** | Labels may show job number, part code, dimensions, material and next stage. | Label layout is approved by factory users and verified on target printer/stock. | Should | Needs Clarification |
| **LABEL-003** | QR/barcode values reference secure internal records and do not expose sensitive customer data. | Decode and authorization tests verify the payload and access behavior. | Must | Not Reviewed |

---

### 3.8 CNC Compatibility and Machine Workflow

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **CNC-001** | Initial production-data generation is machine-independent. | BOM, parts, board, cutting, edge-banding and job data can be reviewed without machine connection. | Must | Not Reviewed |
| **CNC-002** | Machine-specific export is implemented only for verified formats supported by the actual machine software. | Vendor documentation and sample-file tests confirm format/version compatibility. | Must | **Blocked** |
| **CNC-003** | Compatibility discovery records machine brand/model, controller/version, CAM software/version, formats, post-processor and operating conventions. | Completed and supplier-verified compatibility record is approved. | Must | **Blocked** |
| **CNC-004** | Each export adapter includes format/version identification, input/output validation, test fixtures, errors and version history. | Automated adapter tests and sample-file review pass. | Must | Not Reviewed |
| **CNC-005** | Human approval is required before production use of an exported file. | Unapproved export cannot be released; approval is auditable. | Must | Not Reviewed |
| **CNC-006** | Manual import/export remains available as a fallback. | Factory operator completes a documented manual workflow. | Must | Not Reviewed |
| **CNC-007** | A Factory PC Bridge is introduced only after compatibility and security are verified. | Security review and factory acceptance test pass before enabling bridge. | Later | **Blocked** |
| **CNC-008** | CNC controller is never exposed directly to the public internet and vendor safety controls/interlocks are not bypassed. | Network/security review and operational procedure are approved. | Must | Not Reviewed |
| **CNC-009** | File transfer, approval, import, errors and completion events are logged. | End-to-end event audit can reconstruct a test job's lifecycle. | Later | Not Reviewed |

> [!WARNING]
> **Open Dependency:** The project information currently identifies the CNC machine/controller as an industrial smart CNC (such as Homag / Industry Benchmark CNC), but the exact brand, model, controller details, software/CAM product and version, supported formats and vendor documentation are not confirmed in the blueprint. Do not assume DXF, MPR, XML or any other format is compatible until verified with the supplier/manufacturer.

---

### 3.9 3D, AI Room Design and AR

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **3D-001** | The 3D viewer loads approved furniture models and supports camera orbit/zoom. | Approved model assets render on the supported device matrix. | Later | Needs Clarification |
| **3D-002** | Dimension, material, colour and finish changes are constrained by approved product rules. | Boundary and invalid-option tests pass. | Later | Needs Clarification |
| **3D-003** | 3D model dimensions correspond to selected configuration within defined tolerances. | Dimensional comparison test and tolerance are approved. | Later | Needs Clarification |
| **3D-004** | 3D preview is not represented as a production drawing. | UI labels and workflow prevent preview from being used as production approval. | Must | Not Reviewed |
| **AI-001** | AI room design accepts a room photo and user-selected room type/style. | Upload and input validation tests pass. | Later | Needs Clarification |
| **AI-002** | AI-generated output is presented as a suggestion, not a verified measurement. | UI labels and workflow clearly identify generated/estimated content. | Must | Not Reviewed |
| **AI-003** | Room dimensions are entered or confirmed by the customer. | Design cannot progress to product configuration without required confirmation. | Must | Not Reviewed |
| **AI-004** | AI suggestions can be matched with SATCO products, saved and connected to a quotation request. | End-to-end saved-design-to-enquiry test passes. | Later | Needs Clarification |
| **AI-005** | AI provider integration is abstracted so the provider can be changed later. | Provider-independent interface and contract tests are demonstrated. | Later | Not Reviewed |
| **AR-001** | Supported devices can preview furniture in AR; unsupported devices receive a usable 3D fallback. | Device compatibility matrix and fallback tests pass. | Later | Needs Clarification |
| **AR-002** | AR scale uses validated model dimensions. | Known-size reference test confirms scale within an approved tolerance. | Must | Needs Clarification |
| **AR-003** | AR placement does not approve manufacturing specifications. | AR workflow cannot create/release a production job without standard validation and approval. | Must | Not Reviewed |

---

### 3.10 SaaS and Billing

| ID | Requirement | Validation / Acceptance Evidence | Priority | Status |
| :--- | :--- | :--- | :--- | :--- |
| **SAAS-001** | Multi-tenant SaaS is added after the single-company core workflow is stable. | Release gate confirms core workflow and security baseline are accepted. | Later | Not Reviewed |
| **SAAS-002** | Tenant-owned users, products, customers, materials, orders and settings are isolated. | Automated cross-tenant read/write tests pass for every tenant-owned domain. | Must | Not Reviewed |
| **SAAS-003** | Tenant authorization is enforced server-side; untrusted client tenant IDs are not trusted. | Forged tenant-ID tests are denied and logged where appropriate. | Must | Not Reviewed |
| **SAAS-004** | Platform-level administration is separate from tenant administration. | Role and authorization tests prove boundary separation. | Must | Not Reviewed |
| **BILL-001** | Subscription plans support agreed feature limits and usage tracking. | Plan matrix and limit behavior are approved and tested. | Later | Needs Clarification |
| **BILL-002** | Subscription lifecycle supports required states such as trial, active, past due, cancelled and suspended. | State-transition table and tests are approved. | Later | Needs Clarification |
| **BILL-003** | Payment status is verified server-side using provider-signed events/webhooks. | Signature verification, replay/duplicate handling and failure tests pass. | Must | Not Reviewed |
| **BILL-004** | Payment provider is abstracted. | Provider interface and contract tests are demonstrated. | Later | Needs Clarification |

---

## 4. Cross-Cutting Non-Functional Requirements

| ID | Requirement | Validation Evidence | Status |
| :--- | :--- | :--- | :--- |
| **NFR-SEC-001** | Validate all inputs on the server. | Negative and boundary tests cover public and protected inputs. | Not Reviewed |
| **NFR-SEC-002** | Apply authentication and authorization to every protected operation. | Automated endpoint/action permission tests pass. | Not Reviewed |
| **NFR-SEC-003** | Protect against SQL injection, XSS, CSRF where applicable, insecure direct object references and file-upload abuse. | Security test plan and remediation report. | Not Reviewed |
| **NFR-SEC-004** | Keep secrets in environment variables or a managed secret store; do not commit `.env` or API keys. | Repository secret scan and deployment configuration review. | Not Reviewed |
| **NFR-SEC-005** | Restrict uploaded file types, sizes and access. | Upload validation and unauthorized-download tests. | Not Reviewed |
| **NFR-SEC-006** | Use secure session and cookie settings and rate-limit sensitive public endpoints. | Configuration review and abuse/rate-limit tests. | Not Reviewed |
| **NFR-REL-001** | Use reviewed database migrations with rollback planning. | Migration review and tested recovery procedure. | Not Reviewed |
| **NFR-REL-002** | Use structured application logs and monitor background jobs/failures. | Operational test demonstrates searchable logs and visible failed jobs. | Not Reviewed |
| **NFR-REL-003** | Back up the database and test restoration. | Successful restore exercise with recorded result. | Not Reviewed |
| **NFR-REL-004** | Define backup retention and recovery objectives before production launch. | Approved retention, RPO and RTO policy. | Needs Clarification |
| **NFR-DATA-001** | Store money using exact decimal types, not floating-point arithmetic. | Schema/code review and calculation tests. | Not Reviewed |
| **NFR-DATA-002** | Store dimensions with explicit units and normalize internal calculations. | Schema review and unit conversion tests. | Not Reviewed |
| **NFR-DATA-003** | Maintain version history for quotations, pricing rules, BOMs and production files. | Revision and historical retrieval tests. | Not Reviewed |
| **NFR-DATA-004** | Use database transactions for workflows that update multiple related records. | Failure-injection tests prove atomicity for critical workflows. | Not Reviewed |
| **NFR-TEST-001** | Unit, integration, permission, UI, file, UAT and regression tests are maintained. | Test suite and release report show results. | Not Reviewed |

> [!NOTE]
> Performance, availability, accessibility, browser support, retention, privacy, localization quality and recovery targets are not numerically specified in the blueprint. Agree measurable targets before production launch rather than inventing them.

---

## 5. Business Decisions and Dependencies Register

These items must be resolved before the dependent module is approved. They should not unnecessarily block unrelated foundation work.

| ID | Decision / Information Required | Needed Before | Owner | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEC-001** | SATCO logo, brand assets, colours and website content | Website design | Business owner / Marketing | Not Reviewed |
| **DEC-002** | Supported languages and translation review process | Website release | Business owner | Needs Clarification |
| **DEC-003** | Product types, models and dimension constraints | Configurator | Product / Factory | Not Reviewed |
| **DEC-004** | Board, hardware and edging catalogue, units and rates | Pricing and inventory | Store / Finance | Not Reviewed |
| **DEC-005** | Pricing formulas, labour, wastage, tax, discount and margin rules | Pricing engine | Finance / Business owner | Not Reviewed |
| **DEC-006** | Approved furniture drawings and construction formulas | BOM and parts generator | Production / Engineering | Not Reviewed |
| **DEC-007** | Board sizes, usable area, kerf, trim, grain and rotation rules | Cutting optimization | Factory / CNC operator | Not Reviewed |
| **DEC-008** | Exact CNC machine brand/model, controller and software/version | CNC adapter | Factory / Supplier | **Blocked** |
| **DEC-009** | Vendor-supported file formats, post-processor, sample files and safe test procedure | CNC export | Supplier / CNC specialist | **Blocked** |
| **DEC-010** | 3D model assets and dimensional validation tolerances | 3D configurator | Design / Engineering | Not Reviewed |
| **DEC-011** | AI provider, privacy/data policy and usage budget | AI room design | Business / Technical owner | Not Reviewed |
| **DEC-012** | Target mobile devices and AR requirements | AR | Business / Technical owner | Not Reviewed |
| **DEC-013** | Tenant plans, feature limits, payment provider and legal/business rules | SaaS billing | Business / Finance | Not Reviewed |
| **DEC-014** | User roles, permission matrix and approval authority | Admin and all protected workflows | Business owner | Needs Clarification |
| **DEC-015** | Backup retention, recovery objectives and production support ownership | Production launch | Technical owner | Needs Clarification |

---

## 6. End-to-End Workflow Validation

The following workflows must be validated with real business users before the relevant release is accepted.

### Workflow A — Customer Enquiry to Approved Quotation
1. Customer browses a published product.
2. Customer selects an allowed configuration and dimensions.
3. System validates the configuration.
4. System calculates a reproducible estimate or returns "Request a Quote" if required data is missing.
5. Customer submits an enquiry.
6. Authorized sales staff review and prepare/revise a quotation.
7. Authorized person approves the quotation.
8. The quotation retains its pricing-rule version and revision history.

**Pass Criteria:**
- [ ] Invalid dimensions/options are blocked with understandable messages.
- [ ] Missing rates/formulas do not produce invented prices.
- [ ] Quote total can be reproduced from its saved rule version.
- [ ] Only authorized users can approve.
- [ ] Revision and approval history is traceable.

---

### Workflow B — Approved Order to Production Job
1. Approved quotation is converted into an order.
2. Production reviews the approved specification.
3. BOM/parts are prepared where the relevant release supports them.
4. Material availability is checked and reserved as applicable.
5. Production job is created and assigned.
6. Authorized users update production stages.
7. Quality check, packing and dispatch are recorded.
8. Completion is traceable to the approved order and specification revision.

**Pass Criteria:**
- [ ] Production cannot start from an unapproved quotation/order.
- [ ] Job references the correct approved specification revision.
- [ ] Stock movements and reservations are auditable.
- [ ] Status transitions and assignments are permission-controlled.
- [ ] The job history records actor and timestamp.

---

### Workflow C — Manufacturing Data to CNC Software
1. Approved specification generates BOM and parts.
2. Parts and dimensions are validated.
3. Cutting plan is generated using configured constraints.
4. Edge-banding and labels are prepared.
5. Authorized user reviews and approves production data.
6. A verified export adapter creates a file for the confirmed machine software.
7. Operator imports the file using the supported workflow.
8. Outcome and errors are recorded.

**Pass Criteria:**
- [ ] The test product generates expected parts and quantities.
- [ ] Invalid dimensions and unplaced parts are reported.
- [ ] Export format/version is verified against actual vendor software.
- [ ] Human approval is required before production use.
- [ ] Manual import/export remains available.
- [ ] No unsafe network or machine-control shortcut is introduced.

---

### Workflow D — AI/3D/AR Design to Quotation
1. Customer enters room information and uploads a photo where supported.
2. AI creates visual suggestions.
3. Customer confirms actual room dimensions.
4. Customer selects SATCO products and an allowed configuration.
5. 3D/AR preview displays validated model dimensions.
6. Customer saves the design and requests a quotation.

**Pass Criteria:**
- [ ] AI output is labelled as a suggestion/estimate.
- [ ] AI image dimensions are not treated as verified measurements.
- [ ] Product configuration passes the standard validation and pricing workflow.
- [ ] 3D/AR preview does not approve or generate a production BOM by itself.
- [ ] Unsupported AR devices receive a 3D fallback.

---

### Workflow E — SaaS Tenant Isolation
1. Two test tenants are created.
2. Users are assigned to their respective tenants.
3. Each tenant creates and manages its own records.
4. Users attempt to access the other tenant's records through UI and direct API requests.
5. Subscription/payment events are tested.

**Pass Criteria:**
- [ ] Cross-tenant reads and writes are denied.
- [ ] Server authorization does not trust a client-supplied tenant ID.
- [ ] Platform admin and tenant admin privileges remain separate.
- [ ] Payment events are signature-verified server-side.
- [ ] Automated tenant-isolation tests run in CI.

---

### Workflow F — Milestone Payments & Logistics Pre-Dispatch Hold Gate
1. Commercial order enters production after Milestone 1 ($50\%$ deposit) verification.
2. Workshop completes assembly and quality check (`QC`); order transitions to `QC_PASSED`.
3. System triggers Milestone 2 payment request ($40\%$ pre-dispatch balance) with automated WhatsApp link.
4. Logistics attempts to generate shipping manifest and assign delivery vehicle before customer pays.
5. System enforces `BR-ORD-005` pre-dispatch hold: UI and API block dispatch with `DISPATCH_HOLD - DUE_PAYMENT`.
6. Customer pays Milestone 2 via mada / Apple Pay; payment gateway fires verified webhook.
7. System clears hold, unlocks logistics manifest, and updates status to `READY_FOR_DISPATCH`.

**Pass Criteria:**
- [ ] Logistics cannot print delivery manifest or assign vehicle while Milestone 2 is unpaid.
- [ ] Webhook cryptographic signature verification passes before clearing dispatch hold.
- [ ] Overdue accounts receivable aging bucket updates correctly.

---

### Workflow G — In-House Field Installation & Customer Digital Handover E-Sign
1. Delivery crew arrives at customer residence in Jeddah.
2. In-house technician opens field app on tablet (`/installer/jobs/{id}`).
3. Technician executes digital Site Readiness Checklist with photos (room walls, floor level, socket clearances).
4. Crew completes on-site assembly, door alignment, and filler trim fitting.
5. Technician walks customer through inspection and opens Handover Sign-off canvas.
6. Customer signs digitally on the tablet screen; system records timestamp and GPS coordinates (`BR-INS-001`).
7. System updates order status to `INSTALLED_HANDOVER`, binding signature image to contract and triggering Milestone 3 ($10\%$) final billing.

**Pass Criteria:**
- [ ] Order cannot transition to `INSTALLED_HANDOVER` without customer digital signature.
- [ ] Signature image is permanently archived in audit record.
- [ ] Handover completion automatically unlocks Milestone 3 invoice.

---

### Workflow H — Fast-Track Warranty RMA & Single-Part CNC Remake
1. Installer or customer reports a panel damaged during transit/installation (e.g., Part `P-044-02` Left Gable).
2. Field app captures defect photos and submits warranty RMA claim.
3. Warranty service checks active warranty status (2-year structural board warranty / 1-to-2 year hardware warranty).
4. Production Manager approves claim and clicks "Fast-Track Single-Part Remake".
5. BOM engine isolates Part `P-044-02` from historical approved order BOM without re-ordering the whole cabinet.
6. System exports isolated single-panel CAM job directly to Homag CNC offcut saw.
7. Remake panel is cut, edge-banded, and dispatched same-day.

**Pass Criteria:**
- [ ] Single-part remake inherits 100% exact dimensions, edge codes, and boring holes from historical BOM.
- [ ] Zero requirement to re-draw or re-nest unaffected cabinet panels.
- [ ] RMA job links traceably to parent customer order.

---

### Workflow I — Incomplete Order & Abandoned Configurator WhatsApp/SMS Recovery
1. Customer spends 15 minutes configuring a custom wardrobe ($> 10,000\text{ SAR}$).
2. Customer inputs verified Saudi mobile number via OTP, but exits before submitting quotation request.
3. System detects session inactivity ($> 30\text{ minutes}$) and serializes configuration into a cloud draft.
4. At $T + 1\text{ hour}$, system triggers automated Arabic WhatsApp message with 1-click restore link (`FR-ENQ-002`).
5. Customer clicks link; 3D configurator reloads with 100% of previous dimensions and finishes restored.
6. Customer completes quotation submission.

**Pass Criteria:**
- [ ] 1-click reload link restores exact dimensional parameters and material options.
- [ ] WhatsApp message includes compliant opt-out mechanism (`BR-SEC-004`).
- [ ] High-value designs ($> 15,000\text{ SAR}$) spawn CRM follow-up task for sales reps.

---

### Workflow J — Material Sample Box Request & Conditional Deposit Order Credit
1. Prospective customer clicks "Request Material Sample Box" on website.
2. Customer selects up to 5 finishes and chooses delivery method:
   - Option A: Free self-pickup at SATCO factory/showroom.
   - Option B: Courier delivery with conditional $100\text{ SAR}$ deposit paid via Apple Pay/mada.
3. System creates `SampleBoxRequest` record and issues SMS pickup/tracking token.
4. Customer subsequently customizes furniture and places order exceeding $5,000\text{ SAR}$.
5. System automatically applies $100\text{ SAR}$ voucher credit against order total (`BR-SMP-001`).

**Pass Criteria:**
- [ ] Deposit is 100% credited against subsequent qualifying orders.
- [ ] Sample voucher cannot be redeemed on orders below $5,000\text{ SAR}$ minimum spend.
- [ ] Pickup orders incur zero deposit charge.

---

## 7. Test Evidence and Defect Handling

For each requirement marked **Implemented — Not Verified** or **Verified**, record evidence using this schema:

| Field | Required Information |
| :--- | :--- |
| **Requirement ID** | e.g., `PRICE-005` |
| **Test Case ID** | Unique test reference |
| **Environment** | Local / staging / production-like |
| **Build / Commit** | Exact version tested |
| **Test Data** | Product, order, material or user scenario |
| **Expected Result** | Approved acceptance criterion |
| **Actual Result** | Observed behavior |
| **Evidence** | Screenshot, test report, sample export or audit record reference |
| **Result** | Pass / Fail / Blocked |
| **Defect ID** | Link to issue if failed |
| **Tester and Date** | Person and date of execution |
| **Reviewer** | Authorized approver |

### Defect Severity Definitions
- **Critical:** Security breach, cross-tenant data exposure, unsafe machine action, data corruption or inability to perform a core business workflow.
- **High:** Major requirement fails with no acceptable workaround.
- **Medium:** Partial failure or significant inconvenience with a documented workaround.
- **Low:** Cosmetic or minor issue that does not undermine the workflow.

> [!CAUTION]
> A failed acceptance test must not be recorded as Verified. Fixes require regression testing of affected workflows.

---

## 8. Release Approval Checklist

### Release 1 — Core Platform
- [ ] Requirements and user roles approved.
- [ ] Product catalogue and publication rules pass.
- [ ] Configuration constraints and pricing rules approved.
- [ ] Quote revision, approval and historical pricing behavior pass.
- [ ] Backend authorization tests pass.
- [ ] Inventory movements are auditable.
- [ ] Approved order can become a traceable production job.
- [ ] Core customer, sales, admin and factory UAT passes.
- [ ] Backup/restore and deployment procedures are reviewed.
- [ ] Critical and high-severity defects are closed or formally accepted with documented risk.

### Release 2 — Manufacturing Data and CNC Preparation
- [ ] Approved product drawings and construction rules exist.
- [ ] BOM and parts test fixtures pass.
- [ ] Cutting constraints and test boards are approved.
- [ ] Edge-banding and label formats are approved by factory users.
- [ ] Export format and version are verified against actual machine software.
- [ ] Sample exports pass validation and human review.
- [ ] Manual import/export procedure is documented.
- [ ] Operator UAT passes.

### Release 3 — 3D, AI and AR
- [ ] Approved 3D assets and dimension tolerances exist.
- [ ] Configuration limits match approved product rules.
- [ ] AI provider, privacy policy and usage budget are approved.
- [ ] AI-generated content is labelled as advisory.
- [ ] Room dimensions are confirmed by the customer.
- [ ] Device compatibility matrix is tested.
- [ ] AR fallback works on unsupported devices.
- [ ] Visual workflows cannot bypass manufacturing approval.

### Release 4 — Machine Bridge and SaaS
- [ ] CNC compatibility and security review is approved before bridge activation.
- [ ] Factory PC Bridge access is restricted and audited.
- [ ] No CNC controller is publicly exposed.
- [ ] Tenant isolation tests pass across all tenant-owned modules.
- [ ] Subscription plans and lifecycle rules are approved.
- [ ] Payment webhooks/events are verified server-side.
- [ ] SaaS admin and tenant admin boundaries pass tests.
- [ ] Operational monitoring, backup and support procedures are ready.

---

## 9. Requirements Change Control

Any change to an approved requirement must be recorded before implementation.

### Change Record Structure:
- Change request ID and date.
- Requirement ID(s) affected.
- Description and business reason.
- Requested by and approved by.
- Impact on user workflow, data model, security, integrations, cost and schedule.
- Migration/backward-compatibility impact.
- Updated acceptance criteria and test cases.
- Decision: approved, rejected or deferred.

> [!IMPORTANT]
> Do not silently change released pricing rules, BOM formulas, cutting rules, approved quotations or production files. Use explicit revisions and preserve historical traceability.

---

## 10. Comprehensive System Resilience, Edge Cases, Security, Notification & Exception Matrix

This section establishes formal validation test cases for the 8 critical system resilience dimensions, guaranteeing zero runtime deadlocks, data corruptions, or security vulnerabilities.

### 10.1 Critical Edge Cases & Concurrency Test Register

| ID | Edge Case Scenario | Test Condition & Boundary Inputs | Expected System Behavior & Validation Proof | Severity |
| :--- | :--- | :--- | :--- | :---: |
| **`EDG-001`** | **Shelf Structural Sagging (Span Law)** | Wardrobe bay width $W = 1200\text{ mm}$ entered with standard $18\text{ mm}$ shelf without center support. | System dynamically enforces step rule: automatically injects vertical gable divider and splits into two $600\text{ mm}$ spans. | High |
| **`EDG-002`** | **Oversized Panel on Sheet Stock** | Cabinet gable height $H = 2500\text{ mm}$ entered when warehouse sheet stock is $2440 \times 1220\text{ mm}$. | Pre-nesting validator halts optimization immediately; flags `PART_EXCEEDS_SHEET_CAPACITY` with part code and dimensions. | Critical |
| **`EDG-003`** | **Blade Kerf Accumulation** | 10 parts packed along sheet width: $10 \times 240\text{ mm} = 2400\text{ mm}$ on $2440\text{ mm}$ board with $4\text{ mm}$ blade kerf. | Optimizer rejects layout because total length with kerf is $2400 + (9 \times 4) = 2436\text{ mm} + 20\text{ mm trim} = 2456\text{ mm} > 2440\text{ mm}$. | Critical |
| **`EDG-004`** | **Zero-Division in Pricing Engine** | Sales rep inputs $100\%$ discount code or formula evaluation with $\text{Discount} = 1.0$. | Formula engine caps discount at $50.0\%$; throws `InvalidDiscountValueException` if denominator $(1 - d) \le 0$. | Critical |
| **`EDG-005`** | **Concurrent Inventory Depletion** | 2 customers confirm orders simultaneously, each requesting 3 sheets of MDF when only 5 sheets remain. | Database row lock (`SELECT FOR UPDATE`) inside `prisma.$transaction`: Order 1 reserves 3 sheets; Order 2 halts with `INSUFFICIENT_STOCK`. | Critical |
| **`EDG-006`** | **Quote Acceptance at Expiration Second** | Customer clicks "Accept Quote" at 23:59:59 on Day 14 while expiration cron runs. | Database transaction locks quote record: whichever transaction commits first determines state; no double-state possible. | High |
| **`EDG-007`** | **Promotional Coupon Race Condition** | 2 users submit the final available coupon code ($99/100$ redeemed) at the exact same millisecond. | Atomic increment `UPDATE coupons SET redeemed = redeemed + 1 WHERE id = ... AND redeemed < max`: exactly 1 succeeds, 1 receives `CouponExhaustedException`. | High |
| **`EDG-008`** | **Edge-Band Over-Deduction** | Thin rail ($W = 30\text{ mm}$) configured with heavy $2\text{ mm}$ edge-banding on both sides. | Validator computes $\text{Raw } W = 30 - 4 = 26\text{ mm}$; verifies $\text{Raw } W \ge 20\text{ mm}$ minimum machine clamping threshold. | Medium |
| **`EDG-009`** | **Incompatible Hardware / Material Pairing** | Heavy high-gloss acrylic door ($H = 2400\text{ mm}$) configured with standard 2-hinge setup. | System compatibility matrix flags error: doors with $H > 2000\text{ mm}$ mandate $\ge 4$ heavy-duty hinges. | High |
| **`EDG-010`** | **Wood Grain Rotation Conflict** | Wood-grain panel oriented horizontally during nesting to save sheet space. | 2D nesting algorithm respects `GRAIN_ALONG_LENGTH` lock; verifies zero $90^\circ$ rotation for grained parts. | High |

---

### 10.2 Structured Error Handling & HTTP Status Code Matrix

| Error Code | HTTP Status | Triggering Condition | User-Facing Message (Bilingual) | Automated Recovery Action |
| :--- | :---: | :--- | :--- | :--- |
| **`ERR-VAL-001`** | `422 Unprocessable` | Input dimension outside product bounds ($W < W_{min}$ or $W > W_{max}$). | EN: "Dimension out of allowed range."<br>AR: "المقاس المدخل خارج الحدود الهندسية المسموحة." | UI resets input to nearest boundary; displays visual dimension tooltip. |
| **`ERR-PRC-002`** | `400 Bad Request` | Missing material unit cost or pricing formula parameter. | EN: "Price calculation requires manual quote."<br>AR: "يتطلب هذا التخصيص تسعيرة يدوية من فريق المبيعات." | System activates `REQUEST_A_QUOTE` workflow without invented pricing (`BR-PRICE-003`). |
| **`ERR-SEC-003`** | `403 Forbidden` | Storekeeper or unpermitted role attempts to call `POST /api/rates`. | EN: "Access denied: Unauthorized role."<br>AR: "تم رفض الوصول: صلاحيات غير كافية." | Request blocked at server middleware; security event appended to `AuditLog`. |
| **`ERR-LOG-004`** | `409 Conflict` | Logistics attempts dispatch manifest while Milestone 2 is unpaid. | EN: "Dispatch hold: Pre-dispatch payment pending."<br>AR: "إيقاف التسليم: بانتظار سداد دفعة ما قبل الشحن." | Manifest printing locked (`BR-ORD-005`); 1-click payment link sent via WhatsApp. |
| **`ERR-CNC-005`** | `422 Unprocessable` | Toolpath simulation detects spindle $Z$-depth $> \text{board thickness}$. | EN: "CAM Toolpath Error: Spindle bed collision hazard."<br>AR: "خطأ في مسار الأداة: خطر اصطدام رأس الحفر بسطح الآلة." | Export file marked `REJECTED_CAM_SIMULATION`; CAM specialist notified. |
| **`ERR-STK-006`** | `409 Conflict` | Free stock balance insufficient to fulfill production job reservation. | EN: "Material stockout: Insufficient raw sheets."<br>AR: "نفاد المخزون: عدد الألواح غير كافٍ لأمر الإنتاج." | Job status set to `MATERIAL_PENDING`; procurement alert dispatched. |
| **`ERR-TOK-007`** | `401 Unauthorized`| Customer portal link token expired ($> 14\text{ days}$) or HMAC signature tampered. | EN: "This quote link has expired or is invalid."<br>AR: "رابط عرض السعر منتهي الصلاحية أو غير صالح." | User prompted to enter Saudi mobile number to receive a fresh secure OTP link. |
| **`ERR-INS-008`** | `422 Unprocessable` | Installer attempts handover completion without customer signature. | EN: "Customer digital signature is mandatory."<br>AR: "التوقيع الرقمي للعميل إلزامي لإتمام التسليم." | Handover button disabled until signature canvas registers valid stroke data. |

---

### 10.3 Security & Saudi Regulatory Compliance Testing

| Test ID | Security Requirement | Test Procedure & Attack Vector | Acceptance Pass Criteria |
| :--- | :--- | :--- | :--- |
| **`SEC-VAL-001`** | **Saudi PDPL Shop-Floor PII Masking** | Inspect physical barcode labels, cutting travelers, and assembly sheets. | Zero customer names, phone numbers, or addresses printed. Scannable barcodes decode strictly to internal UUIDs (`BR-SEC-004`). |
| **`SEC-VAL-002`** | **Air-Gapped CNC Network Isolation** | Execute port scan (`nmap`) from public WAN against factory CNC machine IPs. | 100% of machine controllers report unreachable / filtered. Controller subnet accessible only via local bridge (`BR-CNC-004`). |
| **`SEC-VAL-003`** | **SMS OTP Rate-Limiting & Anti-Bot** | Script submits 10 quote requests in 60 seconds with burner phone numbers. | Cloudflare Turnstile blocks automated bot after 3 requests; SMS gateway rate-limits to 3 OTPs per 15 minutes (`BR-LOC-003`). |
| **`SEC-VAL-004`** | **HMAC-SHA256 Token Tampering** | Attacker modifies `quote_id` parameter inside signed customer portal URL. | Server cryptographic middleware rejects request with `401 Unauthorized`; token immediately revoked. |
| **`SEC-VAL-005`** | **Zero Saw Cuts Without Bank Deposit** | Dispatcher attempts to force `ProductionJob.status = READY_FOR_PRODUCTION` on an unpaid order. | Database constraint blocks transition; throws `UnfundedOrderException` (`BR-SEC-005`). |
| **`SEC-VAL-006`** | **Cross-Tenant Multi-Tenant Isolation** | Tenant A authenticated user executes `GET /api/orders/{tenant_b_order_id}`. | Prisma query middleware automatically injects `company_id = tenant_a_id`; query returns `404 Not Found`. |
| **`SEC-VAL-007`** | **Password Hashing & Session Security** | Inspect database `users` table; attempt to read session cookies in client JS. | Passwords hashed using bcrypt (cost $\ge 12$); cookies carry `HttpOnly`, `Secure`, `SameSite=Lax` flags. |

---

### 10.4 Strict Input & Mathematical Validation Specifications

| Validation ID | Field / Parameter | Validation Rule & Boundary | Enforcement Engine |
| :--- | :--- | :--- | :--- |
| **`VAL-001`** | **Parametric Dimensions** | $W, H, D$ integers in $mm$; must satisfy $W_{min} \le W \le W_{max}$, $H_{min} \le H \le H_{max}$, $D_{min} \le D \le D_{max}$. | Server-side Zod Schema (`safeParse`) |
| **`VAL-002`** | **Saudi Mobile Number** | Regex `^(?:\+966\|00966\|0)?5[0-9]{8}$`; normalizes to E.164 `+9665xxxxxxxx`. | Client + Server Zod Validator |
| **`VAL-003`** | **Financial Precision** | Exact decimal type `NUMERIC(12, 4)`. Floating-point calculations strictly banned. | Prisma ORM & `decimal.js` |
| **`VAL-004`** | **Saw Blade Kerf & Trim** | Blade kerf $3.2\text{ mm} \le K_{saw} \le 4.5\text{ mm}$; perimeter trim margin $T_{trim} \ge 10\text{ mm}$. | 2D Optimization Pre-Processor |
| **`VAL-005`** | **Panel Thickness** | Thickness must match active catalog boards: $8\text{ mm}, 16\text{ mm}, 18\text{ mm}, 25\text{ mm}$. | Database ForeignKey to `BoardSpecification` |
| **`VAL-006`** | **ZATCA VAT Rate** | Standard VAT fixed at exact $15.0000\%$. Applied strictly to net subtotal. | Financial Engine Tax Module |

---

### 10.5 Granular Role-to-Permission Validation Matrix

| Role Under Test | Tested Operation | API Endpoint / Action | Expected Result | Pass Criteria |
| :--- | :--- | :--- | :---: | :--- |
| **Storekeeper** | Attempt to modify board $\text{m}^2$ rate | `POST /api/rates` | `403 Forbidden` | Storekeeper is strictly excluded from rates (`rates.write`). |
| **Sales Rep** | Attempt to apply $12\%$ discount | `POST /api/quotes/{id}/discount` | `PENDING_APPROVAL` | Discounts $> 5\%$ mandate Sales Manager sign-off (`BR-PRICE-004`). |
| **Sales Manager** | Approve $12\%$ commercial discount | `POST /api/quotes/{id}/approve` | `200 OK -> ISSUED` | Sales Manager possesses `quotes.approve` authority up to $15\%$. |
| **Field Installer** | View assigned delivery routes & site specs | `GET /installer/jobs` | `200 OK` | Field Installer possesses `installation.read` authority. |
| **Field Installer** | Capture customer handover e-signature | `POST /installer/jobs/{id}/signoff`| `200 OK -> HANDOVER` | Field Installer possesses `handover.signoff` authority. |
| **Field Installer** | Attempt to delete a production job | `DELETE /api/production/{id}` | `403 Forbidden` | Field Installer has zero production job mutation permissions. |
| **Factory Operator** | Advance job from Cutting to Edge-Banding | `POST /api/production/{id}/stage` | `200 OK` | Operator possesses `production.update` permissions. |
| **Anonymous User** | Attempt direct query for unpublished products| `GET /api/products?status=DRAFT` | `404 Not Found` | Server query middleware filters unpublished items automatically. |

---

### 10.6 Transactional Notifications & Communication Gateway Verification

| Notification ID | Event Trigger | Communication Channel | Recipient & Payload | SLA / Delivery Requirement |
| :--- | :--- | :--- | :--- | :---: |
| **`NOTIF-001`** | Customer submits quote request | SMS (Saudi Telecom Gateway) | Customer: 4-digit numeric OTP with 3-minute TTL. | Delivered in $< 5\text{ seconds}$ |
| **`NOTIF-002`** | Configurator session abandoned 1 hour | WhatsApp Business API | Customer: Arabic message with 1-click restore link & opt-out. | Dispatched at $T + 60\text{ min}$ |
| **`NOTIF-003`** | Order QC passed; Milestone 2 unpaid | WhatsApp + SMS | Customer: Pre-dispatch due notice with secure mada/Apple Pay link. | Dispatched immediately upon QC pass |
| **`NOTIF-004`** | Material stock crosses reorder threshold | In-App Alert + Email | Storekeeper & Procurement: Low-stock SKU alert with restock link. | Triggered synchronously on stock issue |
| **`NOTIF-005`** | Station operator reports defect scrap | Real-Time Dashboard Toast | Production Manager: Part ID, reason code, and scrap sheet count. | Rendered in $< 1\text{ second}$ |
| **`NOTIF-006`** | Order status transitions to `DELIVERED` | SMS + Email | Customer: Verified review invitation token link. | Dispatched within 2 hours of delivery |

---

### 10.7 System Exceptions & Automated Failsafe Recovery Registry

| Exception Class | Triggering Root Cause | Automated System Failsafe Action | Recovery State |
| :--- | :--- | :--- | :--- |
| **`MissingMaterialRateException`** | A board or edging finish lacks an active approved rate card. | Engine aborts numeric calculation; returns flag `REQUIRES_MANUAL_QUOTE`. | UI renders "Request a Quote" without guessing price (`BR-PRICE-003`). |
| **`PartExceedsSheetCapacityException`** | Panel length/width exceeds usable dimensions of available board stock. | 2D nesting halts; system highlights oversized part in red on review screen. | Order flagged `ENGINEERING_REVIEW_REQUIRED`. |
| **`InsufficientAvailableStockException`** | Raw sheet inventory balance is less than required job reservation. | Reservation transaction rolls back; sets job status to `MATERIAL_PENDING`. | Procurement notified; job paused until PO receipt. |
| **`DispatchHoldException`** | Pre-dispatch balance (Milestone 2, e.g. 40%) is unpaid when truck is assigned. | Logistics interface blocks manifest printing and barcode scan. | Order locked under `DISPATCH_HOLD - DUE_PAYMENT` (`BR-ORD-005`). |
| **`MachineCAMIncompatibleException`** | Homag CNC export adapter fails post-processor simulation check. | CAM file marked `REJECTED`; system activates Tier 1 manual fallback. | Operators cut parts using printed paper travelers & barcodes (`BR-CNC-005`). |
| **`CouponExhaustedException`** | Promotional coupon redemption reaches maximum campaign limit. | Transaction rolls back coupon deduction; alerts user with localized notice. | User prompted to proceed without coupon. |
| **`SiteNotReadyException`** | Field installer arrives on-site and finds active wet masonry/construction. | Installer photographs site; logs `SITE_NOT_READY` with delay reason. | Order remains `READY_FOR_DELIVERY`; delivery rescheduled. |

---

## 11. Requirements Change Control

Any change to an approved requirement must be recorded before implementation.

### Change Record Structure:
- Change request ID and date.
- Requirement ID(s) affected.
- Description and business reason.
- Requested by and approved by.
- Impact on user workflow, data model, security, integrations, cost and schedule.
- Migration/backward-compatibility impact.
- Updated acceptance criteria and test cases.
- Decision: approved, rejected or deferred.

> [!IMPORTANT]
> Do not silently change released pricing rules, BOM formulas, cutting rules, approved quotations or production files. Use explicit revisions and preserve historical traceability.

---

## 12. Validation Sign-Off

Sign-off confirms that the stated scope, edge cases, error handling, security, validation rules, permissions, notifications, exceptions, and acceptance criteria have been reviewed and accepted.

| Role | Name | Decision | Signature / Reference | Date |
| :--- | :--- | :--- | :--- | :--- |
| **Business Owner** | | Pending | | |
| **Sales Representative** | | Pending | | |
| **Production Manager** | | Pending | | |
| **Store / Inventory Representative** | | Pending | | |
| **Field Installation & Logistics Lead** | | Pending | | |
| **Technical Lead** | | Pending | | |
| **CNC / Supplier Representative (when applicable)** | | Pending | | |

---

## Final Validation Rule

1. A requirement is ready for development only when its scope, rules, dependencies and acceptance criteria are sufficiently clear.
2. A feature is complete only when the acceptance criteria pass and evidence is recorded.
3. The first implementation priority remains the **Core Furniture Business Platform**. Machine-specific CNC integration, advanced AI/3D/AR and SaaS billing must proceed only after their documented dependencies and release gates are satisfied.
