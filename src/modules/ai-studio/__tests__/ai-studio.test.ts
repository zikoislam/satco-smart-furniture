import { NextRequest } from 'next/server';
import { POST as generateHandler } from '@/app/api/v1/ai-studio/generate/route';
import { POST as confirmMeasurementsHandler } from '@/app/api/v1/ai-studio/confirm-measurements/route';
import { aiService } from '@/modules/ai-studio/ai-studio.service';
import { signAccessToken } from '@/modules/auth/jwt.service';

const TEST_CUSTOMER_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('AI Design Studio & Generative Vision Module (BR-AI-001 & BR-AI-002)', () => {
  let authToken: string;

  beforeAll(() => {
    const { accessToken } = signAccessToken({
      sub: TEST_CUSTOMER_ID,
      role: 'CUSTOMER',
      companyId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    });
    authToken = accessToken;
  });

  it('generates an advisory room concept with watermark and catalog matching (BR-AI-001)', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/ai-studio/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomType: 'BEDROOM',
        interiorStyle: 'NEOCLASSICAL_SAUDI',
        budgetTier: 'LUXURY',
        userPrompt: 'نحتاج دريسنج روم مع إنارة ليد دافئة ولمسات برونزية',
      }),
    });

    const res = await generateHandler(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.conceptId).toBeDefined();
    expect(body.data.roomType).toBe('BEDROOM');
    expect(body.data.interiorStyle).toBe('NEOCLASSICAL_SAUDI');

    // Advisory and regulatory watermark checks (BR-AI-001)
    expect(body.data.watermarkText).toContain('ADVISORY CONCEPT');
    expect(body.data.advisoryDisclaimerAr).toBeDefined();
    expect(body.data.mandatoryMeasurementConfirmationRequired).toBe(true);

    // Matched Catalog & Pricing
    expect(body.data.matchedFurnitureItems.length).toBeGreaterThan(0);
    expect(body.data.estimatedTotalSar).toBeGreaterThan(0);
    expect(body.data.visualizationImageUri).toContain('data:image/svg+xml');
  });

  it('rejects invalid room types or empty input payload', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/ai-studio/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomType: 'INVALID_ROOM_TYPE',
        interiorStyle: 'MODERN_MINIMALIST',
      }),
    });

    const res = await generateHandler(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });

  it('mandates real physical room measurement confirmation before quotation gate (BR-AI-002)', async () => {
    // 1. Generate Concept
    const genResult = await aiService.generateRoomConcept({
      roomType: 'MAJLIS',
      interiorStyle: 'NEOCLASSICAL_SAUDI',
      budgetTier: 'PREMIUM',
    });

    // 2. Submit Measurement Confirmation with valid JWT
    const confirmReq = new NextRequest(
      'http://localhost:3000/api/v1/ai-studio/confirm-measurements',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          conceptId: genResult.conceptId,
          confirmedByCustomer: true,
          wallWidthMm: 4500,
          wallLengthMm: 6000,
          ceilingHeightMm: 3100,
          obstructions: [
            {
              type: 'DOOR',
              positionFromLeftMm: 500,
              widthMm: 1000,
              heightMm: 2200,
            },
          ],
        }),
      }
    );

    const confirmRes = await confirmMeasurementsHandler(confirmReq);
    const confirmBody = await confirmRes.json();

    expect(confirmRes.status).toBe(200);
    expect(confirmBody.success).toBe(true);
    expect(confirmBody.data.verifiedForQuotation).toBe(true);
    expect(confirmBody.data.confirmationId).toBeDefined();
  });

  it('rejects confirmation without authentication token', async () => {
    const confirmReq = new NextRequest(
      'http://localhost:3000/api/v1/ai-studio/confirm-measurements',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conceptId: '00000000-0000-0000-0000-000000000000',
          confirmedByCustomer: true,
          wallWidthMm: 4000,
          wallLengthMm: 5000,
          ceilingHeightMm: 3000,
        }),
      }
    );

    const confirmRes = await confirmMeasurementsHandler(confirmReq);
    const confirmBody = await confirmRes.json();

    expect(confirmRes.status).toBe(401);
    expect(confirmBody.success).toBe(false);
  });
});
