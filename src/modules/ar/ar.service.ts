import { z } from 'zod';

export const ARDeviceTypeEnum = z.enum(['IOS_QUICKLOOK', 'ANDROID_SCENE_VIEWER', 'WEBXR_FALLBACK']);
export type ARDeviceType = z.infer<typeof ARDeviceTypeEnum>;

export const ARModelExportInputSchema = z.object({
  templateId: z.string(),
  widthMm: z.number().min(300).max(6000),
  heightMm: z.number().min(400).max(3200),
  depthMm: z.number().min(200).max(1200),
  finishMaterial: z.string().default('Egger Halifax Natural Oak'),
  deviceType: ARDeviceTypeEnum.default('WEBXR_FALLBACK'),
});
export type ARModelExportInput = z.infer<typeof ARModelExportInputSchema>;

export interface ARModelManifest {
  assetId: string;
  deviceType: ARDeviceType;
  modelUrl: string;
  usdzUrl?: string;
  glbUrl?: string;
  scaleMetric: {
    scaleX: number; // 1:1 scale conversion from mm to meters
    scaleY: number;
    scaleZ: number;
    unit: 'METERS';
  };
  dimensionsDisplay: string;
  intentUrl?: string;
  instructions: {
    ar: string;
    en: string;
  };
}

export class ARVisualizationService {
  public static generateARManifest(rawInput: ARModelExportInput): ARModelManifest {
    const input = ARModelExportInputSchema.parse(rawInput);
    const assetId = `ar-${input.templateId}-${Date.now()}`;

    // True 1:1 Scale Calibration: millimeter to meter conversion
    const scaleX = input.widthMm / 1000;
    const scaleY = input.heightMm / 1000;
    const scaleZ = input.depthMm / 1000;

    const glbUrl = `/api/v1/ar/models/${assetId}.glb`;
    const usdzUrl = `/api/v1/ar/models/${assetId}.usdz`;

    // Android Scene Viewer Intent Link for 1:1 AR
    const intentUrl = `intent://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(
      glbUrl
    )}&mode=ar_only&resizable=false#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;end;`;

    return {
      assetId,
      deviceType: input.deviceType,
      modelUrl: input.deviceType === 'IOS_QUICKLOOK' ? usdzUrl : glbUrl,
      usdzUrl,
      glbUrl,
      scaleMetric: {
        scaleX,
        scaleY,
        scaleZ,
        unit: 'METERS',
      },
      dimensionsDisplay: `${input.widthMm}W × ${input.heightMm}H × ${input.depthMm}D mm`,
      intentUrl,
      instructions: {
        ar: 'وجّه كاميرا هاتفك نحو الأرضية المستوية لبدء تجربة الواقع المعزز بمقياس حقيقي 1:1',
        en: 'Point your mobile camera at a flat floor to view furniture in true 1:1 scale',
      },
    };
  }
}
