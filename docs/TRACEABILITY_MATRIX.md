# SATCO AI Smart Furniture Platform — Traceability Matrix

**Status:** Active (P0 Governance Baseline)  
**Last Updated:** 2026-11-26  
**Purpose:** Maps `PRD.md` (`FR-*` / `BR-*`) ↔ `Requirements Validation.md` (`WEB-*`, `CFG-*`, `PRICE-*`, `DEC-*`, `NFR-*`) ↔ `prisma/schema.prisma` Models ↔ Code/Tests without rewriting existing IDs.

---

## 1. End-to-End Traceability Matrix

| PRD ID (`PRD.md`) | Validation ID (`Requirements Validation.md`) | Prisma Model(s) (`prisma/schema.prisma`) | Code / Test / Enforcement |
| :--- | :--- | :--- | :--- |
| `FR-WEB-001..003`, `FR-CAT-001` | `WEB-001`, `CAT-001..003` | `Category`, `ProductTemplate`, `TemplateHardwareMap` | `next-intl` (`ar`/`en` RTL/LTR), `PUBLISHED` catalog filter |
| `FR-SMP-001`, `BR-SMP-001` | `SMP-001..002` | `MaterialSampleBoxOrder` | `POST /api/v1/sample-box/order` (100 SAR fee, refundable/credited) |
| `FR-CFG-001`, `BR-MFG-003` | `CFG-001..004`, `VAL-001..003` | `ProductTemplate`, `MaterialSheet`, `EdgeBanding`, `HardwareItem` | `src/lib/validation/saudi-validators.ts` (`400–3600mm W`, `300–1000mm D`) |
| `FR-MAT-001..002`, `BR-MAT-001`, `BR-RTE-001` | `MAT-001..003`, `RTE-001` | `MaterialSheet`, `HardwareItem`, `EdgeBanding`, `PricingRule` | Physical specs separated from rate cards; `Storekeeper` blocked from rate writes |
| `FR-PRC-001`, `BR-PRICE-001..003` | `PRICE-001..005`, `VAL-006` | `PricingRule`, `CartItem`, `OrderItem` | `src/modules/pricing/pricing.service.ts`, `src/lib/decimal.ts`, `pricing.test.ts` (2/2 PASS) |
| `FR-PRC-002`, `BR-PRICE-004..005` | `PRICE-006..007` | `Coupon`, `User.maxDiscountPercent`, `Order.couponId` | Non-stackable coupons; admin-configured `maxDiscountPercent` (5%/15%/50% ceiling) |
| `FR-ENQ-001..002`, `BR-LOC-003` | `ENQ-001..003`, `SEC-001` | `Enquiry`, `User`, `CustomerProfile`, `BlacklistEntry` | `normalizeSaudiPhone` (`+9665xxxxxxxx`), OTP verification, abandoned draft recovery |
| `FR-QTE-001`, `BR-QTE-001`, `BR-SEC-003` | `QTE-001..004` | `Quotation`, `QuotationItem`, `PricingRule` | 14-day HMAC-SHA256 portal link, revision history, tier discount approval |
| `FR-ORD-001..004`, `BR-ORD-001..005` | `ORD-001..005` | `Order`, `OrderItem`, `OrderTimeline`, `MilestonePayment`, `PaymentTransaction` | 50%/40%/10% milestones, `DISPATCH_HOLD_DUE_PAYMENT` gate |
| `FR-SEC-002`, `BR-SEC-001..002`, `BR-SEC-005` | `SEC-001..005`, `NFR-SEC-001..004` | `AuditLog`, `BlacklistEntry`, `UserSession`, `PaymentTransaction` | Append-only `AuditLog`, `depositVerifiedAt` gate before saw cuts |
| `FR-INV-001`, `BR-INV-001..002` | `INV-001..003` | `StockBalance`, `StockMovement`, `MaterialReservation` | Two-phase reservation + immutable `StockMovement` ledger (no direct overwrite) |
| `FR-PRD-001`, `BR-MFG-002` | `PRD-001..003` | `ProductionJob`, `ProductionStageLog` | 1-to-many Order → ProductionJob stage lifecycle (`CUTTING` → `PACKED`) |
| `FR-BOM-001..002`, `FR-LBL-001`, `BR-SEC-004` | `BOM-001..003`, `LBL-001` | `BOMRevision`, `BOMItem` | Immutable approved `BOMRevision`, opaque `barcodeOpaqueToken` (zero PII) |
| `FR-CUT-001`, `FR-OPT-001`, `BR-CUT-001..002` | `CUT-001..003` | `CuttingJob` | Guillotine-2D nesting (`2440x1220mm`, `10mm` trim, `4.5mm` kerf, grain lock) |
| `FR-CNC-001..003`, `BR-CNC-001..005` | `CNC-001..007` (**Pending `DEC-007/008/009`**) | `CNCMachineJob` | `/api/v1/cnc-bridge/*` (`X-Bridge-Key`), 3-tier fallback; **verified CNC pending `DEC-007/008/009`** |
| `FR-INS-001`, `BR-INS-001` | `INS-001..003` | `InstallationJob`, `HandoverSignature` | `POST /api/v1/installations/:jobId/complete`, GPS + tablet e-signature + photos |
| `FR-WAR-001`, `BR-WAR-001` | `WAR-001..002` | `WarrantyClaim`, `BOMItem`, `ProductionJob` | Single-panel RMA remake linked to original `BOMItem` & `ProductionJob` |
| `FR-WEB-007` | `WEB-007` | `Review` | Post-delivery verified buyer review with moderation queue |
| `NFR-TAX-001` (ZATCA Phase 2) | `TAX-001..002` | `Invoice`, `Company` | `POST /api/v1/invoices/:orderId/issue`, 15% VAT, SHA-256 hash chain, 8-tag TLV QR |
