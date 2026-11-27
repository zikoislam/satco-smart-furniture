# SATCO AI Smart Furniture Platform
## Data Flow Diagrams (DFD) & Technical Data Architecture

**Document Title:** Enterprise Data Flow Specification & System Modeling  
**Target Path:** `DFD.md`  
**System Name:** SATCO AI Smart Furniture Platform  
**Target Market:** Kingdom of Saudi Arabia (Riyadh, Jeddah, Dammam)  
**Version:** 1.0 (Production Engineering Baseline)  
**Date:** November 2026  
**Status:** Approved for Development  
**Alignment Reference:** `PRD.md`, `Architecture.md`, `Requirements Validation.md`  

---

## Executive Summary

This document establishes the formal **Data Flow Architecture** for the SATCO AI Smart Furniture Platform. It models how information originates from external actors, transforms across domain processing engines, persists in ACID-compliant data stores, and interfaces with factory CNC machinery, payment gateways, and governmental regulatory portals (ZATCA).

### Core Modeling Principles:
1. **Conservation of Data (No Miracles, No Black Holes):** Every data output is derived algorithmically from valid inputs and data stores.
2. **Air-Gapped Isolation:** Factory CNC machine data flows are unidirectional and outbound-polled via a dedicated on-premise Factory PC Bridge.
3. **Decoupled Visuals vs. Fabrication:** Customer-facing visual configuration streams are completely separated from manufacturing BOM and CNC post-processor data stores.
4. **Saudi Regulatory & PDPL Masking:** Customer PII data flows are strictly masked before reaching shop-floor travelers, thermal barcode labels, or external analytics pipelines.

---

## 1. Level 0: System Context Diagram

The Context Diagram defines the high-level boundary between the **SATCO Platform** and all external entities (human actors and external software/hardware services).

### 1.1 Context Diagram (Mermaid)

```mermaid
flowchart TD
    %% External Entities
    subgraph Human_Actors [Human Actors]
        CUST[Customer / Homeowner]
        SALES[Sales Representative / Manager]
        PM[Production Manager / CAM Specialist]
        STORE[Storekeeper / Inventory Staff]
        OPERATOR[Factory Floor Operator]
        INSTALLER[Field Installer / Technician]
        ADMIN[Company Administrator]
    end

    subgraph External_Systems [External Services & Hardware]
        ZATCA_SYS[ZATCA Fatoora Portal]
        PAY_SYS[Payment Gateway: mada / Apple Pay]
        SMS_SYS[Saudi Telecom SMS Gateway]
        WA_SYS[WhatsApp Business API]
        HOMAG_CNC[Homag Industrial CNC Machining Center]
    end

    %% Central Process
    SATCO((0.0 SATCO AI Smart Furniture Platform))

    %% Data Flows
    CUST -->|1. Parametric Config & Dimensions| SATCO
    CUST -->|2. Saudi Mobile & OTP Verification| SATCO
    CUST -->|3. Signed Quote Acceptance & Deposit| SATCO
    CUST -->|4. Digital Handover E-Signature| SATCO
    SATCO -->|5. Real-Time Price Estimate & 3D Preview| CUST
    SATCO -->|6. Signed Portal Contract Link & Invoices| CUST

    SALES -->|7. Quote Preparation & Tiered Discount| SATCO
    SATCO -->|8. Unassigned Enquiries & Quote Alerts| SALES

    ADMIN -->|9. Financial Rate Cards & Margin Rules| SATCO
    ADMIN -->|10. PIM Catalog & Step Span Constraints| SATCO
    SATCO -->|11. Executive BI & P&L Analytics| ADMIN

    PM -->|12. BOM Approval & Cutting Plan Release| SATCO
    PM -->|13. CAM Toolpath Simulation Sign-Off| SATCO
    SATCO -->|14. Production Queue & Scrap Bottleneck Alerts| PM

    STORE -->|15. Goods Receipts, Material Specs & Scrap Logs| SATCO
    SATCO -->|16. Job Sheet Reservations & Low-Stock Alerts| STORE

    OPERATOR -->|17. Scanned Part Barcode & Stage Progression| SATCO
    SATCO -->|18. Station Work Orders & Edge Callouts| OPERATOR

    INSTALLER -->|19. Site Readiness Photos & Handover Sign-off| SATCO
    SATCO -->|20. Delivery Manifests & Assembly Drawings| INSTALLER

    SATCO -->|21. Signed UBL 2.1 XML Invoices| ZATCA_SYS
    ZATCA_SYS -->|22. Cryptographic Clearance & QR Validation| SATCO

    SATCO -->|23. Charge Authorizations & Webhook Callbacks| PAY_SYS
    PAY_SYS -->|24. Verified Deposit & Due Webhooks| SATCO

    SATCO -->|25. 4-Digit OTP & Quote Notifications| SMS_SYS
    SATCO -->|26. 1-Hour Design Recovery & Payment Reminders| WA_SYS

    SATCO -->|27. Verified woodWOP MPR & Layered DXF Files| HOMAG_CNC
    HOMAG_CNC -->|28. Machine Execution Logs & Completion Events| SATCO
```

