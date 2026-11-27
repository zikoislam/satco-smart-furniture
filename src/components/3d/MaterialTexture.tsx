'use client';

import React, { useEffect, useState } from 'react';
import * as THREE from 'three';

export interface MaterialTextureProps {
  textureUrl?: string | null;
  fallbackColor?: string;
  roughness?: number;
  metalness?: number;
}

/**
 * Loads an Egger wood/laminate texture from `textureUrl` with graceful fallback
 * to a calibrated PBR color material so offline/dev environments never crash.
 */
export function MaterialTexture({
  textureUrl,
  fallbackColor = '#c8a982',
  roughness = 0.45,
  metalness = 0.04,
}: MaterialTextureProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!textureUrl) {
      setTexture(null);
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    loader.load(
      textureUrl,
      (loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }
        loaded.wrapS = THREE.RepeatWrapping;
        loaded.wrapT = THREE.RepeatWrapping;
        loaded.colorSpace = THREE.SRGBColorSpace;
        setTexture(loaded);
      },
      undefined,
      () => {
        if (!cancelled) {
          setTexture(null);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [textureUrl]);

  return (
    <meshStandardMaterial
      map={texture ?? undefined}
      color={texture ? '#ffffff' : fallbackColor}
      roughness={roughness}
      metalness={metalness}
    />
  );
}
