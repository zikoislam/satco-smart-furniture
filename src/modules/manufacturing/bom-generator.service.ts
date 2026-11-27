import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DomainRuleError, NotFoundError } from '@/lib/api/errors';
import { computeAutoShelvesCount } from '@/components/3d/wardrobe-math';

export interface GeneratedBomPart {
  id: string;
  partLabel: string;
  barcodeOpaqueToken: string;
  materialCode: string;
  cutLengthMm: number;
  cutWidthMm: number;
  thicknessMm: number;
  grainDirection: 'LENGTHWISE' | 'WIDTHWISE' | 'NONE';
  edgeBanding: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}

const PANEL_THICKNESS_MM = 18;
const BACK_THICKNESS_MM = 6;

export class BomGeneratorService {
  /**
   * Converts an order's configured furniture items into discrete panel BOM parts
   * with opaque UUID barcode tokens (BR-SEC-004: zero customer PII on factory floor).
   * Enforces BR-SEC-005 (deposit must be verified before manufacturing BOM generation).
   */
  public static async generateOrderBom(orderId: string, createdById?: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { template: true } },
          bomRevisions: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      });

      if (!order) {
        throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
      }

      if (
        order.status === 'DRAFT' ||
        order.status === 'PENDING_DEPOSIT' ||
        order.status === 'CANCELLED'
      ) {
        throw new DomainRuleError(
          'DEPOSIT_NOT_VERIFIED',
          'BR-SEC-005: Commitment deposit must be verified before generating manufacturing BOM.',
          { currentStatus: order.status },
          422
        );
      }

      const nextRevNumber = order.bomRevisions.length + 1;
      const revision = await tx.bOMRevision.create({
        data: {
          orderId: order.id,
          revisionTag: `REV-${nextRevNumber}`,
          isReleased: true,
          approvedBy: createdById ?? null,
          approvedAt: new Date(),
        },
      });

      const createdParts: GeneratedBomPart[] = [];

      for (let itemIdx = 0; itemIdx < order.items.length; itemIdx++) {
        const item = order.items[itemIdx];
        const cfg = (item.configurationJson ?? {}) as Record<string, unknown>;
        const carcassCode = String(cfg.carcass ?? 'EGG-H1180-ST37');
        const shutterCode = String(cfg.shutter ?? 'EGG-W1000-PM');
        const edgeCode = String(cfg.edgeBanding ?? 'REHAU-OAK-2MM');

        const [carcassSheet, shutterSheet, edgeBanding] = await Promise.all([
          tx.materialSheet.findUnique({ where: { code: carcassCode } }),
          tx.materialSheet.findUnique({ where: { code: shutterCode } }),
          tx.edgeBanding.findUnique({ where: { code: edgeCode } }),
        ]);

        const W = item.configuredWidthMm;
        const H = item.configuredHeightMm;
        const D = item.configuredDepthMm;
        const T = PANEL_THICKNESS_MM;

        const shelvesCount =
          typeof cfg.shelves === 'number'
            ? cfg.shelves
            : computeAutoShelvesCount(H);
        const doorsCount = typeof cfg.doors === 'number' ? cfg.doors : 2;
        const drawersCount = typeof cfg.drawers === 'number' ? cfg.drawers : 2;

        const innerW = Math.max(100, W - 2 * T);
        const innerD = Math.max(100, D - T - BACK_THICKNESS_MM);
        const plinthH = 80;
        const gableH = H - plinthH;

        const partSpecs: Array<{
          label: string;
          sheetId: string | undefined;
          materialCode: string;
          cutLengthMm: number;
          cutWidthMm: number;
          thicknessMm: number;
          grain: 'LENGTHWISE' | 'WIDTHWISE' | 'NONE';
          edges: { top: boolean; bottom: boolean; left: boolean; right: boolean };
        }> = [
          {
            label: `GABLE_LEFT_${itemIdx + 1}`,
            sheetId: carcassSheet?.id,
            materialCode: carcassCode,
            cutLengthMm: gableH,
            cutWidthMm: D,
            thicknessMm: T,
            grain: 'LENGTHWISE',
            edges: { top: false, bottom: false, left: true, right: false },
          },
          {
            label: `GABLE_RIGHT_${itemIdx + 1}`,
            sheetId: carcassSheet?.id,
            materialCode: carcassCode,
            cutLengthMm: gableH,
            cutWidthMm: D,
            thicknessMm: T,
            grain: 'LENGTHWISE',
            edges: { top: false, bottom: false, left: true, right: false },
          },
          {
            label: `TOP_PANEL_${itemIdx + 1}`,
            sheetId: carcassSheet?.id,
            materialCode: carcassCode,
            cutLengthMm: innerW,
            cutWidthMm: D,
            thicknessMm: T,
            grain: 'LENGTHWISE',
            edges: { top: true, bottom: false, left: false, right: false },
          },
          {
            label: `BOTTOM_PANEL_${itemIdx + 1}`,
            sheetId: carcassSheet?.id,
            materialCode: carcassCode,
            cutLengthMm: innerW,
            cutWidthMm: D,
            thicknessMm: T,
            grain: 'LENGTHWISE',
            edges: { top: true, bottom: false, left: false, right: false },
          },
          {
            label: `BACK_PANEL_${itemIdx + 1}`,
            sheetId: carcassSheet?.id,
            materialCode: carcassCode,
            cutLengthMm: H - plinthH - 2 * T,
            cutWidthMm: innerW,
            thicknessMm: BACK_THICKNESS_MM,
            grain: 'NONE',
            edges: { top: false, bottom: false, left: false, right: false },
          },
          {
            label: `PLINTH_FRONT_${itemIdx + 1}`,
            sheetId: carcassSheet?.id,
            materialCode: carcassCode,
            cutLengthMm: innerW,
            cutWidthMm: plinthH,
            thicknessMm: T,
            grain: 'LENGTHWISE',
            edges: { top: true, bottom: false, left: false, right: false },
          },
        ];

        for (let s = 1; s <= shelvesCount; s++) {
          partSpecs.push({
            label: `SHELF_${itemIdx + 1}_${String(s).padStart(2, '0')}`,
            sheetId: carcassSheet?.id,
            materialCode: carcassCode,
            cutLengthMm: innerW - 2,
            cutWidthMm: innerD,
            thicknessMm: T,
            grain: 'LENGTHWISE',
            edges: { top: true, bottom: false, left: false, right: false },
          });
        }

        const doorW = Math.floor((W - 4 * (doorsCount + 1)) / Math.max(1, doorsCount));
        const doorH = H - plinthH - 6;
        for (let d = 1; d <= doorsCount; d++) {
          partSpecs.push({
            label: `DOOR_${itemIdx + 1}_${String(d).padStart(2, '0')}`,
            sheetId: shutterSheet?.id,
            materialCode: shutterCode,
            cutLengthMm: doorH,
            cutWidthMm: doorW,
            thicknessMm: T,
            grain: 'LENGTHWISE',
            edges: { top: true, bottom: true, left: true, right: true },
          });
        }

        for (let dr = 1; dr <= drawersCount; dr++) {
          partSpecs.push({
            label: `DRAWER_FRONT_${itemIdx + 1}_${String(dr).padStart(2, '0')}`,
            sheetId: shutterSheet?.id,
            materialCode: shutterCode,
            cutLengthMm: innerW - 10,
            cutWidthMm: 170,
            thicknessMm: T,
            grain: 'LENGTHWISE',
            edges: { top: true, bottom: true, left: true, right: true },
          });
        }

        for (const spec of partSpecs) {
          const opaqueToken = randomUUID();
          const bomRow = await tx.bOMItem.create({
            data: {
              orderItemId: item.id,
              bomRevisionId: revision.id,
              partType: 'PANEL',
              partLabel: spec.label,
              barcodeOpaqueToken: opaqueToken,
              materialSheetId: spec.sheetId,
              edgeBandingId: edgeBanding?.id,
              grainDirection: spec.grain,
              cutLengthMm: spec.cutLengthMm.toFixed(2),
              cutWidthMm: spec.cutWidthMm.toFixed(2),
              thicknessMm: spec.thicknessMm.toFixed(2),
              edgeTop: spec.edges.top,
              edgeBottom: spec.edges.bottom,
              edgeLeft: spec.edges.left,
              edgeRight: spec.edges.right,
              cncOperationsJson: {
                hingeCups: spec.label.startsWith('DOOR') ? (H > 2000 ? 4 : 3) : 0,
                dowelHoles: 4,
              } as Prisma.InputJsonValue,
              quantity: item.quantity,
            },
          });

          createdParts.push({
            id: bomRow.id,
            partLabel: bomRow.partLabel,
            barcodeOpaqueToken: bomRow.barcodeOpaqueToken,
            materialCode: spec.materialCode,
            cutLengthMm: spec.cutLengthMm,
            cutWidthMm: spec.cutWidthMm,
            thicknessMm: spec.thicknessMm,
            grainDirection: spec.grain,
            edgeBanding: spec.edges,
          });
        }
      }

      return {
        orderId: order.id,
        revisionId: revision.id,
        revisionTag: revision.revisionTag,
        totalPartsCount: createdParts.length,
        bomItems: createdParts,
      };
    });
  }
}