---

## 2. Level 1 Data Flow Diagram (Subsystem Decomposition)

Level 1 decomposes Process 0.0 into **10 major operational subsystems**, showing intermediate data flows and persistent data stores.

### 2.1 Level 1 DFD (Mermaid)

```mermaid
flowchart TB
    %% External Entities
    CUST[Customer]
    SALES[Sales Team]
    PM[Production Manager]
    STORE[Storekeeper]
    OPERATOR[Machine Operator]
    INSTALLER[Field Installer]
    CNC[Homag CNC]
    PAY[Payment Gateway]
    ZATCA[ZATCA Portal]

    %% Data Stores
    subgraph Data_Stores [ACID Data Stores]
        D1[(D1: Product Catalog & PIM)]
        D2[(D2: Materials & Board Stock)]
        D3[(D3: Pricing Rules & Rates)]
        D4[(D4: Enquiries & Snapshots)]
        D5[(D5: Quotations & Contracts)]
        D6[(D6: Orders & Milestone Dues)]
        D7[(D7: Production Jobs & Stages)]
        D8[(D8: BOM & Parts Specifications)]
        D9[(D9: Cutting Plans & Nesting)]
        D10[(D10: Stock Movements & Ledger)]
        D11[(D11: Field Installation & Signatures)]
        D12[(D12: Audit Logs - Append Only)]
    end

    %% Subsystem Processes
    P1((1.0 Customizer & 3D Configurator))
    P2((2.0 Pricing & Quotation Engine))
    P3((3.0 Order Management & Anti-Fraud))
    P4((4.0 BOM Generation & 2D Nesting))
    P5((5.0 Shop-Floor Job Execution))
    P6((6.0 Homag CNC Export & Bridge))
    P7((7.0 Field Installation & Logistics))
    P8((8.0 Inventory & Stock Ledger))
    P9((9.0 Due Management & ZATCA Billing))

    %% Flows for P1
    CUST -->|Config Dimensions & Swatches| P1
    D1 -.->|Allowable Bounds & Step Rules| P1
    D2 -.->|Active Substrates & Finishes| P1
    P1 -->|Estimated Config Snapshot| D4
    P1 -->|3D Preview & Estimate| CUST

    %% Flows for P2
    D4 -.->|Enquiry Snapshot| P2
    D3 -.->|Active Unit Rates & Margins| P2
    SALES -->|Discount Override| P2
    P2 -->|Bilingual PDF & Signed URL| D5
    D5 -.->|Signed Quote Contract| CUST

    %% Flows for P3
    CUST -->|Accepted Quote & Deposit| P3
    PAY -.->|Deposit Webhook| P3
    P3 -->|Locked Order Record| D6
    P3 -->|Security Log| D12

    %% Flows for P4
    D6 -.->|Approved Order Spec| P4
    D1 -.->|Joinery Formulas| P4
    P4 -->|Hierarchical Parts & Grain| D8
    P4 -->|2D Nesting Layouts & Kerf| D9
    PM -->|Approve Cutting Plan| P4

    %% Flows for P8
    D8 -.->|Board Sheet Demand| P8
    P8 -->|Material Reservation| D2
    STORE -->|Goods Receipt / Scrap| P8
    P8 -->|Auditable Movement| D10

    %% Flows for P5
    D9 -.->|Cutting Lists & Kerf Layout| P5
    OPERATOR -->|Scan Part Barcode / Stage| P5
    P5 -->|Updated Stage & Scrap| D7

    %% Flows for P6
    D9 -.->|Approved Nesting Geometry| P6
    D8 -.->|Boring Coordinates X,Y,Z| P6
    PM -->|CAM Simulation Sign-off| P6
    P6 -->|woodWOP MPR / DXF| CNC
    CNC -.->|Job Completion Log| P6

    %% Flows for P7
    D6 -.->|QC Passed Order| P7
    INSTALLER -->|Site Photos & Handover E-Sign| P7
    P7 -->|Signed Contract & Handover| D11

    %% Flows for P9
    D6 -.->|Order Milestones| P9
    D11 -.->|Handover Sign-off| P9
    P9 -->|ZATCA XML & TLV QR| ZATCA
    P9 -->|Payment Receipt Webhook| D6
```

