'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, OrbitControls } from '@react-three/drei';
import { ParametricWardrobe } from '@/components/3d/ParametricWardrobe';
import { computeAutoShelvesCount } from '@/components/3d/wardrobe-math';

export interface CabinetViewerProps {
  widthMm: number;
  heightMm: number;
  depthMm: number;
  doorsCount: number;
  drawersCount: number;
  shelvesCount?: number;
  carcassTextureUrl?: string | null;
  carcassColor?: string;
  shutterTextureUrl?: string | null;
  shutterColor?: string;
  roughness?: number;
  openDoors?: boolean;
  showDoors?: boolean;
  onToggleDoorOpen?: () => void;
}

/**
 * Interactive React Three Fiber 3D Canvas for real-time parametric cabinet visualization.
 */
export function CabinetViewer(props: CabinetViewerProps) {
  const effectiveShelves = props.shelvesCount ?? computeAutoShelvesCount(props.heightMm);

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-b from-stone-100 to-stone-200 shadow-inner lg:h-[560px]">
      <div className="pointer-events-none absolute start-4 top-4 z-10 flex flex-wrap gap-2">
        <span className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-sm backdrop-blur">
          {props.widthMm} × {props.heightMm} × {props.depthMm} mm
        </span>
        <span className="rounded-lg bg-amber-100/95 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm backdrop-blur">
          {effectiveShelves} Shelves · {props.doorsCount} Doors · {props.drawersCount} Drawers
        </span>
      </div>

      <Canvas shadows camera={{ position: [2.4, 1.4, 3.2], fov: 42 }}>
        <ambientLight intensity={0.65} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.15}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 2, -2]} intensity={0.35} />
        {/* Front Soft Light illuminating interior directly */}
        <directionalLight position={[0, 1.5, 4]} intensity={0.7} />

        <Suspense fallback={null}>
          <ParametricWardrobe {...props} shelvesCount={effectiveShelves} />
          <ContactShadows
            position={[0, -props.heightMm / 2000 - 0.01, 0]}
            opacity={0.35}
            scale={6}
            blur={2.2}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          minDistance={1.8}
          maxDistance={6}
          maxPolarAngle={Math.PI / 1.9}
        />
      </Canvas>
    </div>
  );
}
