'use client';

import React, { useState } from 'react';
import { ARModelManifest } from '@/modules/ar/ar.service';

interface ARViewerButtonProps {
  templateId: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  finishMaterial: string;
}

export const ARViewerButton: React.FC<ARViewerButtonProps> = ({
  templateId,
  widthMm,
  heightMm,
  depthMm,
  finishMaterial,
}) => {
  const [manifest, setManifest] = useState<ARModelManifest | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLaunchAR = async () => {
    setIsLoading(true);
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      const deviceType = isIOS
        ? 'IOS_QUICKLOOK'
        : isAndroid
        ? 'ANDROID_SCENE_VIEWER'
        : 'WEBXR_FALLBACK';

      const res = await fetch('/api/v1/ar/manifest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId,
          widthMm,
          heightMm,
          depthMm,
          finishMaterial,
          deviceType,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setManifest(data.data);

        // If Android or iOS, handle native trigger
        if (isAndroid && data.data.intentUrl) {
          window.location.href = data.data.intentUrl;
        }
      }
    } catch (err) {
      console.error('Failed to trigger AR session', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleLaunchAR}
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition"
      >
        <span>📱</span>
        <span>{isLoading ? 'جاري معايرة 1:1 AR...' : 'معاينة في غرفتك (واقع معزز 1:1 AR)'}</span>
      </button>

      {manifest && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
          <div className="flex justify-between text-slate-300 font-semibold">
            <span>المقياس الحقيقي (Calibration):</span>
            <span className="text-amber-400">{manifest.dimensionsDisplay}</span>
          </div>
          <p className="text-[11px] text-slate-400">{manifest.instructions.ar}</p>
        </div>
      )}
    </div>
  );
};
