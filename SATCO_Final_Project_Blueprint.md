# SATCO AI Smart Furniture Platform

## Final Project Blueprint & Development Master Plan

**Document type:** Product Vision + Technical Blueprint + Development
Roadmap\
**Project:** SATCO AI Smart Furniture Platform\
**Version:** 1.0\
**Status:** Ready for project initiation\
**Primary development approach:** Modular monolith first, extensible
integrations later\
**Planning baseline:** 36--38 weeks; actual delivery depends on team
size, hardware compatibility, and testing results.

------------------------------------------------------------------------

# 1. Executive Summary

SATCO AI Smart Furniture Platform is a unified digital platform for
furniture businesses and manufacturing operations. It connects
customer-facing product discovery and quotation workflows with internal
administration, factory operations, production data, and future machine
integration.

The platform is intended to support:

-   Customer website and product catalogue
-   Custom furniture configuration and quotation
-   Furniture Bill of Materials (BOM) and production parts
-   Factory inventory and production management
-   3D furniture configuration
-   AI-assisted room design
-   AR furniture preview on supported devices
-   CNC production data and file export
-   Multi-company SaaS subscriptions and billing

The platform must be developed incrementally. The first release should
deliver a reliable website, product catalogue, quotation/pricing
foundation, admin tools, and basic factory workflow. Advanced AI, 3D/AR,
CNC machine connectivity, and SaaS billing should be added only after
their dependencies and acceptance criteria are satisfied.

## Product principle

**One platform --- connected customer, business, and factory
operations.**

The platform must distinguish between: 1. Customer-facing visual
configuration. 2. Approved manufacturing specifications. 3.
Machine-specific production instructions.

A visual preview or AI-generated design must never be treated as
manufacturing-ready data until dimensions, materials, construction
rules, and production specifications have been validated and approved.

------------------------------------------------------------------------

# 2. Product Vision and Objectives

## 2.1 Vision

Build a modular, scalable furniture platform that helps furniture
companies manage the journey from product discovery and customer
quotation to approved production, factory tracking, and delivery.

## 2.2 Business objectives

-   Present products professionally through a responsive website.
-   Allow customers to request custom furniture quotations.
-   Standardize furniture specifications and production data.
-   Reduce manual duplication between sales, administration, and factory
    teams.
-   Track materials, production jobs, and work stages.
-   Provide reliable cutting lists and production-file export.
-   Offer 3D/AI/AR experiences as validated optional capabilities.
-   Support multiple independent furniture companies through a secure
    SaaS architecture in a later phase.

## 2.3 Target users

  -----------------------------------------------------------------------
  User                                Main responsibilities
  ----------------------------------- -----------------------------------
  Customer                            Browse products, configure
                                      dimensions/options, view previews,
                                      request quotations, track permitted
                                      order information

  Sales staff                         Manage customer enquiries, prepare
                                      quotations, follow up orders

  Admin                               Manage products, pricing rules,
                                      users, permissions, and business
                                      settings

  Production manager                  Approve specifications, create
                                      jobs, assign work, monitor
                                      production

  Store / inventory staff             Manage boards, hardware, stock
                                      movements, and material usage

  Factory operator                    View assigned work, update
                                      permitted production stages, scan
                                      part labels

  SaaS super admin                    Manage tenant companies, plans,
                                      platform-level settings, and
                                      subscription status
  -----------------------------------------------------------------------

Role permissions must be enforced by the backend, not merely by hiding
frontend controls.

------------------------------------------------------------------------

# 3. Product Scope and Release Strategy

## 3.1 Release 1 --- Core Furniture Business Platform

Build and validate the essential business workflow first:

1.  Responsive website and product catalogue.
2.  Product categories and product details.
3.  Custom furniture configuration.
4.  Material and hardware selection.
5.  Configurable quotation/pricing engine.
6.  Customer enquiry and quotation management.
7.  Admin authentication and role-based access.
8.  Basic factory production jobs.
9.  Material inventory and stock movements.
10. Production status tracking and reports.

**Release 1 outcome:** SATCO can manage product information, customer
quotation requests, approved specifications, and basic factory
operations without requiring CNC direct communication.

## 3.2 Release 2 --- Manufacturing Data and CNC Preparation

1.  Furniture BOM.
2.  Furniture parts generator.
3.  Panel and board calculation.
4.  Cutting list.
5.  Cutting optimization.
6.  Edge-banding specifications.
7.  Barcode/QR labels.
8.  Production file export framework.
9.  Manual machine-software import workflow.
10. Production file history and approval.

