# ADR-001: Database Schema Reconciliation (`Database.md` ↔ `prisma/schema.prisma`)

**Status:** Accepted  
**Date:** 2026-11-26  
**Owners:** Backend / DBA / Architect

---

## 1. Context
`Database.md` defined a 25-entity conceptual/SQL blueprint (`customers`, `products`, `quotations`, `milestone_payments`, `production_jobs`, `bom_revisions`, `stock_movements`, `audit_logs`, `warranty_claims`, etc.), whereas the initial `prisma/schema.prisma` implemented a cart-first 25-model schema (`User` + `CustomerProfile`, `ProductTemplate`, `Cart`, `Order`, `BOMItem`, `CuttingJob`, `CNCMachineJob`, `Invoice`, `PaymentTransaction`, `InstallationJob`).

To eliminate schema drift while preserving existing code (`src/modules/pricing/pricing.service.ts`), this ADR defines the canonical naming, model mapping, and migration plan.

---

## 2. Canonical Naming & Precision Rules
1. **Prisma Models & Fields:** `PascalCase` models, `camelCase` fields mapped via `@map("snake_case")` to `snake_case_plural` PostgreSQL tables.
2. **Financial Fields:** Always suffixed `*Sar` with `@db.Decimal(12, 4)` (or `(8, 4)` for unit/fee rates). Zero floating-point math.
3. **Dimension Fields:** Always suffixed `*Mm` as `Int` (or `Decimal` for cut/thickness precision).
4. **Timestamps:** Always `@db.Timestamptz(6)` (UTC storage, `Asia/Riyadh` presentation).
5. **Primary Keys:** UUID (`@id @default(uuid()) @db.Uuid`).

---

## 3. Conceptual-to-Implemented Model Mapping

| Target Spec (`Database.md` / `PRD.md`) | Implemented Prisma Model(s) (`prisma/schema.prisma`) | Reconciliation Decision |
| :--- | :--- | :--- |
| `customers` | `User` (`role = CUSTOMER`) + `CustomerProfile` | **Keep split.** `User` holds auth/phone/role; `CustomerProfile` holds `riskScore`, `nationalIdOrIqamaMasked`, `totalOrdersCount`, `totalSpentSar`. |
| `products`, `product_variants` | `Category` + `ProductTemplate` + `TemplateHardwareMap` | **Keep template pattern.** Parametric furniture uses `ProductTemplate` (`min/max/default` W/H/D + `parametricRules` JSON). |
| `materials`, `board_specifications` | `MaterialSheet` + `HardwareItem` + `EdgeBanding` | **Keep typed tables.** Enforces `BR-MAT-001` / `BR-RTE-001` separation from `PricingRule`. `MaterialSheet.inStockSheets` is a derived cache; `StockBalance` + `StockMovement` is authoritative. |
| `pricing_rule_versions` | `PricingRule` | **Keep `PricingRule`.** Append-only versioned rate cards (`effectiveFrom`/`effectiveTo`). |
| `enquiries` | `Enquiry` | **Added to `prisma/schema.prisma`** (`FR-ENQ-001/002`). |
| `quotations`, `quotation_items` | `Quotation` + `QuotationItem` | **Added to `prisma/schema.prisma`** (`FR-QTE-001`), linked optionally to `Order.quotationId`. |
| `milestone_payments` | `MilestonePayment` + `PaymentTransaction` | **Added `MilestonePayment`** for due dates, percentages, and overdue aging (`Due Manager`); `PaymentTransaction` records gateway captures. |
| `production_jobs` | `ProductionJob` + `ProductionStageLog` | **Added to `prisma/schema.prisma`** (`FR-PRD-001`). `CuttingJob` & `CNCMachineJob` link under `ProductionJob`. |
| `bom_revisions`, `bom_parts` | `BOMRevision` + `BOMItem` | **Added `BOMRevision`**; `BOMItem` is revision-bound with `approvedBy` / `approvedAt` / `isReleased`. |
| `stock_balances`, `stock_movements`, `material_reservations` | `StockBalance` + `StockMovement` + `MaterialReservation` | **Added to `prisma/schema.prisma`** (`BR-INV-001/002`). Direct `StockBalance` overwrites prohibited; all changes via `StockMovement`. |
| `audit_logs` | `AuditLog` | **Added to `prisma/schema.prisma`** (`BR-SEC-002`). Append-only (`UPDATE`/`DELETE` restricted at DB/service layer). |
| `handover_signatures` | `HandoverSignature` (1:1 with `InstallationJob`) | **Added to `prisma/schema.prisma`** (`BR-INS-001`: signature URL, GPS, signer ref, checklist, photos). |
| `warranty_claims` | `WarrantyClaim` | **Added to `prisma/schema.prisma`** (`FR-WAR-001`), linked to `Order`, `BOMItem`, and RMA `ProductionJob`. |
| `coupons`, `reviews` | `Coupon` + `Review` | **Added to `prisma/schema.prisma`** (`FR-PRC-002`, `FR-WEB-007`). |

---

## 4. Migration Plan
1. Validate reconciled `prisma/schema.prisma` with `npx prisma validate`.
2. Generate baseline migration: `npx prisma migrate dev --name reconcile_r1_enterprise_models`.
3. Add PostgreSQL trigger/privilege migration in SQL to enforce append-only immutability on `audit_logs` and `stock_movements` (revoke `UPDATE`/`DELETE` from app role).
4. Regenerate Prisma Client (`npx prisma generate`) and run `npm test`.
