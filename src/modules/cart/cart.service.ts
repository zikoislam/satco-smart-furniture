import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  Decimal,
  toDecimal,
  calculateZatcaVat,
  calculateGrandTotal,
} from '@/lib/decimal';
import { ConfiguratorParametricInputSchema } from '@/lib/validation/saudi-validators';
import { PricingEngineService } from '@/modules/pricing/pricing.service';
import {
  DomainRuleError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '@/lib/api/errors';

const CART_TTL_DAYS = 14;

export const AddCartItemSchema = z.object({
  templateId: z.string().uuid(),
  configuredWidthMm: z.number().int().min(400).max(3600),
  configuredHeightMm: z.number().int().min(600).max(3200),
  configuredDepthMm: z.number().int().min(300).max(1000),
  configurationJson: z.object({
    carcass: z.string().min(1),
    shutter: z.string().min(1),
    edgeBanding: z.string().min(1).default('REHAU-OAK-2MM'),
    shelves: z.number().int().min(0).max(20).default(3),
    drawers: z.number().int().min(0).max(10).default(0),
    doors: z.number().int().min(1).max(6).default(2),
    hasLighting: z.boolean().default(false),
    hasSoftClose: z.boolean().default(true),
  }),
  quantity: z.number().int().min(1).max(50).default(1),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(50),
});

export interface CartIdentity {
  userId?: string;
  sessionId?: string;
}

function getCartExpiry(): Date {
  return new Date(Date.now() + CART_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export class CartService {
  /**
   * Resolves or creates the active cart for a guest (`sessionId`) or authenticated user (`userId`).
   * If both are present, automatically merges any guest cart items into the user's cart.
   */
  public static async resolveOrCreateCart(identity: CartIdentity) {
    if (!identity.userId && !identity.sessionId) {
      throw new ValidationError(
        'Either Authorization Bearer token or X-Session-ID header is required',
        undefined,
        'CART_IDENTITY_REQUIRED'
      );
    }

    if (identity.userId && identity.sessionId) {
      await this.mergeGuestCartToUser(identity.sessionId, identity.userId);
    }

    if (identity.userId) {
      const existingUserCart = await prisma.cart.findFirst({
        where: { userId: identity.userId },
        include: {
          items: {
            include: { template: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (existingUserCart) {
        return existingUserCart;
      }

      return prisma.cart.create({
        data: {
          userId: identity.userId,
          sessionId: identity.sessionId ?? `user-${identity.userId}`,
          expiresAt: getCartExpiry(),
        },
        include: {
          items: {
            include: { template: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    }

    const sessionId = identity.sessionId!;
    const existingGuestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: { template: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (existingGuestCart) {
      return existingGuestCart;
    }

    return prisma.cart.create({
      data: {
        sessionId,
        expiresAt: getCartExpiry(),
      },
      include: {
        items: {
          include: { template: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Merges a guest cart (by `sessionId`) into the authenticated user's cart on login.
   */
  public static async mergeGuestCartToUser(sessionId: string, userId: string): Promise<void> {
    const guestCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!guestCart || guestCart.userId === userId) {
      return;
    }

    if (guestCart.items.length === 0) {
      await prisma.cart.delete({ where: { id: guestCart.id } }).catch(() => undefined);
      return;
    }

    await prisma.$transaction(async (tx) => {
      let userCart = await tx.cart.findFirst({
        where: { userId },
      });

      if (!userCart) {
        // Claim the guest cart directly for the user
        await tx.cart.update({
          where: { id: guestCart.id },
          data: {
            userId,
            expiresAt: getCartExpiry(),
          },
        });
        return;
      }

      // Move all items from guestCart to userCart, then delete guestCart
      await tx.cartItem.updateMany({
        where: { cartId: guestCart.id },
        data: { cartId: userCart.id },
      });

      await tx.cart.delete({
        where: { id: guestCart.id },
      });
    });
  }

  /**
   * Formats a cart with deterministic Decimal.js totals (netSubtotal, 15% VAT, grandTotal).
   */
  public static formatCartResponse(cart: {
    id: string;
    sessionId: string;
    items: Array<{
      id: string;
      configuredWidthMm: number;
      configuredHeightMm: number;
      configuredDepthMm: number;
      configurationJson: Prisma.JsonValue;
      quantity: number;
      unitPriceSar: { toString(): string };
      totalPriceSar: { toString(): string };
      template: {
        slug: string;
        nameAr: string;
        nameEn: string;
      };
    }>;
  }) {
    let netSubtotal = new Decimal(0);
    let totalItems = 0;

    const formattedItems = cart.items.map((item) => {
      const unitNet = toDecimal(item.unitPriceSar.toString());
      const lineNet = toDecimal(item.totalPriceSar.toString());
      netSubtotal = netSubtotal.plus(lineNet);
      totalItems += item.quantity;

      return {
        id: item.id,
        templateSlug: item.template.slug,
        titleAr: item.template.nameAr,
        titleEn: item.template.nameEn,
        configuredDimensions: {
          widthMm: item.configuredWidthMm,
          heightMm: item.configuredHeightMm,
          depthMm: item.configuredDepthMm,
        },
        configurationJson: item.configurationJson,
        quantity: item.quantity,
        unitPriceSar: unitNet.toFixed(2),
        totalPriceSar: lineNet.toFixed(2),
      };
    });

    const netSubtotalRounded = netSubtotal.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const vatAmount = calculateZatcaVat(netSubtotalRounded).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    const grandTotal = calculateGrandTotal(netSubtotalRounded, vatAmount);

    return {
      cartId: cart.id,
      sessionId: cart.sessionId,
      totalItems,
      netSubtotalSar: netSubtotalRounded.toFixed(2),
      vatAmountSar: vatAmount.toFixed(2),
      grandTotalSar: grandTotal.toFixed(2),
      items: formattedItems,
    };
  }

  public static async getActiveCart(identity: CartIdentity) {
    const cart = await this.resolveOrCreateCart(identity);
    return this.formatCartResponse(cart);
  }

  /**
   * Computes deterministic unit price from active DB PricingRule + Materials
   * and adds the configured furniture item to the active cart.
   */
  public static async addItem(
    identity: CartIdentity,
    rawInput: z.infer<typeof AddCartItemSchema>
  ) {
    const input = AddCartItemSchema.parse(rawInput);

    const template = await prisma.productTemplate.findUnique({
      where: { id: input.templateId },
    });

    if (!template || !template.isActive) {
      throw new NotFoundError('Product template not found or inactive', 'TEMPLATE_NOT_FOUND');
    }

    if (
      input.configuredWidthMm < template.minWidthMm ||
      input.configuredWidthMm > template.maxWidthMm ||
      input.configuredHeightMm < template.minHeightMm ||
      input.configuredHeightMm > template.maxHeightMm ||
      input.configuredDepthMm < template.minDepthMm ||
      input.configuredDepthMm > template.maxDepthMm
    ) {
      throw new DomainRuleError(
        'DIMENSIONS_OUT_OF_BOUNDS',
        'Configured dimensions exceed template engineering limits',
        {
          widthRange: [template.minWidthMm, template.maxWidthMm],
          heightRange: [template.minHeightMm, template.maxHeightMm],
          depthRange: [template.minDepthMm, template.maxDepthMm],
        },
        422
      );
    }

    const now = new Date();
    const [activeRule, carcassSheet, shutterSheet, edgeBanding, hardwareItems] =
      await Promise.all([
        prisma.pricingRule.findFirst({
          where: {
            effectiveFrom: { lte: now },
            OR: [{ effectiveTo: null }, { effectiveTo: { gt: now } }],
          },
          orderBy: { effectiveFrom: 'desc' },
        }),
        prisma.materialSheet.findUnique({ where: { code: input.configurationJson.carcass } }),
        prisma.materialSheet.findUnique({ where: { code: input.configurationJson.shutter } }),
        prisma.edgeBanding.findUnique({ where: { code: input.configurationJson.edgeBanding } }),
        prisma.hardwareItem.findMany({ where: { isActive: true } }),
      ]);

    if (!activeRule || !carcassSheet || !shutterSheet || !edgeBanding) {
      throw new DomainRuleError(
        'REQUIRES_MANUAL_QUOTE',
        'Pricing rate or material specification unavailable; please submit a manual quote request.',
        undefined,
        422
      );
    }

    const hingeItem = hardwareItems.find((h) => h.unitType.toLowerCase().includes('hinge'));
    const runnerItem = hardwareItems.find((h) => h.unitType.toLowerCase().includes('runner'));

    if (!hingeItem || !runnerItem) {
      throw new DomainRuleError(
        'REQUIRES_MANUAL_QUOTE',
        'Hardware rate unavailable; please submit a manual quote request.',
        undefined,
        422
      );
    }

    const parametricInput = ConfiguratorParametricInputSchema.parse({
      templateId: input.templateId,
      widthMm: input.configuredWidthMm,
      heightMm: input.configuredHeightMm,
      depthMm: input.configuredDepthMm,
      carcassMaterialCode: input.configurationJson.carcass,
      shutterMaterialCode: input.configurationJson.shutter,
      edgeBandingCode: input.configurationJson.edgeBanding,
      shelvesCount: input.configurationJson.shelves,
      drawersCount: input.configurationJson.drawers,
      doorsCount: input.configurationJson.doors,
      hasLighting: input.configurationJson.hasLighting,
      hasSoftClose: input.configurationJson.hasSoftClose,
    });

    const breakdown = PricingEngineService.calculateCabinetPrice(
      parametricInput,
      {
        cuttingPerMeterSar: toDecimal(activeRule.cuttingPerMeterSar.toString()),
        edgeBandingPerMeterSar: toDecimal(activeRule.edgeBandingPerMeterSar.toString()),
        cncPerHoleSar: toDecimal(activeRule.cncPerHoleSar.toString()),
        laborMarkupRate: toDecimal(activeRule.laborMarkupRate.toString()),
        marginRate: toDecimal(activeRule.marginRate.toString()),
        vatPercentage: toDecimal(activeRule.vatPercentage.toString()),
      },
      {
        carcassSqmPriceSar: toDecimal(carcassSheet.sellingPricePerSqmSar.toString()),
        shutterSqmPriceSar: toDecimal(shutterSheet.sellingPricePerSqmSar.toString()),
        edgeBandingPerMeterSar: toDecimal(edgeBanding.sellingPricePerMeterSar.toString()),
        hingeUnitPriceSar: toDecimal(hingeItem.sellingPriceSar.toString()),
        drawerRunnerUnitPriceSar: toDecimal(runnerItem.sellingPriceSar.toString()),
      }
    );

    const cart = await this.resolveOrCreateCart(identity);
    const unitNetSar = breakdown.netSubtotalSar;
    const totalNetSar = unitNetSar.times(input.quantity).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const createdItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        templateId: input.templateId,
        configuredWidthMm: input.configuredWidthMm,
        configuredHeightMm: input.configuredHeightMm,
        configuredDepthMm: input.configuredDepthMm,
        configurationJson: input.configurationJson as Prisma.InputJsonValue,
        quantity: input.quantity,
        unitPriceSar: unitNetSar.toFixed(4),
        totalPriceSar: totalNetSar.toFixed(4),
      },
      include: { template: true },
    });

    return {
      itemId: createdItem.id,
      cartId: cart.id,
      unitPriceSar: unitNetSar.toFixed(2),
      totalPriceSar: totalNetSar.toFixed(2),
      quantity: createdItem.quantity,
    };
  }

  private static async verifyItemOwnership(itemId: string, identity: CartIdentity) {
    if (!identity.userId && !identity.sessionId) {
      throw new ValidationError(
        'Either Authorization Bearer token or X-Session-ID header is required',
        undefined,
        'CART_IDENTITY_REQUIRED'
      );
    }

    const item = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!item) {
      throw new NotFoundError('Cart item not found', 'CART_ITEM_NOT_FOUND');
    }

    const ownsByUser = Boolean(identity.userId && item.cart.userId === identity.userId);
    const ownsBySession = Boolean(identity.sessionId && item.cart.sessionId === identity.sessionId);

    if (!ownsByUser && !ownsBySession) {
      throw new ForbiddenError('You do not have permission to modify this cart item', 'FORBIDDEN');
    }

    return item;
  }

  public static async updateItemQuantity(
    itemId: string,
    identity: CartIdentity,
    rawInput: z.infer<typeof UpdateCartItemSchema>
  ) {
    const input = UpdateCartItemSchema.parse(rawInput);
    const item = await this.verifyItemOwnership(itemId, identity);

    const unitNet = toDecimal(item.unitPriceSar.toString());
    const newTotal = unitNet.times(input.quantity).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity: input.quantity,
        totalPriceSar: newTotal.toFixed(4),
      },
    });

    return {
      itemId: updated.id,
      quantity: updated.quantity,
      unitPriceSar: unitNet.toFixed(2),
      totalPriceSar: newTotal.toFixed(2),
    };
  }

  public static async removeItem(itemId: string, identity: CartIdentity) {
    await this.verifyItemOwnership(itemId, identity);
    await prisma.cartItem.delete({ where: { id: itemId } });
    return { deletedItemId: itemId };
  }
}