**Release 2 outcome:** SATCO generates validated production data and
files that staff can review and import through the machine's supported
software.

## 3.3 Release 3 --- 3D, AI and AR

1.  3D furniture viewer and configurator.
2.  Approved dimension and option constraints.
3.  AI-assisted room design suggestions.
4.  Room measurement confirmation.
5.  3D room layout.
6.  AR preview on supported devices.
7.  3D fallback for unsupported devices.

**Release 3 outcome:** Customers can explore furniture visually and
request quotations from saved configurations. Visual/AI output remains
separate from approved manufacturing specifications.

## 3.4 Release 4 --- Machine Bridge and SaaS

1.  Factory PC Bridge, where supported.
2.  Machine-specific adapter after compatibility verification.
3.  Job status exchange where the machine software supports it.
4.  Multi-tenant company architecture.
5.  Subscription plans and feature limits.
6.  Payment-provider abstraction.
7.  SaaS super-admin dashboard.

**Release 4 outcome:** Verified factory workflows and multi-company SaaS
capabilities.

------------------------------------------------------------------------

# 4. Functional Module Specifications

## 4.1 Customer Website and Product Catalogue

Features: - Responsive homepage. - Product categories and product
listing. - Product detail pages, images, descriptions, dimensions,
options. - Search, filtering, and sorting. - Contact and enquiry
forms. - English and Arabic interface. - Arabic RTL and English LTR
layout support. - SEO-friendly product pages. - Admin-managed product
content.

Acceptance criteria: - Admin can create, edit, publish, and archive
products. - Customer can browse categories and product details on
desktop and mobile. - Language switching works without layout
breakage. - Unpublished products are not exposed publicly.

## 4.2 Custom Furniture Calculator and Pricing Engine

Inputs may include: - Furniture type and approved model. - Width,
height, depth, and quantity. - Board type, thickness, colour, and
finish. - Edge-banding options. - Hardware options. - Accessories and
additional services.

Pricing components: - Board/material cost. - Hardware cost. -
Edge-banding cost. - Labour cost. - Approved wastage allowance. - Other
configurable charges. - Tax, discount, and margin rules where
applicable.

Rules: - Do not calculate a final furniture price using only width ×
height × depth. - Use product-specific formulas, approved BOM rules,
material rates, and configurable pricing rules. - Validate dimensions
against product constraints. - If required specifications or rates are
missing, return **Request a Quote** rather than inventing a price. -
Store the pricing-rule version used for each quotation so historical
quotations remain explainable.

Acceptance criteria: - Same inputs and same pricing-rule version produce
a reproducible result. - Invalid dimensions and missing rates are
reported clearly. - Unit tests cover pricing calculations and edge
cases. - Admin changes to current rates do not silently rewrite
previously approved quotations.

## 4.3 Admin and Business Management

Features: - Secure login and session management. - Dashboard and
operational summaries. - User and role management. - Product and
category management. - Material and hardware catalogue. - Pricing rules
and rate management. - Customer and enquiry management. - Quotation
review, revision, approval, and expiry. - Order conversion from approved
quotation. - Audit log for important changes.

Suggested roles: - Super Admin - Company Admin - Sales - Production
Manager - Inventory/Store - Factory Operator - Read-only Report User

Use permission-based authorization. Define permissions such as
`products.read`, `products.write`, `quotes.approve`,
`production.assign`, `inventory.adjust`, and `reports.view`.

## 4.4 Factory and Production Management

Core workflow: 1. Approved customer order. 2. Production specification
review. 3. BOM and parts preparation. 4. Material availability check. 5.
Production job creation. 6. Work assignment. 7. Cutting. 8. Edge
banding. 9. Drilling/machining where applicable. 10. Assembly. 11.
Quality inspection. 12. Packing and dispatch. 13. Completion.

Production status should be configurable, but the initial statuses can
include: - Draft - Pending Approval - Approved - Material Pending -
Ready for Production - Cutting - Edge Banding - Machining - Assembly -
Quality Check - Completed - On Hold - Cancelled

Record who changed a status, when it changed, and any note or reason.

## 4.5 Inventory and Material Tracking

Features: - Material catalogue: board, edging, hardware, accessories,
consumables. - Units of measure. - Warehouse/location support as
needed. - Opening stock. - Goods received. - Material issue to
production. - Material return. - Stock adjustment with reason and
permission. - Reorder/low-stock threshold. - Stock movement history. -
Material reservation for approved production jobs.

Do not update stock by directly overwriting a quantity without recording
a stock movement. Use auditable inventory transactions.

