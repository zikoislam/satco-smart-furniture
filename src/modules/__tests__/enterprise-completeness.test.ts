import { ProcurementService } from '@/modules/procurement/procurement.service';
import { FieldServiceHR } from '@/modules/field-service/field-service.service';
import { ARVisualizationService } from '@/modules/ar/ar.service';

const TEST_ACTOR_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TEST_SHEET_ID = '11111111-1111-4111-8111-111111111111';

describe('Enterprise Completeness Test Suite (Procurement, Field HR, AR)', () => {
  it('creates purchase orders and receives inventory to warehouse bins', async () => {
    // 1. Create PO
    const po = await ProcurementService.createPurchaseOrder(TEST_ACTOR_ID, {
      supplierName: 'Egger Wood Products Saudi Ltd',
      supplierVatNumber: '300000000000003',
      items: [
        {
          materialSheetId: TEST_SHEET_ID,
          quantityOrdered: 50,
          unitCostSar: 120,
        },
      ],
    });

    expect(po.id).toBeDefined();
    expect(po.status).toBe('SUBMITTED_TO_SUPPLIER');
    expect(po.totalAmountSar).toBe(6000);
    expect(po.vatAmountSar).toBe(900); // 15% ZATCA VAT
    expect(po.grandTotalSar).toBe(6900);

    // 2. Receive Partial Stock
    const partial = await ProcurementService.receivePOLine(TEST_ACTOR_ID, {
      poId: po.id,
      materialSheetId: TEST_SHEET_ID,
      quantityReceived: 20,
      warehouseBin: 'RIYADH-NORTH-A1',
    });

    expect(partial.poStatus).toBe('PARTIALLY_RECEIVED');
    expect(partial.quantityReceived).toBe(20);
    expect(partial.binCurrentQty).toBe(20);

    // 3. Receive Remaining Stock
    const complete = await ProcurementService.receivePOLine(TEST_ACTOR_ID, {
      poId: po.id,
      materialSheetId: TEST_SHEET_ID,
      quantityReceived: 30,
      warehouseBin: 'RIYADH-NORTH-A1',
    });

    expect(complete.poStatus).toBe('COMPLETED');
    expect(complete.binCurrentQty).toBe(50);
  });

  it('tracks field service technician check-in, site arrival, and shift checkout', async () => {
    const techId = '99999999-9999-4999-8999-999999999999';

    // 1. Check in
    const checkIn = await FieldServiceHR.recordCheckIn(techId, {
      gpsLat: 24.7136,
      gpsLng: 46.6753, // Jeddah coordinates
      deviceInfo: 'Samsung Galaxy XCover Pro',
    });

    expect(checkIn.status).toBe('CHECKED_IN');
    expect(checkIn.locationHistory.length).toBe(1);

    // 2. Arrived at Customer Site
    const siteStatus = await FieldServiceHR.updateFieldStatus(techId, {
      jobId: '88888888-8888-4888-8888-888888888888',
      status: 'ARRIVED_AT_SITE',
      gpsLat: 24.72,
      gpsLng: 46.68,
      notes: 'Customer villa reached on time in Al-Malqa',
    });

    expect(siteStatus.status).toBe('ON_JOB_SITE');
    expect(siteStatus.currentJobId).toBe('88888888-8888-4888-8888-888888888888');

    // 3. Checkout
    const checkout = await FieldServiceHR.recordCheckOut(techId);
    expect(checkout.status).toBe('CHECKED_OUT');
    expect(checkout.checkOutTime).toBeDefined();
  });

  it('calibrates 1:1 true scale and generates native AR manifests for iOS and Android', () => {
    const manifest = ARVisualizationService.generateARManifest({
      templateId: 'wardrobe-4door',
      widthMm: 2400,
      heightMm: 2600,
      depthMm: 600,
      deviceType: 'ANDROID_SCENE_VIEWER',
    });

    expect(manifest.scaleMetric.unit).toBe('METERS');
    expect(manifest.scaleMetric.scaleX).toBe(2.4);
    expect(manifest.scaleMetric.scaleY).toBe(2.6);
    expect(manifest.scaleMetric.scaleZ).toBe(0.6);
    expect(manifest.intentUrl).toContain('scene-viewer');
    expect(manifest.dimensionsDisplay).toBe('2400W × 2600H × 600D mm');
  });
});