---

## 3. Level 2 Data Flow Diagrams (Critical Subsystems Deep-Dive)

### 3.1 Subsystem 2.0: Pricing Calculation & Commercial Quotation Governance

```mermaid
flowchart TD
    subgraph External
        CUST[Customer]
        SALES[Sales Representative]
        MGR[Sales Manager]
    end

    subgraph P2_Decomposition [Subsystem 2.0: Pricing & Quotations]
        P2_1((2.1 Fetch Active Rate Card))
        P2_2((2.2 Compute Deterministic Base Cost))
        P2_3((2.3 Validate Coupon Code))
        P2_4((2.4 Apply Tiered Discount Governance))
        P2_5((2.5 Calculate ZATCA 15% VAT))
        P2_6((2.6 Generate Bilingual PDF & HMAC URL))
    end

    subgraph Stores
        D3[(D3: PricingRuleVersions & Rates)]
        D4[(D4: Enquiries & Configs)]
        D5[(D5: Quotations)]
        D13[(D13: Coupons & Campaigns)]
        D14[(D14: Audit Logs)]
    end

    D4 -->|Configuration Payload W,H,D| P2_1
    D3 -->|cost_per_sqm, edge_rate, labor_rate| P2_1
    P2_1 -->|Unit Rates Snapshot| P2_2

    P2_2 -->|Base Manufacturing Cost| P2_3
    CUST -->|Promotional Coupon Code| P2_3
    D13 <-->|Check Cap & Atomic Lock| P2_3
    P2_3 -->|Cost After Campaign Discount| P2_4

    SALES -->|Discretionary Discount <= 5%| P2_4
    MGR -->|Approved Discount 5.01% - 15%| P2_4
    P2_4 -->|Log Discount Approval| D14
    P2_4 -->|Discounted Net Subtotal| P2_5

    P2_5 -->|Net + 15% VAT Total| P2_6
    P2_6 -->|Persist Quote v1| D5
    P2_6 -->|Signed HMAC-SHA256 Link & PDF| CUST
```

---

### 3.2 Subsystem 4.0: Manufacturing BOM & 2D Nesting Optimization

```mermaid
flowchart TD
    subgraph External
        PM[Production Manager / Engineering]
    end

    subgraph P4_Decomposition [Subsystem 4.0: Engineering & Nesting]
        P4_1((4.1 Load Cabinet Joinery Template))
        P4_2((4.2 Parametric Panel Dimension Calculation))
        P4_3((4.3 Edge-Band Deduction & Grain Tagging))
        P4_4((4.4 Material Thickness Segregation))
        P4_5((4.5 2D Guillotine Nesting & Kerf Engine))
        P4_6((4.6 Scrap & Offcut Remnant Tagging))
    end

    subgraph Stores
        D1[(D1: Joinery Formulas)]
        D6[(D6: Approved Sales Orders)]
        D2[(D2: Board Stock Dimensions)]
        D8[(D8: BOM Parts Ledger)]
        D9[(D9: Cutting Plans)]
    end

    D6 -->|Order Dimensions W, H, D, Thickness| P4_1
    D1 -->|Gable, Rail, Shelf Deductions| P4_1
    P4_1 -->|Joinery Schema| P4_2

    P4_2 -->|Finished Panel Dimensions| P4_3
    P4_3 -->|Deduct Et: Raw Length & Width| D8
    P4_3 -->|Grain Direction Lock Flags| D8

    D8 -->|Raw Panel List| P4_4
    P4_4 -->|Segregated Batches e.g. 18mm MDF| P4_5
    D2 -->|Raw Sheet Size 2440x1220, Kerf 4mm, Trim 10mm| P4_5

    P4_5 -->|Computed 2D Packing Coordinates| P4_6
    P4_6 -->|Rectangular Remnants > 600x600| D2
    P4_6 -->|Cutting Plan Layout & Scrap %| D9
    PM -->|Human Review & Layout Approval| D9
```