## 4.6 Furniture BOM and Parts Generator

Purpose: transform an approved furniture specification into a structured
manufacturing definition.

Each part may contain: - Part code and part name. - Parent
product/order/job reference. - Quantity. - Length and width. -
Thickness. - Material/board type. - Grain direction where applicable. -
Finished dimensions and raw dimensions, where the production rules
define both. - Edge-banding sides and material. - Machining/operation
references, if supported by the validated product definition. - Revision
and approval state.

Important: - Part formulas must be product-specific and
version-controlled. - Do not assume every cabinet, wardrobe, or
furniture design uses the same construction rules. - Require review and
approval before production release. - Keep the customer-facing 3D model
separate from the manufacturing BOM.

Acceptance criteria: - An approved test product generates the expected
parts and quantities. - Dimensions, thickness, material, and edge data
are validated. - Changes to a product design create a new revision
rather than silently changing released jobs.

## 4.7 Panel Calculation, Cutting List and Optimization

Features: - Group parts by board material and thickness. - Generate
cutting lists. - Record board dimensions and usable dimensions. -
Include saw kerf, trimming allowance, grain direction, and rotation
restrictions when configured. - Support offcut/remnant recording. -
Provide estimated board usage and waste percentage. - Allow an
authorized user to review and approve the cutting plan.

Optimization must be treated as a recommendation until validated. The
system must not claim an optimized plan is machine-ready unless all
relevant constraints and output have been verified.

Acceptance criteria: - Test cases compare expected part fit and board
usage. - No part exceeds usable board dimensions. - Kerf and trim
allowances are applied according to configured rules. - Unplaced parts
and invalid constraints are reported.

## 4.8 Edge Banding and Barcode/QR

Edge-banding data: - Part reference. - Which edges require banding. -
Band material, colour, and thickness. - Quantity/length estimate, where
supported. - Work status.

Barcode/QR: - Generate a unique identifier for each production part or
label unit. - Label may show job number, part code, dimensions,
material, and next work stage. - Barcode/QR should reference a secure
internal record; do not expose sensitive customer information in the
encoded value. - Scanning must respect user permissions.

## 4.9 CNC Integration --- Three-Stage Strategy

### Stage 1 --- Production Data Generator

Build first: - Furniture BOM. - Parts list. - Board size and material
information. - Cutting list. - Edge-banding details. - Barcode/QR
labels. - Production job data. - Validation and approval.

This stage is machine-independent and delivers value even before direct
machine integration.

### Stage 2 --- CNC File Integration

Create an export framework with adapters for verified formats such as
DXF, MPR, XML, or other formats supported by the actual machine
software.

Do not assume a format is compatible merely because a machine vendor or
another machine uses it. Verify: - Machine brand and exact model. -
Controller brand/model/version. - Machine software/CAM software and
version. - Supported import/export formats. - Required post-processor. -
Tooling, units, origin, axes, and operation conventions. - Vendor
documentation and sample files. - Safe test procedure.

Every adapter must have: - Format/version identification. - Input
validation. - Export validation. - Test fixtures/sample files. - Error
reporting. - Version history. - Human approval before production use.

### Stage 3 --- Direct Machine Workflow

Only after compatibility is verified: - Use a controlled Factory PC
Bridge. - Transfer approved files to the factory machine software
through a supported local workflow. - Receive job status only where the
machine software exposes a documented and permitted method. - Update
SATCO production status with traceable events. - Retain manual
import/export as a fallback.

Security requirements: - Never expose a CNC controller directly to the
public internet. - Do not bypass machine safety interlocks or vendor
controls. - Restrict bridge access to authorized factory PCs and
users. - Use authenticated, encrypted communication where supported. -
Log file transfer, approval, import, errors, and completion events. -
Require operator confirmation before a job is released to the machine.

**CNC compatibility is an open dependency.** Before implementing a
machine-specific adapter, collect the actual machine/controller/software
details and verify them with the supplier or manufacturer.

## 4.10 3D Furniture Configurator

Suggested technology: - Three.js - React Three Fiber - GLB/glTF assets

Features: - Load approved furniture models. - Camera orbit/zoom
controls. - Dimension changes within approved limits. - Material,
colour, and finish preview. - Save a configuration. - Connect
configuration to quotation.

Acceptance criteria: - Model dimensions correspond to the selected
configuration within defined tolerances. - Unsupported dimensions are
blocked. - 3D preview does not claim to be a production drawing. -
Performance is tested on supported mobile and desktop devices.

## 4.11 AI Room Design

