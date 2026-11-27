# SATCO AI Smart Furniture Platform — Spec Authority Matrix

**Status:** Active (P0 Governance Baseline)  
**Last Updated:** 2026-11-26  
**Purpose:** Single unambiguous authority map resolving which document governs each domain when specs overlap or diverge.

---

## 1. Document Authority Hierarchy

| Domain / Concern | Authoritative Document (Master) | Supporting / Snapshot Docs | Rules on Conflict |
| :--- | :--- | :--- | :--- |
| **Functional & Business Requirements (FR / BR / UJ)** | `PRD.md` | `prd analysis.md` | `PRD.md` wins for FR/BR/UJ definitions and acceptance scope. |
| **Requirement Validation & Release Gates** | `Requirements Validation.md` | `docs/TRACEABILITY_MATRIX.md` | Validation statuses (`Approved`, `Needs Clarification`, `Blocked`) and gate IDs (`WEB-*`, `CFG-*`, `DEC-*`) are owned by `Requirements Validation.md`. |
| **Technical Architecture & Security Decisions** | `Architecture.md` | `prisma/Agent.md` | `Architecture.md` owns high-level system topology, security posture, and module boundaries. |
| **Target Database Blueprint (Logical/Conceptual)** | `Database.md` | `docs/ADR-001-SCHEMA-RECONCILIATION.md` | `Database.md` defines target conceptual entities & retention rules; mapped to Prisma via `ADR-001`. |
| **Implemented Database Schema (Executable Code)** | `prisma/schema.prisma` | `src/database-schema.md` (Snapshot) | **Code follows `prisma/schema.prisma` exclusively.** Any new target entity from `Database.md` must be reconciled into `prisma/schema.prisma` via migration. |
| **REST API Contracts (`/api/v1/*`)** | `src/Api-spac.md` | — | `src/Api-spac.md` owns endpoint paths, headers (`X-Idempotency-Key`, `X-Bridge-Key`), envelopes, and error codes. |
| **Engineering Standards & Coding Rules** | `prisma/Agent.md` | `prisma/prompt.md` | `prisma/Agent.md` owns `decimal.js`, Zod, PDPL, Prisma patterns, and test conventions; `prisma/prompt.md` owns sprint execution order. |
| **Process & Data Flows (DFD)** | `DFD.md` | — | Process-level data flow reference. |
| **Discovery / Product Backlog Ideas** | `idea.md` | `SATCO_Final_Project_Blueprint.md` | **Backlog / Historical Reference Only.** Never overrides `PRD.md`, `Requirements Validation.md`, or `prisma/schema.prisma`. |

---

## 2. Pending Stakeholder Decisions (`DEC-*`)

* **CNC Machine & Bridge (`DEC-007`, `DEC-008`, `DEC-009`):** `prisma/schema.prisma` and `src/Api-spac.md` include `CNCMachineJob` (`Homag Centateq / Sawteq` default) and `/api/v1/cnc-bridge/*` as ready interfaces, **however** production activation remains **verified CNC pending `DEC-007/008/009`** in `Requirements Validation.md`.
* **Commercial Flow (`Cart` + `Enquiry/Quotation`):** Both `Cart → Checkout` (`src/Api-spac.md`) and `Enquiry → Quotation → Order` (`PRD.md`) are supported in `prisma/schema.prisma`.