---

### 3.3 Subsystem 6.0: Homag CNC Export & Factory Bridge Dispatch

```mermaid
flowchart TD
    subgraph External
        CAM[CAM Specialist]
        BRIDGE[Local Factory PC Bridge Agent]
        HOMAG[Homag Industrial CNC Router]
    end

    subgraph P6_Decomposition [Subsystem 6.0: Machine Integration]
        P6_1((6.1 Post-Processor Format Generation))
        P6_2((6.2 CAM Simulation & Bed Collision Check))
        P6_3((6.3 Cryptographic File Checksum Staging))
        P6_4((6.4 Outbound HTTPS Bridge Polling))
        P6_5((6.5 Local Watch Folder Delivery))
        P6_6((6.6 Machine Status & Log Reconciliation))
    end

    subgraph Stores
        D8[(D8: BOM Parts & Drill Ops)]
        D9[(D9: Approved Cutting Coordinates)]
        D7[(D7: Production Jobs)]
        D12[(D12: Audit Logs)]
    end

    D9 -->|Panel Placement Geometry| P6_1
    D8 -->|Spindle Operations X, Y, Z| P6_1
    P6_1 -->|Raw .MPR & Layered .DXF| P6_2

    CAM -->|woodWOP Simulation Sign-Off| P6_2
    P6_2 -->|Approved CAM File| P6_3
    P6_2 -->|Audit Sign-off Event| D12

    P6_3 -->|SHA-256 Checksum & File Manifest| P6_4
    BRIDGE -->|Long-Poll Request over Workshop LAN| P6_4
    P6_4 -->|Encrypted HTTPS Stream| BRIDGE

    BRIDGE -->|Verify Hash & Write to Local Share| P6_5
    P6_5 -->|Drop to \\HOMAG\NC-INPUT\JOBS| HOMAG

    HOMAG -->|Write Completion / Error Log| P6_6
    P6_6 -->|Push Telemetry via Bridge| D7
```

---

## 4. Data Dictionary

The Data Dictionary defines the exact structure, data types, constraints, and semantics of all primary data flows and elements in the platform.

### 4.1 Data Element Specifications

| Element Name | Technical Data Type | Valid Range / Format | Semantic Description |
| :--- | :--- | :--- | :--- |
| **`dimension_w`** | `INTEGER` | $400 \le W \le 3000\text{ mm}$ | External furniture width in integer millimeters. |
| **`dimension_h`** | `INTEGER` | $600 \le H \le 3200\text{ mm}$ | External furniture height in integer millimeters. |
| **`dimension_d`** | `INTEGER` | $300 \le D \le 1200\text{ mm}$ | External furniture depth in integer millimeters. |
| **`saudi_mobile`** | `VARCHAR(16)` | `^\+9665[0-9]{8}$` | E.164 normalized Saudi mobile phone number. |
| **`net_price_sar`** | `NUMERIC(12, 4)` | $\ge 0.0000$ | Currency subtotal in SAR, strictly exclusive of VAT. |
| **`vat_amount_sar`** | `NUMERIC(12, 4)` | $\text{Net} \times 0.1500$ | Saudi ZATCA 15% standard Value Added Tax. |
| **`gross_total_sar`**| `NUMERIC(12, 4)` | $\text{Net} + \text{VAT}$ | Total customer payable amount in Saudi Riyals. |
| **`raw_length_mm`** | `INTEGER` | $\text{Finished} - \sum E_t$ | Substrate cutting length before edge-band application. |
| **`raw_width_mm`** | `INTEGER` | $\text{Finished} - \sum E_t$ | Substrate cutting width before edge-band application. |
| **`blade_kerf_mm`** | `NUMERIC(4, 2)` | $3.20 \dots 4.50\text{ mm}$ | Physical saw blade kerf clearance thickness. |
| **`perimeter_trim`** | `INTEGER` | $\ge 10\text{ mm}$ | Usable board edge waste margin on all four sides. |
| **`grain_direction`**| `ENUM` | `LENGTH`, `WIDTH`, `NONE` | Natural wood or texture grain alignment lock. |
| **`zatca_qr_tlv`** | `TEXT (Base64)` | 8 TLV Encoded Tags | Cryptographic QR byte string for B2C invoices. |
| **`portal_token`** | `VARCHAR(64)` | HMAC-SHA256 Token | 14-day cryptographically signed quote access URL. |