Features: - Room photo upload. - Room type and style selection. -
User-entered room measurements. - AI-generated visual suggestions. -
SATCO product matching. - Save design and request quotation. - Provider
abstraction to allow future AI provider changes.

Rules: - Treat AI output as a suggestion, not a verified measurement. -
Ask the customer to confirm room dimensions. - Clearly label
generated/estimated elements. - Do not automatically create a production
job from an AI image. - Validate selected product configuration through
the standard calculator and approval workflow.

## 4.12 AR Furniture Preview

Features: - Compatibility detection. - Supported-device AR preview. -
Place, move, and rotate furniture where platform support permits. -
Preview selected materials/colours. - Return selected configuration to
the website. - 3D viewer fallback for unsupported devices.

Acceptance criteria: - Permission and compatibility errors are
handled. - Unsupported devices receive a usable 3D fallback. - AR scale
is based on validated model dimensions. - AR placement does not itself
approve a manufacturing specification.

## 4.13 Multi-Tenant SaaS and Billing

Build after the core single-company workflow is stable.

Features: - Company registration and onboarding. - Tenant-specific
users, products, customers, materials, orders, and settings. - Company
branding. - Starter, Professional, and Enterprise plans. - Feature
limits and usage tracking. - Subscription lifecycle: trial/active/past
due/cancelled/suspended as required. - Payment provider abstraction. -
SaaS super-admin dashboard.

Security requirements: - Every tenant-owned record must be scoped to a
tenant. - Enforce tenant authorization on the server for every
read/write operation. - Add automated cross-tenant access tests. - Never
trust a tenant ID supplied by an untrusted client without verifying
membership and permission. - Verify payment status server-side using
provider-signed events/webhooks. - Keep platform-level administration
separate from tenant administration.

------------------------------------------------------------------------

# 5. Recommended Technology Architecture

## 5.1 Initial technology stack

  -----------------------------------------------------------------------
  Layer                               Recommended technology
  ----------------------------------- -----------------------------------
  Frontend and application            Next.js + TypeScript

  UI styling                          Tailwind CSS

  Database                            PostgreSQL

  ORM and migrations                  Prisma

  Authentication                      Secure, well-maintained
                                      authentication solution compatible
                                      with Next.js

  API                                 Next.js server-side modules/API
                                      routes initially

  3D                                  Three.js + React Three Fiber

  AR                                  Browser/device-compatible AR
                                      approach with 3D fallback

  AI                                  Provider abstraction over selected
                                      AI APIs

  CNC                                 Machine-independent export adapters

  Factory bridge                      Local controlled service,
                                      introduced only after verification

  File storage                        S3-compatible object storage or
                                      equivalent

  Background jobs                     Queue/worker solution when
                                      asynchronous tasks require it

  Version control                     Git + GitHub

  Development assistant               Cursor AI
  -----------------------------------------------------------------------

## 5.2 Architecture approach

Start with a **modular monolith**, not many independently deployed
microservices.

Suggested application modules: - `identity` - `companies` - `catalog` -
`customers` - `configurator` - `pricing` - `quotations` - `orders` -
`materials` - `inventory` - `production` - `bom` - `cutting` -
`edge-banding` - `barcodes` - `cnc` - `design-3d` - `ai-room-design` -
`ar-preview` - `subscriptions` - `billing` - `reports` - `audit`

Each module should have clear boundaries and should not directly
manipulate another module's internal data without a defined service/API
contract.

## 5.3 High-level architecture

``` text
Customer Website       Admin / Factory Dashboard       SaaS Admin
        |                         |                         |
        +-------------------------+-------------------------+
                                  |
                         Next.js Application
                                  |
                    Authentication + Authorization
                                  |
                         Modular Business Layer
                                  |
  -------------------------------------------------------------------
  Catalog | Pricing | Quotes | Orders | Inventory | Production | BOM
  Cutting | Edge Banding | CNC Export | 3D | AI | AR | SaaS | Reports
  -------------------------------------------------------------------
                                  |
                  PostgreSQL + Prisma + File Storage
                                  |
                 Background Jobs / Audit / Notifications
                                  |
                    Controlled Factory PC Bridge
                                  |
                Vendor Machine Software (verified workflow)
```

## 5.4 Repository structure (suggested)

