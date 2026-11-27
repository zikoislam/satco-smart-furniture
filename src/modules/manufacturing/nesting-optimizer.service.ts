import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { DomainRuleError, NotFoundError } from '@/lib/api/errors';

export const NestJobSchema = z.object({
  orderId: z.string().uuid(),
  sheetMaterialId: z.string().uuid(),
  bladeKerfMm: z.number().min(0).max(15).default(4.5),
  trimMarginMm: z.number().min(0).max(50).default(10.0),
});

export interface NestPanelInput {
  id: string;
  partLabel: string;
  barcodeOpaqueToken: string;
  lengthMm: number;
  widthMm: number;
  grainLocked: boolean;
}

export interface PlacedPanel {
  bomItemId: string;
  partLabel: string;
  barcodeOpaqueToken: string;
  sheetIndex: number;
  xMm: number;
  yMm: number;
  lengthMm: number;
  widthMm: number;
  rotated: boolean;
}

export interface NestingComputationResult {
  totalSheetsUsed: number;
  efficiencyRate: number;
  wastePercentage: number;
  totalScrapSqm: number;
  placements: PlacedPanel[];
}

const STANDARD_SHEET_LENGTH_MM = 2440;
const STANDARD_SHEET_WIDTH_MM = 1220;

export class NestingOptimizerService {
  /**
   * Pure 2D Guillotine / Shelf-packing algorithm onto 2440x1220mm raw sheets.
   * Grain-locked panels are never rotated.
   */
  public static computeGuillotine2D(
    panels: NestPanelInput[],
    sheetLengthMm = STANDARD_SHEET_LENGTH_MM,
    sheetWidthMm = STANDARD_SHEET_WIDTH_MM,
    bladeKerfMm = 4.5,
    trimMarginMm = 10.0
  ): NestingComputationResult {
    const usableL = sheetLengthMm - 2 * trimMarginMm;
    const usableW = sheetWidthMm - 2 * trimMarginMm;

    // Sort tallest/longest panels first for tighter shelf packing
    const sorted = [...panels].sort(
      (a, b) => b.lengthMm * b.widthMm - a.lengthMm * a.widthMm
    );

    type Shelf = { y: number; height: number; cursorX: number };
    type Sheet = { index: number; shelves: Shelf[]; cursorY: number };

    const sheets: Sheet[] = [];
    const placements: PlacedPanel[] = [];
    let usedAreaMm2 = 0;

    const createSheet = (): Sheet => {
      const sheet: Sheet = { index: sheets.length + 1, shelves: [], cursorY: trimMarginMm };
      sheets.push(sheet);
      return sheet;
    };

    for (const panel of sorted) {
      let pLen = panel.lengthMm;
      let pWid = panel.widthMm;
      let rotated = false;

      // Only rotate if NOT grain-locked and rotation helps fit
      if (!panel.grainLocked && pLen > usableL && pWid <= usableL && pLen <= usableW) {
        [pLen, pWid] = [pWid, pLen];
        rotated = true;
      }

      if (pLen > usableL || pWid > usableW) {
        throw new DomainRuleError(
          'PANEL_EXCEEDS_SHEET_DIMENSIONS',
          `Panel ${panel.partLabel} (${pLen}x${pWid}mm) exceeds usable sheet (${usableL}x${usableW}mm)`,
          undefined,
          422
        );
      }

      let placed = false;

      for (const sheet of sheets) {
        for (const shelf of sheet.shelves) {
          const fitsNormal =
            pWid <= shelf.height &&
            shelf.cursorX + pLen <= sheetLengthMm - trimMarginMm;

          if (fitsNormal) {
            placements.push({
              bomItemId: panel.id,
              partLabel: panel.partLabel,
              barcodeOpaqueToken: panel.barcodeOpaqueToken,
              sheetIndex: sheet.index,
              xMm: shelf.cursorX,
              yMm: shelf.y,
              lengthMm: pLen,
              widthMm: pWid,
              rotated,
            });
            shelf.cursorX += pLen + bladeKerfMm;
            usedAreaMm2 += pLen * pWid;
            placed = true;
            break;
          }

          // Try rotating on existing shelf only if not grain-locked
          if (
            !panel.grainLocked &&
            pLen <= shelf.height &&
            shelf.cursorX + pWid <= sheetLengthMm - trimMarginMm
          ) {
            placements.push({
              bomItemId: panel.id,
              partLabel: panel.partLabel,
              barcodeOpaqueToken: panel.barcodeOpaqueToken,
              sheetIndex: sheet.index,
              xMm: shelf.cursorX,
              yMm: shelf.y,
              lengthMm: pWid,
              widthMm: pLen,
              rotated: true,
            });
            shelf.cursorX += pWid + bladeKerfMm;
            usedAreaMm2 += pLen * pWid;
            placed = true;
            break;
          }
        }

        if (placed) break;

        // Open a new shelf on this sheet if vertical space remains
        if (sheet.cursorY + pWid <= sheetWidthMm - trimMarginMm) {
          const newShelf: Shelf = {
            y: sheet.cursorY,
            height: pWid,
            cursorX: trimMarginMm + pLen + bladeKerfMm,
          };
          sheet.shelves.push(newShelf);
          sheet.cursorY += pWid + bladeKerfMm;
          placements.push({
            bomItemId: panel.id,
            partLabel: panel.partLabel,
            barcodeOpaqueToken: panel.barcodeOpaqueToken,
            sheetIndex: sheet.index,
            xMm: trimMarginMm,
            yMm: newShelf.y,
            lengthMm: pLen,
            widthMm: pWid,
            rotated,
          });
          usedAreaMm2 += pLen * pWid;
          placed = true;
          break;
        }
      }

      if (!placed) {
        const sheet = createSheet();
        const newShelf: Shelf = {
          y: sheet.cursorY,
          height: pWid,
          cursorX: trimMarginMm + pLen + bladeKerfMm,
        };
        sheet.shelves.push(newShelf);
        sheet.cursorY += pWid + bladeKerfMm;
        placements.push({
          bomItemId: panel.id,
          partLabel: panel.partLabel,
          barcodeOpaqueToken: panel.barcodeOpaqueToken,
          sheetIndex: sheet.index,
          xMm: trimMarginMm,
          yMm: newShelf.y,
          lengthMm: pLen,
          widthMm: pWid,
          rotated,
        });
        usedAreaMm2 += pLen * pWid;
      }
    }

    const totalSheetsUsed = sheets.length;
    const totalSheetAreaMm2 = totalSheetsUsed * sheetLengthMm * sheetWidthMm;
    const efficiencyRate =
      totalSheetAreaMm2 > 0 ? usedAreaMm2 / totalSheetAreaMm2 : 0;
    const wastePercentage = 1 - efficiencyRate;
    const totalScrapSqm = (totalSheetAreaMm2 - usedAreaMm2) / 1_000_000;

    return {
      totalSheetsUsed,
      efficiencyRate,
      wastePercentage,
      totalScrapSqm,
      placements,
    };
  }

