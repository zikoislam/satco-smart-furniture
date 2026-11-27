'use client';

import React, { useMemo } from 'react';
import { MaterialTexture } from '@/components/3d/MaterialTexture';
import { computeAutoShelvesCount } from '@/components/3d/wardrobe-math';

export { computeAutoShelvesCount };

export interface ParametricWardrobeProps {
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
}

const PANEL_THICKNESS_M = 0.018; // 18mm Egger MFC
const BACK_THICKNESS_M = 0.006;  // 6mm HDF back
const PLINTH_HEIGHT_M = 0.08;    // 80mm toe-kick plinth

/**
 * Procedural Three.js / React Three Fiber parametric wardrobe model.
 * All dimensions are converted from millimeters to meters (mm / 1000).
 */
export function ParametricWardrobe({
  widthMm,
  heightMm,
  depthMm,
  doorsCount,
  drawersCount,
  shelvesCount,
  carcassTextureUrl,
  carcassColor = '#c8a982',
  shutterTextureUrl,
  shutterColor = '#e5ddd0',
  roughness = 0.42,
  openDoors = true,
}: ParametricWardrobeProps) {
  const w = widthMm / 1000;
  const h = heightMm / 1000;
  const d = depthMm / 1000;
  const t = PANEL_THICKNESS_M;

  const innerW = Math.max(0.1, w - 2 * t);
  const innerH = Math.max(0.2, h - PLINTH_HEIGHT_M - 2 * t);
  const innerD = Math.max(0.1, d - BACK_THICKNESS_M - t);

  const effectiveShelves = shelvesCount ?? computeAutoShelvesCount(heightMm);

  const drawerZoneHeight = drawersCount > 0 ? Math.min(innerH * 0.4, drawersCount * 0.18) : 0;
  const shelfZoneHeight = innerH - drawerZoneHeight;

  const shelfPositionsY = useMemo(() => {
    if (effectiveShelves <= 0) return [];
    const positions: number[] = [];
    const baseBottomY = PLINTH_HEIGHT_M + t + drawerZoneHeight;
    const step = shelfZoneHeight / (effectiveShelves + 1);
    for (let i = 1; i <= effectiveShelves; i++) {
      positions.push(baseBottomY + step * i);
    }
    return positions;
  }, [effectiveShelves, drawerZoneHeight, shelfZoneHeight, t]);

  const drawerPositionsY = useMemo(() => {
    if (drawersCount <= 0) return [];
    const positions: Array<{ y: number; h: number }> = [];
    const drawerH = drawerZoneHeight / drawersCount;
    const baseBottomY = PLINTH_HEIGHT_M + t;
    for (let i = 0; i < drawersCount; i++) {
      positions.push({
        y: baseBottomY + drawerH * i + drawerH / 2,
        h: Math.max(0.08, drawerH - 0.008),
      });
    }
    return positions;
  }, [drawersCount, drawerZoneHeight, t]);

  const doorWidth = (w - 0.004 * (doorsCount + 1)) / Math.max(1, doorsCount);
  const doorHeight = h - PLINTH_HEIGHT_M - 0.006;

  return (
    <group position={[0, -h / 2, 0]}>
      {/* Toe-kick Plinth */}
      <mesh position={[0, PLINTH_HEIGHT_M / 2, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.02, PLINTH_HEIGHT_M, d - 0.04]} />
        <meshStandardMaterial color="#2c2926" roughness={0.7} />
      </mesh>

      {/* Left Side Gable */}
      <mesh position={[-w / 2 + t / 2, PLINTH_HEIGHT_M + (h - PLINTH_HEIGHT_M) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[t, h - PLINTH_HEIGHT_M, d]} />
        <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
      </mesh>

      {/* Right Side Gable */}
      <mesh position={[w / 2 - t / 2, PLINTH_HEIGHT_M + (h - PLINTH_HEIGHT_M) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[t, h - PLINTH_HEIGHT_M, d]} />
        <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
      </mesh>

      {/* Top Panel */}
      <mesh position={[0, h - t / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[innerW, t, d]} />
        <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
      </mesh>

      {/* Bottom Panel */}
      <mesh position={[0, PLINTH_HEIGHT_M + t / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[innerW, t, d]} />
        <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
      </mesh>

      {/* Back Panel */}
      <mesh position={[0, PLINTH_HEIGHT_M + (h - PLINTH_HEIGHT_M) / 2, -d / 2 + BACK_THICKNESS_M / 2]} receiveShadow>
        <boxGeometry args={[innerW, innerH, BACK_THICKNESS_M]} />
        <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
      </mesh>

      {/* Parametric Shelves */}
      {shelfPositionsY.map((y, idx) => (
        <mesh key={`shelf-${idx}`} position={[0, y, BACK_THICKNESS_M / 2]} castShadow receiveShadow>
          <boxGeometry args={[innerW, t, innerD]} />
          <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
        </mesh>
      ))}

      {/* Bottom Drawers */}
      {(drawerPositionsY as Array<{ y: number; h: number }>).map((drawer, idx) => (
        <mesh key={`drawer-${idx}`} position={[0, drawer.y, d / 2 - t - 0.01]} castShadow receiveShadow>
          <boxGeometry args={[innerW - 0.01, drawer.h, t]} />
          <MaterialTexture textureUrl={shutterTextureUrl} fallbackColor={shutterColor} roughness={roughness} />
        </mesh>
      ))}

      {/* Front Hinged Doors */}
      {Array.from({ length: doorsCount }).map((_, idx) => {
        const isRightSide = idx >= doorsCount / 2;
        const xCenter = -w / 2 + 0.004 + doorWidth / 2 + idx * (doorWidth + 0.004);
        const hingeOffset = isRightSide ? doorWidth / 2 : -doorWidth / 2;
        const swingAngle = openDoors ? (isRightSide ? 0.55 : -0.55) : 0;

        return (
          <group
            key={`door-${idx}`}
            position={[xCenter + hingeOffset, PLINTH_HEIGHT_M + doorHeight / 2, d / 2 + t / 2]}
            rotation={[0, swingAngle, 0]}
          >
            <mesh position={[-hingeOffset, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[doorWidth, doorHeight, t]} />
              <MaterialTexture textureUrl={shutterTextureUrl} fallbackColor={shutterColor} roughness={roughness} />
            </mesh>
            {/* Brushed Aluminum Handle */}
            <mesh
              position={[
                -hingeOffset + (isRightSide ? -doorWidth / 2 + 0.035 : doorWidth / 2 - 0.035),
                0,
                t / 2 + 0.008,
              ]}
            >
              <boxGeometry args={[0.012, 0.28, 0.014]} />
              <meshStandardMaterial color="#a1a1aa" metalness={0.85} roughness={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