``` text
satco-platform/
├── app/
│   ├── (website)/
│   ├── (auth)/
│   ├── admin/
│   ├── factory/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── modules/
│   ├── catalog/
│   ├── customers/
│   ├── configurator/
│   ├── pricing/
│   ├── quotations/
│   ├── orders/
│   ├── inventory/
│   ├── production/
│   ├── bom/
│   ├── cutting/
│   ├── cnc/
│   ├── design3d/
│   ├── ai-room-design/
│   └── saas/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── permissions/
│   ├── validation/
│   └── storage/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── tests/
├── docs/
│   ├── requirements/
│   ├── architecture/
│   ├── decisions/
│   └── cnc-compatibility/
├── .env.example
├── README.md
└── package.json
```

This is a suggested structure, not a requirement to create every folder
on Day 1. Keep the structure consistent with the actual framework setup.

------------------------------------------------------------------------

# 6. Core Data Model --- Initial Entity Map

The following is a conceptual starting point. Final fields, relations,
indexes, and constraints must be designed during implementation and
reviewed against actual workflows.

  -----------------------------------------------------------------------
  Domain                              Core entities
  ----------------------------------- -----------------------------------
  Identity                            User, Role, Permission, UserRole,
                                      Session

  Company/SaaS                        Company, CompanyMember,
                                      Subscription, Plan, UsageRecord

  Catalogue                           Category, Product, ProductVariant,
                                      ProductImage, ProductSpecification

  Configuration                       FurnitureConfiguration,
                                      ConfigurationOption, DimensionRule

  Pricing                             MaterialRate, HardwareRate,
                                      LabourRate, PricingRule,
                                      PricingRuleVersion

  Customer & sales                    Customer, Enquiry, Quotation,
                                      QuotationItem, Order, OrderItem

  Materials                           Material, BoardSpecification,
                                      HardwareItem, EdgeBandMaterial

  Inventory                           Warehouse, StockBalance,
                                      StockMovement, MaterialReservation

  Production                          ProductionJob, ProductionOperation,
                                      WorkAssignment, ProductionEvent

  Manufacturing                       BOM, BOMRevision, Part,
                                      PartOperation,
                                      EdgeBandingSpecification

  Cutting                             CuttingPlan, CuttingPlanItem,
                                      Board, Offcut

  CNC                                 Machine, Controller,
                                      MachineSoftware, CNCAdapter,
                                      ExportFile, ExportHistory,
                                      MachineJobEvent

  Labels                              PartLabel, BarcodeRecord, ScanEvent

  Design                              FurnitureModel3D, SavedDesign,
                                      RoomDesign, ARSession

  Platform                            FileAsset, Notification, AuditLog,
                                      SystemSetting
  -----------------------------------------------------------------------

## 6.1 Important data rules

-   Use stable IDs and appropriate unique constraints.
-   Store timestamps consistently.
-   Store money using exact decimal types, not floating-point
    arithmetic.
-   Store dimensions with an explicit unit and normalize internal
    calculations.
-   Keep revision/version history for quotations, pricing rules, BOMs,
    and production files.
-   Use soft deletion only where business/legal requirements justify it;
    do not hide required audit history.
-   Use database transactions for workflows that update multiple related
    records.
-   Define tenant ownership before enabling SaaS.

## 6.2 Critical relationships

``` text
Customer
  └── Enquiry
       └── Quotation
            └── Approved Order
                 └── Production Job
                      ├── BOM Revision
                      │    └── Parts
                      ├── Material Reservations
                      ├── Cutting Plan
                      ├── CNC Export Files
                      └── Production Events
```

A production job must be traceable to its approved order and the exact
approved product specification/BOM revision used to create it.

------------------------------------------------------------------------

# 7. Security, Reliability and Quality Requirements

## 7.1 Security baseline

-   Validate all inputs on the server.
-   Apply authentication and permission checks to every protected
    operation.
-   Protect against SQL injection, XSS, CSRF where applicable, insecure
    direct object references, and file-upload abuse.
-   Store secrets only in environment variables or a managed secret
    store.
-   Do not commit `.env` files or API keys.
-   Restrict uploaded file types, sizes, and access.
-   Use secure session and cookie settings.
-   Rate-limit sensitive public endpoints.
-   Maintain audit logs for approvals, price changes, stock adjustments,
    exports, and role changes.
-   Back up the database and test restoration.
-   Apply dependency updates and security checks.

## 7.2 Reliability

-   Use database migrations with review and rollback planning.
-   Add structured application logs.
-   Provide clear error messages without exposing secrets.
-   Monitor background jobs and failed tasks.
-   Keep generated files and their metadata traceable.
-   Define backup retention and recovery objectives before production
    launch.

## 7.3 Testing strategy

-   Unit tests: pricing, dimensions, BOM formulas, material
    calculations.
-   Integration tests: database workflows, quotation-to-order, inventory
    movements.