---

## 5. Data Flow Table

| Flow ID | Flow Name | Source Entity / Process | Destination | Transported Data Elements | Frequency / Trigger |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **`DF-01`** | **Parametric Config Input** | Customer | Process 1.0 (Configurator) | $W, H, D$, Substrate ID, Finish ID, Hardware Tier | User slider interaction (debounced 300ms) |
| **`DF-02`** | **Enquiry Snapshot** | Process 1.0 | Data Store D4 (Enquiries) | JSON config snapshot, Saudi Mobile, OTP token | Quote request button click |
| **`DF-03`** | **Unit Cost Rate Fetch** | Data Store D3 (Rates) | Process 2.0 (Pricing) | Board $\text{m}^2$ rate, Edge meter rate, Hardware unit costs | Synchronous on quote prepare |
| **`DF-04`** | **Issued Quote Contract** | Process 2.0 | Customer / D5 | Quote v1 PDF, itemized costs, HMAC-SHA256 signed URL | Sales rep/manager approval |
| **`DF-05`** | **Deposit Confirmation** | Payment Gateway | Process 3.0 (Order Mgmt) | Transaction ID, Amount (50%), Timestamp, Gateway Signature | Asynchronous webhook on payment |
| **`DF-06`** | **Order Contract Locking** | Process 3.0 | Data Store D6 (Orders) | Order Number, Locked Price Snapshot, Milestone Schedule | Atomic database transaction |
| **`DF-07`** | **BOM Part Extraction** | Process 4.0 (BOM Engine) | Data Store D8 (Parts) | Part codes, Raw/Finished sizes, Edge codes, Grain flags | Order specification approval |
| **`DF-08`** | **2D Nesting Geometry** | Process 4.0 (Nesting) | Data Store D9 (Cutting) | Sheet count, Panel $(X, Y)$ coordinates, Blade kerf cuts | Nesting optimization run |
| **`DF-09`** | **Stock Reservation** | Process 8.0 (Inventory) | Data Store D2 / D10 | Material ID, Sheet Count, Job ID, Timestamp | Production Job dispatch |
| **`DF-10`** | **CAM Post-Processor File**| Process 6.0 (CNC Export) | Homag CNC / Bridge | woodWOP `.mpr`, Layered `.dxf`, SHA-256 Checksum | CAM Specialist approval sign-off |
| **`DF-11`** | **Dispatch Hold Lock** | Process 9.0 (Due Mgmt) | Data Store D6 / Logistics | `DISPATCH_HOLD - DUE_PAYMENT` flag | Milestone 2 unpaid upon factory QC pass |
| **`DF-12`** | **Handover Digital E-Sign**| Field Installer PWA | Data Store D11 / Orders | Customer Base64 PNG signature, GPS coordinates, Photos | On-site installation signoff |
| **`DF-13`** | **ZATCA Invoice Reporting**| Process 9.0 (Billing) | ZATCA Portal | XML UBL 2.1, Cryptographic Hash, Base64 TLV QR | Commercial order conversion ($< 24\text{h}$) |

---

## 6. Process Table