  /**
   * Executes Guillotine-2D nesting for an order's BOM panels on a given sheet material,
   * records a CuttingJob (`NESTED`), and queues a Homag CNCMachineJob (`QUEUED`).
   */
  public static async nestOrderJob(rawInput: z.infer<typeof NestJobSchema>) {
    const input = NestJobSchema.parse(rawInput);

    const [sheetMaterial, bomItems] = await Promise.all([
      prisma.materialSheet.findUnique({ where: { id: input.sheetMaterialId } }),
      prisma.bOMItem.findMany({
        where: {
          orderItem: { orderId: input.orderId },
          partType: 'PANEL',
        },
      }),
    ]);

    if (!sheetMaterial) {
      throw new NotFoundError('Material sheet not found', 'MATERIAL_NOT_FOUND');
    }

    const matchingPanels = bomItems.filter(
      (b) => !b.materialSheetId || b.materialSheetId === sheetMaterial.id
    );

    if (matchingPanels.length === 0) {
      throw new DomainRuleError(
        'NO_BOM_PANELS_FOUND',
        'No BOM panel parts found for this order and material sheet. Generate BOM first.',
        undefined,
        422
      );
    }

    const nestInputs: NestPanelInput[] = [];
    for (const item of matchingPanels) {
      for (let q = 0; q < item.quantity; q++) {
        nestInputs.push({
          id: item.id,
          partLabel: item.partLabel,
          barcodeOpaqueToken: item.barcodeOpaqueToken,
          lengthMm: Number(item.cutLengthMm ?? 600),
          widthMm: Number(item.cutWidthMm ?? 400),
          grainLocked: item.grainDirection !== 'NONE',
        });
      }
    }

    const sheetL = Number(sheetMaterial.lengthMm ?? STANDARD_SHEET_LENGTH_MM);
    const sheetW = Number(sheetMaterial.widthMm ?? STANDARD_SHEET_WIDTH_MM);
    const result = this.computeGuillotine2D(
      nestInputs,
      sheetL,
      sheetW,
      input.bladeKerfMm,
      input.trimMarginMm
    );

    return prisma.$transaction(async (tx) => {
      const cuttingJob = await tx.cuttingJob.create({
        data: {
          orderId: input.orderId,
          sheetMaterialId: sheetMaterial.id,
          nestingAlgorithm: 'Guillotine-2D',
          efficiencyRate: result.efficiencyRate.toFixed(4),
          totalSheetsUsed: result.totalSheetsUsed,
          wastePercentage: result.wastePercentage.toFixed(4),
          cuttingPatternJson: {
            bladeKerfMm: input.bladeKerfMm,
            trimMarginMm: input.trimMarginMm,
            placements: result.placements,
          } as unknown as Prisma.InputJsonValue,
          status: 'NESTED',
        },
      });

      const programNumber = `SATCO_PRG_${cuttingJob.id.slice(0, 8).toUpperCase()}`;
      const mprHeader = [
        '[H',
        'VERSION="4.0 Alpha"',
        `PROGRAM="${programNumber}"`,
        `MATERIAL="${sheetMaterial.code}"`,
        `SHEETS="${result.totalSheetsUsed}"`,
        ...result.placements.map(
          (p) =>
            `<100 \\Panel\\ PART="${p.partLabel}" TOKEN="${p.barcodeOpaqueToken}" SHEET="${p.sheetIndex}" X="${p.xMm}" Y="${p.yMm}" L="${p.lengthMm}" W="${p.widthMm}" ROT="${p.rotated ? 1 : 0}" />`
        ),
        '!',
      ].join('\n');

      const cncJob = await tx.cNCMachineJob.create({
        data: {
          cuttingJobId: cuttingJob.id,
          machineModel: 'Homag Centateq / Sawteq',
          programNumber,
          mprWoodwopCode: mprHeader,
          status: 'QUEUED',
        },
      });

      return {
        cuttingJobId: cuttingJob.id,
        cncJobId: cncJob.id,
        programNumber,
        totalSheetsUsed: result.totalSheetsUsed,
        efficiencyRate: result.efficiencyRate.toFixed(4),
        wastePercentage: result.wastePercentage.toFixed(4),
        totalScrapSqm: result.totalScrapSqm.toFixed(3),
        status: cuttingJob.status,
      };
    });
  }
}