-   Permission tests: role access and tenant isolation.
-   UI tests: core customer and admin journeys.
-   File tests: export schema, dimensions, units, and sample files.
-   User acceptance tests: real sales and factory workflows.
-   Regression tests before each release.

------------------------------------------------------------------------

# 8. Development Roadmap --- 36 to 38 Weeks

Planning assumption: six working days per week, approximately eight
hours per day. This is a planning baseline, not a guaranteed delivery
commitment. A solo developer may need more time, especially for 3D/AR,
CNC compatibility, and SaaS security.

  ------------------------------------------------------------------------------
  Weeks             Phase             Main work            Deliverable
  ----------------- ----------------- -------------------- ---------------------
  1--4              Foundation and    Requirements,        Website foundation
                    website           repository,          
                                      database,            
                                      authentication       
                                      foundation,          
                                      responsive website,  
                                      catalogue,           
                                      English/Arabic and   
                                      RTL/LTR              

  5--8              Configurator and  Furniture types,     Working quotation
                    pricing           dimensions,          system
                                      materials, edge      
                                      banding, pricing     
                                      rules, quote request 

  9--12             Admin and factory Admin, users/roles,  Core business
                    core              products, materials, workflow
                                      quotes, orders,      
                                      production jobs,     
                                      stock, reports       

  13--16            3D configurator   Three.js setup,      3D preview
                                      model pipeline,      
                                      product models,      
                                      dimension/material   
                                      options, save        
                                      configuration        

  17--20            AI room design    Image upload, room   AI room design
                                      inputs, AI           
                                      suggestions, product 
                                      matching, save       
                                      design, quote        
                                      connection           

  21--24            AR preview        Compatibility        Supported-device AR
                                      research, model      preview
                                      preparation,         
                                      placement, controls, 
                                      fallback, testing    

  25                CNC discovery     Identify machine,    CNC compatibility
                                      controller,          specification
                                      software, formats,   
                                      vendor documentation 
                                      and test plan        

  26                Production data   BOM, parts           Machine-independent
                    generator         generator, panel     production data
                                      dimensions, cutting  
                                      list, validation     

  27                Cutting and       Cutting plan,        Reviewed production
                    export            optimization rules,  files
                                      edge data, barcode,  
                                      verified export      
                                      framework            

  28                Production        Approval, manual     Safe CNC-ready
                    workflow          import workflow, job workflow
                                      status, material     
                                      usage, history       

  29--32            SaaS foundation   Tenant model,        Multi-company SaaS
                                      company onboarding,  
                                      roles, isolation     
                                      tests, plans,        
                                      billing abstraction  

  33--36            Integration and   End-to-end tests,    Release candidate and
                    launch            security,            launch
                                      performance, backup, 
                                      UAT, documentation,  
                                      deployment           

  37--38            Contingency       CNC vendor delays,   Stabilized release
                                      AR/device issues,    
                                      critical fixes,      
                                      training and rollout 
                                      buffer               
  ------------------------------------------------------------------------------

## 8.1 CNC schedule decision

The CNC work is deliberately split into: - Week 25: identify and verify
the machine environment. - Week 26: create production data. - Week 27:
cutting plan and verified export framework. - Week 28: approval and safe
machine-software workflow.

If the machine's controller/software is not confirmed, complete the
manual file export/import workflow first. Move direct integration to a
later milestone rather than delaying the entire platform.

------------------------------------------------------------------------

# 9. First 10 Working Days --- Project Kickoff

## Day 1 --- Requirements baseline

-   Confirm business goals and initial release scope.
-   Identify actual users and roles.
-   Write primary customer and factory workflows.
-   Create `docs/requirements/PROJECT_SCOPE.md`.

## Day 2 --- Workflow and screen inventory

-   List website pages.
-   List admin screens.
-   List factory screens.
-   Draw quotation-to-production workflow.
-   Create a prioritized backlog.

## Day 3 --- Repository and development environment

-   Create Git repository.
-   Initialize Next.js and TypeScript.
-   Configure linting, formatting, and environment files.
-   Add README and setup instructions.

## Day 4 --- Database foundation

-   Configure PostgreSQL and Prisma.
-   Design initial User, Role, Product, Category, Customer entities.
-   Create and test first migration.

## Day 5 --- Authentication and authorization foundation

-   Implement secure sign-in.
-   Define role and permission strategy.
-   Protect a sample admin route.
-   Add authorization tests.

## Day 6 --- UI foundation

-   Set up Tailwind and reusable components.
-   Create layout, navigation, responsive shell.
-   Define typography, spacing, and design tokens.