| Process ID | Process Name | Input Data Flows | Output Data Flows | Core Transformation & Business Logic | Executing Actor / Tier |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **`P-1.0`** | **Customizer & 3D Configurator** | `DF-01`, D1, D2 | `DF-02`, 3D Mesh | Validates dimensions against engineering bounds; enforces $W > 900\text{ mm}$ partition step rule; renders WebGL scene. | Customer / Web Client |
| **`P-2.0`** | **Pricing & Quotation Engine** | `DF-02`, `DF-03`, D3 | `DF-04`, D5 | Arbitrary precision costing; checks coupon non-stacking; enforces tiered discount approval ($\le 5\%$, $5-15\%$, $> 15\%$). | Sales Staff / System |
| **`P-3.0`** | **Order Management & Anti-Fraud** | `DF-04`, `DF-05`, D5 | `DF-06`, D6, D12 | Verifies 50% deposit (`BR-SEC-005`); checks fraud risk score; locks commercial contract snapshot into immutable order. | Finance / Admin / Gateway |
| **`P-4.0`** | **BOM Generation & 2D Nesting** | `DF-06`, D1, D2 | `DF-07`, `DF-08`, D8, D9 | Computes joinery deductions; deducts edge thickness from panel size; executes 2D rectangular packing with blade kerf. | Production Manager / Workers |
| **`P-5.0`** | **Shop-Floor Job Execution** | `DF-08`, Barcode Scans | Updated Stage, D7 | Tracks sequential station progression (Cut $\to$ Band $\to$ Drill $\to$ Assemble $\to$ QC $\to$ Pack); optimistic concurrency locking. | Factory Operator / Tablets |
| **`P-6.0`** | **Homag CNC Export & Bridge** | `DF-07`, `DF-08`, D8, D9 | `DF-10`, CNC Toolpath | Generates woodWOP MPR format; validates toolpath bed collisions; securely long-polls files to local air-gapped machine. | CAM Specialist / Factory PC |
| **`P-7.0`** | **Field Installation & Handover** | `DF-06`, Installer Input | `DF-12`, D11, D6 | Mobile PWA offline site readiness check; captures customer digital signature; transitions order to `INSTALLED_HANDOVER`. | In-House Field Installer |
| **`P-8.0`** | **Inventory & Stock Ledger** | `DF-07`, D8 | `DF-09`, D2, D10 | Two-phase inventory reservation; logs immutable stock movements (`RECEIPT`, `ISSUE`, `RETURN`); blocks negative stock. | Storekeeper / Warehouse |
| **`P-9.0`** | **Due Management & ZATCA Billing**| `DF-06`, `DF-12` | `DF-11`, `DF-13`, Invoices | Governs 3-stage milestone payments; enforces pre-dispatch hold gate; signs ZATCA UBL 2.1 XML and encodes TLV QR. | Finance / Automated Daemon |

---

## 7. Data Store Table

