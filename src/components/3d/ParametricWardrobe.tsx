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
  showDoors?: boolean; // When false, doors are removed completely to inspect inner shelves
  onToggleDoorOpen?: () => void; // Click to open / close doors interactively
}

const PANEL_THICKNESS_M = 0.018; // 18mm Egger MFC
const BACK_THICKNESS_M = 0.008;  // 8mm solid back
const PLINTH_HEIGHT_M = 0.08;    // 80mm toe-kick plinth

/**
 * Procedural Three.js / React Three Fiber parametric wardrobe model.
 * Enhanced with visible interior partitions, clothes rail, LED warm lighting, and click-to-open doors.
 */
export function ParametricWardrobe({
  widthMm,
  heightMm,
  depthMm,
  doorsCount,
  drawersCount,
  shelvesCount,
  carcassTextureUrl,
  carcassColor = '#b68b5a',
  shutterTextureUrl,
  shutterColor = '#f3f1ed',
  roughness = 0.42,
  openDoors = true,
  showDoors = true,
  onToggleDoorOpen,
}: ParametricWardrobeProps) {
  const w = widthMm / 1000;
  const h = heightMm / 1000;
  const d = depthMm / 1000;
  const t = PANEL_THICKNESS_M;

  const innerW = Math.max(0.1, w - 2 * t);
  const innerH = Math.max(0.2, h - PLINTH_HEIGHT_M - 2 * t);
  const innerD = Math.max(0.1, d - BACK_THICKNESS_M - t - 0.02);

  const effectiveShelves = shelvesCount ?? computeAutoShelvesCount(heightMm);

  // Divide interior into Left Section (Shelves + Drawers) and Right Section (Hanging Rail + Top Hat Shelf) when doors >= 2
  const hasDivider = doorsCount >= 2 && w >= 1.2;
  const leftSectionW = hasDivider ? innerW * 0.45 : innerW;
  const rightSectionW = hasDivider ? innerW - leftSectionW - t : 0;
  const leftCenterX = hasDivider ? -innerW / 2 + leftSectionW / 2 : 0;
  const rightCenterX = hasDivider ? innerW / 2 - rightSectionW / 2 : 0;
  const dividerX = hasDivider ? -innerW / 2 + leftSectionW + t / 2 : 0;

  const drawerZoneHeight = drawersCount > 0 ? Math.min(innerH * 0.35, drawersCount * 0.16) : 0;
  const shelfZoneHeight = innerH - drawerZoneHeight;

  // Shelves positions in vertical Y space
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

  // Drawer boxes positions
  const drawerPositionsY = useMemo(() => {
    if (drawersCount <= 0) return [];
    const positions: Array<{ y: number; h: number }> = [];
    const drawerH = drawerZoneHeight / drawersCount;
    const baseBottomY = PLINTH_HEIGHT_M + t;
    for (let i = 0; i < drawersCount; i++) {
      positions.push({
        y: baseBottomY + drawerH * i + drawerH / 2,
        h: Math.max(0.08, drawerH - 0.01),
      });
    }
    return positions;
  }, [drawersCount, drawerZoneHeight, t]);

  const doorWidth = (w - 0.004 * (doorsCount + 1)) / Math.max(1, doorsCount);
  const doorHeight = h - PLINTH_HEIGHT_M - 0.008;

  // Center position of shelves along Z-axis (placed right inside the cabinet so they are clearly visible)
  const interiorZ = -d / 2 + BACK_THICKNESS_M + innerD / 2;

  return (
    <group position={[0, -h / 2, 0]}>
      {/* 1. Interior Cabinet Warm LED Ambient Light (Makes interior shelves glow and crystal clear) */}
      <pointLight
        position={[0, h - t - 0.1, interiorZ + 0.1]}
        intensity={0.8}
        color="#fff4e0"
        distance={3.5}
      />

      {/* Toe-kick Plinth */}
      <mesh position={[0, PLINTH_HEIGHT_M / 2, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[w - 0.02, PLINTH_HEIGHT_M, d - 0.04]} />
        <meshStandardMaterial color="#2c2926" roughness={0.7} />
      </mesh>

      {/* Left Outer Gable Panel */}
      <mesh position={[-w / 2 + t / 2, PLINTH_HEIGHT_M + (h - PLINTH_HEIGHT_M) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[t, h - PLINTH_HEIGHT_M, d]} />
        <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
      </mesh>

      {/* Right Outer Gable Panel */}
      <mesh position={[w / 2 - t / 2, PLINTH_HEIGHT_M + (h - PLINTH_HEIGHT_M) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[t, h - PLINTH_HEIGHT_M, d]} />
        <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
      </mesh>

      {/* Top Roof Panel */}
      <mesh position={[0, h - t / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[innerW, t, d]} />
        <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
      </mesh>

      {/* Bottom Base Panel */}
      <mesh position={[0, PLINTH_HEIGHT_M + t / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[innerW, t, d]} />
        <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
      </mesh>

      {/* Back Panel */}
      <mesh position={[0, PLINTH_HEIGHT_M + (h - PLINTH_HEIGHT_M) / 2, -d / 2 + BACK_THICKNESS_M / 2]} receiveShadow>
        <boxGeometry args={[innerW, innerH, BACK_THICKNESS_M]} />
        <meshStandardMaterial color="#6e5842" roughness={0.6} />
      </mesh>

      {/* Vertical Divider Panel (Creates Left & Right compartments) */}
      {hasDivider && (
        <mesh position={[dividerX, PLINTH_HEIGHT_M + t + innerH / 2, interiorZ]} castShadow receiveShadow>
          <boxGeometry args={[t, innerH, innerD]} />
          <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
        </mesh>
      )}

      {/* --- LEFT / MAIN COMPARTMENT SHELVES --- */}
      {shelfPositionsY.map((y, idx) => (
        <mesh key={`shelf-${idx}`} position={[leftCenterX, y, interiorZ]} castShadow receiveShadow>
          <boxGeometry args={[hasDivider ? leftSectionW - 0.002 : innerW, t, innerD]} />
          <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
        </mesh>
      ))}

      {/* --- DRAWERS IN LOWER ZONE --- */}
      {(drawerPositionsY as Array<{ y: number; h: number }>).map((drawer, idx) => (
        <group key={`drawer-${idx}`} position={[leftCenterX, drawer.y, interiorZ + innerD / 2 - 0.02]}>
          {/* Drawer Front Face */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[(hasDivider ? leftSectionW : innerW) - 0.015, drawer.h, t]} />
            <MaterialTexture textureUrl={shutterTextureUrl} fallbackColor={shutterColor} roughness={roughness} />
          </mesh>
          {/* Drawer Handle */}
          <mesh position={[0, 0, t / 2 + 0.006]}>
            <boxGeometry args={[0.12, 0.014, 0.015]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* --- RIGHT COMPARTMENT: HANGING RAIL + TOP HAT SHELF (when divided) --- */}
      {hasDivider && (
        <group>
          {/* Top Hat Shelf */}
          <mesh position={[rightCenterX, h - t - 0.35, interiorZ]} castShadow receiveShadow>
            <boxGeometry args={[rightSectionW - 0.002, t, innerD]} />
            <MaterialTexture textureUrl={carcassTextureUrl} fallbackColor={carcassColor} roughness={roughness} />
          </mesh>

          {/* Chrome Clothes Hanging Rail */}
          <mesh
            position={[rightCenterX, h - t - 0.42, interiorZ]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.012, 0.012, rightSectionW - 0.02, 16]} />
            <meshStandardMaterial color="#e4e4e7" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Hanging Clothes Silhouette Cards */}
          {[-0.14, 0, 0.14].map((offsetX, cIdx) => (
            <mesh
              key={`cloth-${cIdx}`}
              position={[rightCenterX + offsetX, h - t - 0.78, interiorZ]}
              castShadow
            >
              <boxGeometry args={[0.04, 0.65, 0.32]} />
              <meshStandardMaterial color={cIdx === 0 ? '#1e293b' : cIdx === 1 ? '#d4af37' : '#475569'} roughness={0.8} />
            </mesh>
          ))}
        </group>
      )}

      {/* --- FRONT HINGED DOORS (Interactive Click-to-Open & Hide Support) --- */}
      {showDoors &&
        Array.from({ length: doorsCount }).map((_, idx) => {
          const isRightSide = idx >= doorsCount / 2;
          const xCenter = -w / 2 + 0.004 + doorWidth / 2 + idx * (doorWidth + 0.004);
          const hingeOffset = isRightSide ? doorWidth / 2 : -doorWidth / 2;

          // When openDoors is true, swing open to 85 degrees (1.48 rad) so interior shelves are 100% visible
          const swingAngle = openDoors ? (isRightSide ? 1.48 : -1.48) : 0;

          return (
            <group
              key={`door-${idx}`}
              position={[xCenter + hingeOffset, PLINTH_HEIGHT_M + doorHeight / 2, d / 2 + t / 2]}
              rotation={[0, swingAngle, 0]}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleDoorOpen) onToggleDoorOpen();
              }}
            >
              {/* Door Panel */}
              <mesh position={[-hingeOffset, 0, 0]} castShadow receiveShadow>
                <boxGeometry args={[doorWidth, doorHeight, t]} />
                <MaterialTexture textureUrl={shutterTextureUrl} fallbackColor={shutterColor} roughness={roughness} />
              </mesh>

              {/* Brushed Chrome Handle */}
              <mesh
                position={[
                  -hingeOffset + (isRightSide ? -doorWidth / 2 + 0.035 : doorWidth / 2 - 0.035),
                  0,
                  t / 2 + 0.008,
                ]}
              >
                <boxGeometry args={[0.012, 0.32, 0.016]} />
                <meshStandardMaterial color="#a1a1aa" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}