## Day 7 --- Product catalogue backend

-   Implement category and product CRUD.
-   Add validation and server-side permission checks.
-   Add test data/seed strategy.

## Day 8 --- Product catalogue frontend

-   Build product listing and details.
-   Add loading, empty, and error states.
-   Test responsive layouts.

## Day 9 --- Language foundation

-   Add English/Arabic translations.
-   Implement RTL/LTR direction handling.
-   Test navigation, forms, and tables in both directions.

## Day 10 --- Review and checkpoint

-   Run tests and fix critical issues.
-   Review database migrations and authorization.
-   Demonstrate the first working workflow.
-   Update README, backlog, and project status.
-   Do not start the next phase until the foundation is reproducible.

------------------------------------------------------------------------

# 10. Project Documentation to Maintain

Create and maintain these files in the repository:

``` text
docs/
├── PROJECT_BLUEPRINT.md
├── requirements/
│   ├── PROJECT_SCOPE.md
│   ├── USER_ROLES.md
│   └── ACCEPTANCE_CRITERIA.md
├── architecture/
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATABASE_DESIGN.md
│   └── MODULE_BOUNDARIES.md
├── decisions/
│   └── ARCHITECTURE_DECISIONS.md
├── manufacturing/
│   ├── BOM_RULES.md
│   ├── CUTTING_RULES.md
│   └── EDGE_BANDING_RULES.md
└── cnc-compatibility/
    ├── MACHINE_INFORMATION.md
    ├── CONTROLLER_INFORMATION.md
    ├── SOFTWARE_AND_FORMATS.md
    └── TEST_PLAN.md
```

Record important technical decisions, assumptions, unresolved questions,
and changes. Do not rely on chat history as the only project
documentation.

------------------------------------------------------------------------

# 11. Cursor AI Agent --- Master Project Prompt

Copy this prompt into Cursor after creating the project repository:

``` text
You are the senior software architect and implementation engineer for
SATCO AI Smart Furniture Platform.

PROJECT GOAL
Build a modular, production-quality furniture business and manufacturing
platform. The platform will eventually include customer website, product
catalogue, custom furniture calculator, quotation, admin, factory management,
inventory, BOM, cutting lists, CNC file export, 3D configurator, AI room design,
AR preview, and multi-tenant SaaS.

INITIAL TECHNOLOGY
- Next.js
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Three.js / React Three Fiber in the later 3D phase
- Automated tests
- Git-based version control

ARCHITECTURE RULES
1. Start with a modular monolith.
2. Keep modules separated by clear domain boundaries.
3. Use server-side validation and authorization.
4. Use database migrations; never make undocumented production schema changes.
5. Use exact decimal types for money.
6. Store dimension units explicitly and normalize calculations.
7. Maintain audit history for important business operations.
8. Keep secrets out of source control.
9. Add tests for important business rules.
10. Do not build all future modules at once.

DEVELOPMENT RULES
- Work in small, reviewable milestones.
- Before coding, inspect the existing repository and report its current structure.
- Do not overwrite working code without explaining the reason.
- Do not invent business rules, furniture construction formulas, prices,
  machine capabilities, or hardware compatibility.
- If required information is missing, document the assumption or ask for
  the specific missing information.
- Provide a short implementation plan before a major change.
- After implementation, run relevant tests and report actual results.
- Keep README and technical documentation updated.
- Do not claim a feature is complete unless its acceptance criteria pass.

PRODUCT AND MANUFACTURING RULES
- Customer visual configuration is not automatically a manufacturing specification.
- AI room design is advisory and must not create production-ready dimensions.
- 3D/AR models must use validated dimensions.
- Pricing must use approved product rules and current rate versions.
- Production jobs must reference approved orders and specification revisions.
- BOM and part generation must use product-specific, version-controlled rules.
- Cutting plans must account for configured board constraints, kerf, trimming,
  grain direction, and rotation restrictions where applicable.
- Require authorized human approval before releasing production files.

CNC RULES
- First implement machine-independent production data generation.
- Do not assume a CNC brand, controller, protocol, or file format.
- Do not generate machine-specific commands until the actual machine and
  software compatibility have been verified.
- Design an adapter framework for verified formats such as DXF, MPR, XML,
  or other vendor-supported formats.
- Keep manual export/import available as a fallback.
- A controlled Factory PC Bridge may be added only after compatibility and
  security requirements are documented.
- Never expose a machine controller directly to the public internet.
- Never bypass vendor safety controls or machine interlocks.

SAAS RULES
- Build and validate the single-company core workflow first.
- Add multi-tenancy only in the planned SaaS phase.
- Enforce tenant isolation on the server for every tenant-owned record.
- Add automated tests proving that one tenant cannot access another tenant's data.
- Verify payment events on the server.

FIRST TASK
Do not attempt to build the entire platform in one operation.

Start by:
1. Inspecting the repository and existing code.
2. Summarizing the current state.
3. Proposing the initial folder/module structure.
4. Listing missing business decisions and assumptions.
5. Creating a prioritized implementation plan for the first 10 working days.
6. Implementing only the approved project foundation after the plan is reviewed.

The first milestone is a working project foundation with database setup,
initial authentication/authorization structure, responsive application shell,
and product catalogue foundation.

At the end of each task, report:
- Files created or changed.
- Database changes.
- Tests executed and their actual results.
- Known limitations.
- Recommended next task.
```