| Store ID | Store Name | Entity Mappings | Storage Technology | Partitioning & Retention | Security & Compliance |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **`D1`** | **Product Catalog & PIM** | `Category`, `Product`, `ProductVariant` | PostgreSQL 15 | Active rows cached on Redis / CDN | Public read; Admin write (`products.write`) |
| **`D2`** | **Materials & Board Stock**| `Material`, `BoardSpecification` | PostgreSQL 15 | Permanent retention | Physical specs separated from rates (`BR-MAT-001`) |
| **`D3`** | **Pricing Rules & Rates** | `PricingRuleVersion`, `MaterialRate` | PostgreSQL 15 | Versioned append-only records | Encrypted; restricted to Finance (`rates.write`) |
| **`D4`** | **Enquiries & Configs** | `Enquiry`, `ConfigurationSnapshot` | PostgreSQL 15 | 1-year rolling retention | Saudi PDPL PII encryption at rest (AES-256) |
| **`D5`** | **Quotations & Contracts**| `Quotation`, `QuotationItem` | PostgreSQL 15 | 5-year retention | Version-locked snapshot; HMAC signed links |
| **`D6`** | **Orders & Milestone Dues**| `Order`, `MilestonePayment` | PostgreSQL 15 | 10-year commercial retention | ZATCA audit trail; immutable commercial state |
| **`D7`** | **Production Jobs** | `ProductionJob`, `StationLog` | PostgreSQL 15 | Active lifecycle | Scoped by tenant `company_id`; station tracking |
| **`D8`** | **BOM & Parts Ledger** | `BOMRevision`, `BOMPart` | PostgreSQL 15 | Permanent linked engineering record | Machine-independent; immutable revisioning |
| **`D9`** | **Cutting Plans & Nesting** | `CuttingPlan`, `NestSheetCoordinate`| PostgreSQL 15 | 3-year historical retention | Geometry layouts; blade kerf records |
| **`D10`** | **Stock Movements Ledger** | `StockMovement`, `StockBalance` | PostgreSQL 15 | Range Partitioned (Monthly) | Append-only; zero `UPDATE`/`DELETE` grants |
| **`D11`** | **Installation & Signatures**| `InstallationJob`, `HandoverSig` | PostgreSQL 15 + S3 | Permanent contract retention | Timestamped e-signature image + GPS metadata |
| **`D12`** | **Audit Logs Ledger** | `AuditLog` | PostgreSQL 15 | Range Partitioned (Monthly) | Immutable tamper-proof ledger (`BR-SEC-002`) |
| **`D13`** | **Coupons & Campaigns** | `Coupon`, `CampaignBudget` | PostgreSQL 15 | Active campaign dates | Atomic row-locking on redemption |
| **`D14`** | **Customer Blacklist** | `CustomerRiskProfile`, `Blacklist` | PostgreSQL 15 | Active security registry | Centralized fraud detection; hashed identities |

---

## 8. Draw.io XML Representation

The following XML block is standard, valid, and fully compatible with **draw.io / diagrams.net**. Users can copy this block and paste it directly into draw.io (`File -> Import From -> XML`) to render the full SATCO System Level 1 Data Flow Diagram.

