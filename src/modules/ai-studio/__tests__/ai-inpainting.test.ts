import { NextRequest } from 'next/server';
import { POST as inpaintHandler } from '@/app/api/v1/ai-studio/inpaint/route';
import { AIRoomInpaintingService } from '@/modules/ai-studio/ai-inpainting.service';
import { aiService } from '@/modules/ai-studio/ai-studio.service';

describe('AI Cloud Vision & In-Painting Integration Suite', () => {
  it('detects AI vision client provider config dynamically', () => {
    const config = aiService.getVisionClientConfig();
    expect(['GEMINI', 'OPENAI', 'FALLBACK']).toContain(config.provider);
  });

  it('successfully processes room inpainting with segmentation replacement', async () => {
    const dummyBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...';
    
    const req = new NextRequest('http://localhost:3000/api/v1/ai-studio/inpaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomPhotoBase64: dummyBase64,
        roomType: 'BEDROOM',
        targetStyle: 'NEOCLASSICAL_SAUDI',
        replaceItemType: 'EMPTY_WALL',
        customDirectives: 'Replace the empty wall with a floor-to-ceiling wardrobe with vanity',
      }),
    });

    const res = await inpaintHandler(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.inpaintingId).toBeDefined();
    expect(body.data.originalImageHash).toBeDefined();
    expect(body.data.inpaintedVisualizationUri).toBeDefined();
    expect(body.data.detectedRoomFeatures.recommendedPlacementWall).toBe('MAIN_BACK_WALL');
    expect(body.data.matchedFurniturePieces.length).toBeGreaterThan(0);
  });

  it('rejects inpainting requests with missing photo payload', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/ai-studio/inpaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomType: 'BEDROOM',
        targetStyle: 'MODERN_MINIMALIST',
      }),
    });

    const res = await inpaintHandler(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
  });
});