------------------------------------------------------------------------

# 12. Definition of Done --- Release Gate

A module is not complete merely because its screens exist.

  -----------------------------------------------------------------------
  Module                              Completion evidence
  ----------------------------------- -----------------------------------
  Website                             Customer can browse published
                                      products and submit an enquiry

  Calculator                          Validated configuration produces a
                                      reproducible estimate or Request a
                                      Quote

  Quotation                           Staff can review, revise, approve,
                                      and trace quotation versions

  Admin                               Permissions are enforced on the
                                      server

  Inventory                           Receipts, issues, returns, and
                                      adjustments create stock movement
                                      history

  Production                          Approved order can become a
                                      traceable production job

  BOM                                 Approved product revision generates
                                      validated parts

  Cutting                             Cutting plan validates board
                                      constraints and reports unplaced
                                      parts

  CNC export                          Export file passes format-specific
                                      validation and human review

  Factory workflow                    Authorized staff can import/use the
                                      approved file and record outcomes

  3D                                  Validated product configuration
                                      displays correctly within allowed
                                      dimensions

  AI                                  Suggestions are saved and clearly
                                      distinguished from verified
                                      measurements

  AR                                  Supported devices work and
                                      unsupported devices receive a 3D
                                      fallback

  SaaS                                Automated tests prove tenant data
                                      isolation

  Billing                             Subscription lifecycle and
                                      server-side payment verification
                                      pass tests
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 13. Decisions Required Before Relevant Modules

Do not block the initial website foundation on every future decision.
Resolve each item before its dependent module begins.

  -----------------------------------------------------------------------
  Decision                            Needed before
  ----------------------------------- -----------------------------------
  SATCO brand assets, logo, colours,  Website design
  content                             

  Supported languages and translation Website release
  review                              

  Product types and dimension         Calculator
  constraints                         

  Board, hardware, edging catalogue   Pricing and inventory
  and rates                           

  Furniture construction formulas and BOM and parts generator
  approved drawings                   

  Board sizes, kerf, trim, grain and  Cutting optimization
  rotation rules                      

  Actual CNC                          CNC adapter
  brand/model/controller/software and 
  vendor formats                      

  3D model assets and dimensional     3D configurator
  validation                          

  AI provider, data/privacy policy,   AI room design
  usage budget                        

  Target mobile devices and AR        AR
  requirements                        

  Tenant plans, payment provider,     SaaS billing
  legal/business rules                
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 14. Immediate Project Start Checklist

-   [ ] Confirm this blueprint as the project baseline.
-   [ ] Create a private GitHub repository named `satco-platform` (or
    the approved project name).
-   [ ] Open the repository in Cursor.
-   [ ] Add this document as `docs/PROJECT_BLUEPRINT.md`.
-   [ ] Create a separate `README.md` with local setup instructions.
-   [ ] Confirm the initial development environment and PostgreSQL
    availability.
-   [ ] Start with the first 10 working days only.
-   [ ] Review each Cursor plan before allowing large code changes.
-   [ ] Keep all business rules and decisions documented.
-   [ ] Do not start machine-specific CNC communication before
    compatibility verification.

## Final Recommendation

Start with the **Core Furniture Business Platform**: website, catalogue,
calculator, quotation, admin, inventory, and basic production
management. This creates a usable business system and the trusted data
foundation required by every advanced module.

The first CNC deliverable should be the **Production Data
Generator**---BOM, parts list, cutting list, edge-banding details, and
barcode labels. Machine-specific export and direct integration come
later, after the actual Homag Industrial CNC machine, controller, and software
have been verified.

**Project success means validated end-to-end workflows, not simply
completed code or screens.**