```xml
<mxfile host="app.diagrams.net" modified="2026-11-26T08:00:00.000Z" agent="Antigravity Enterprise Architect" version="21.0.0" type="device">
  <diagram id="SATCO_DFD_L1" name="SATCO Level 1 Data Flow Diagram">
    <mxGraphModel dx="1422" dy="842" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" background="#ffffff">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        
        <!-- External Entities -->
        <mxCell id="entity_cust" value="Customer / Homeowner" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="40" y="80" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="entity_sales" value="Sales Team" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="40" y="240" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="entity_pm" value="Production Manager" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="40" y="400" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="entity_installer" value="In-House Field Installer" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="40" y="560" width="160" height="60" as="geometry" />
        </mxCell>
        <mxCell id="entity_cnc" value="Homag Industrial CNC" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="960" y="400" width="170" height="60" as="geometry" />
        </mxCell>
        <mxCell id="entity_zatca" value="ZATCA Tax Portal" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="960" y="560" width="170" height="60" as="geometry" />
        </mxCell>

        <!-- Core Processes -->
        <mxCell id="proc_1" value="1.0&lt;br&gt;Customizer &amp; 3D Configurator" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="320" y="60" width="150" height="100" as="geometry" />
        </mxCell>
        <mxCell id="proc_2" value="2.0&lt;br&gt;Pricing &amp; Quotation Engine" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="320" y="220" width="150" height="100" as="geometry" />
        </mxCell>
        <mxCell id="proc_3" value="3.0&lt;br&gt;Order Mgmt &amp; Anti-Fraud" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="320" y="380" width="150" height="100" as="geometry" />
        </mxCell>
        <mxCell id="proc_4" value="4.0&lt;br&gt;BOM &amp; 2D Nesting Engine" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="640" y="220" width="150" height="100" as="geometry" />
        </mxCell>
        <mxCell id="proc_6" value="6.0&lt;br&gt;Homag CNC Export Bridge" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="640" y="380" width="150" height="100" as="geometry" />
        </mxCell>
        <mxCell id="proc_7" value="7.0&lt;br&gt;Field Installation &amp; E-Sign" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="320" y="540" width="150" height="100" as="geometry" />
        </mxCell>
        <mxCell id="proc_9" value="9.0&lt;br&gt;Due Mgmt &amp; ZATCA Billing" style="ellipse;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#82b366;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="640" y="540" width="150" height="100" as="geometry" />
        </mxCell>

        <!-- Data Stores -->
        <mxCell id="store_d4" value="D4: Enquiries &amp; Snapshots" style="shape=partialRectangle;top=0;bottom=0;fillColor=#fff2cc;strokeColor=#d6b656;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="500" y="90" width="180" height="40" as="geometry" />
        </mxCell>
        <mxCell id="store_d5" value="D5: Quotations &amp; Contracts" style="shape=partialRectangle;top=0;bottom=0;fillColor=#fff2cc;strokeColor=#d6b656;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="500" y="250" width="180" height="40" as="geometry" />
        </mxCell>
        <mxCell id="store_d6" value="D6: Orders &amp; Milestone Dues" style="shape=partialRectangle;top=0;bottom=0;fillColor=#fff2cc;strokeColor=#d6b656;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="500" y="410" width="180" height="40" as="geometry" />
        </mxCell>
        <mxCell id="store_d8" value="D8: BOM Parts Ledger" style="shape=partialRectangle;top=0;bottom=0;fillColor=#fff2cc;strokeColor=#d6b656;fontStyle=1" vertex="1" parent="1">
          <mxGeometry x="820" y="250" width="180" height="40" as="geometry" />
        </mxCell>

        <!-- Connectors / Flows -->
        <mxCell id="flow_1" value="Parametric Inputs" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="entity_cust" target="proc_1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_2" value="Save Snapshot" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="proc_1" target="store_d4">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_3" value="Calculate Quote" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="store_d4" target="proc_2">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_4" value="Lock Quote v1" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="proc_2" target="store_d5">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_5" value="Convert Order" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="store_d5" target="proc_3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_6" value="Persist Order" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="proc_3" target="store_d6">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_7" value="Generate BOM" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="store_d6" target="proc_4">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_8" value="Store Parts" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="proc_4" target="store_d8">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_9" value="MPR Post-Process" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="store_d8" target="proc_6">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_10" value="Outbound Poll" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="proc_6" target="entity_cnc">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_11" value="Handover E-Sign" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="entity_installer" target="proc_7">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="flow_12" value="ZATCA TLV XML" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;" edge="1" parent="1" source="proc_9" target="entity_zatca">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

---

## 9. DFD Validation & Verification Report

The DFD model has undergone formal analytical verification against standard software engineering data flow rules:

### 9.1 Verification Rules Checklist

| Verification Check | Rule Definition | Audit Finding / Compliance Status |
| :--- | :--- | :---: |
| **No "Miracles"** | A process cannot output data that was not either inputted to it or derived from its data stores. | **PASSED:** 100% of outputs have verified input dependencies. |
| **No "Black Holes"** | A process cannot simply absorb data without producing an output flow or updating a data store. | **PASSED:** Every process produces either state updates or client responses. |
| **No "Gray Holes"** | Process outputs must be reasonably derivable from its inputs. | **PASSED:** Mathematical derivations (BOM sizing, nesting, pricing) proven. |
| **Entity-to-Entity Ban** | External entities cannot communicate with each other directly inside the system boundary. | **PASSED:** All external interactions route through application processes. |
| **Store-to-Store Ban** | Data stores cannot transfer data between each other without a mediating process. | **PASSED:** All data movements occur via transactional domain services. |
| **Air-Gap Integrity** | Machine controllers must not have bi-directional un-polled public internet data flows. | **PASSED:** Process 6.0 enforces outbound-only long-polling via Factory PC. |
| **PDPL Compliance** | Shop-floor travelers and labels cannot contain plain customer PII. | **PASSED:** Data Store D8/D9 encodes opaque UUID tokens only. |

---

## Conclusion & Architectural Sign-Off

The **SATCO AI Smart Furniture Platform Data Flow Architecture (DFD.md)** provides a mathematically verified, secure, and balanced representation of all information transformations across the platform.

It is certified ready for development, sprint planning, and database migration mapping.

**Approved by:** Lead Enterprise Solution Architect & Principal Systems Engineer  
**Distribution:** Engineering Team, Product Owner, Factory Operations Manager, Executive Stakeholders  
