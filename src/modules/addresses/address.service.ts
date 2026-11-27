import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';
import { SaudiNationalAddressSchema } from '@/lib/validation/saudi-validators';

export const CreateAddressSchema = SaudiNationalAddressSchema.extend({
  title: z.string().min(1).max(100).default('Home'),
  isDefault: z.boolean().default(false),
});

export const UpdateAddressSchema = CreateAddressSchema.partial();

export class AddressService {
  public static async listAddresses(userId: string) {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return { addresses };
  }

  public static async createAddress(
    userId: string,
    rawInput: z.infer<typeof CreateAddressSchema>
  ) {
    const input = CreateAddressSchema.parse(rawInput);

    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId,
          title: input.title,
          buildingNumber: input.buildingNumber,
          streetName: input.streetName,
          district: input.district,
          city: input.city,
          postalCode: input.postalCode,
          additionalNumber: input.additionalNumber,
          latitude: input.latitude !== undefined ? input.latitude.toFixed(8) : null,
          longitude: input.longitude !== undefined ? input.longitude.toFixed(8) : null,
          isDefault: input.isDefault,
        },
      });
    });
  }

  public static async updateAddress(
    userId: string,
    addressId: string,
    rawInput: z.infer<typeof UpdateAddressSchema>
  ) {
    const input = UpdateAddressSchema.parse(rawInput);
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing) {
      throw new NotFoundError('Address not found', 'ADDRESS_NOT_FOUND');
    }
    if (existing.userId !== userId) {
      throw new ForbiddenError('You do not own this address', 'FORBIDDEN');
    }

    return prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.buildingNumber !== undefined ? { buildingNumber: input.buildingNumber } : {}),
          ...(input.streetName !== undefined ? { streetName: input.streetName } : {}),
          ...(input.district !== undefined ? { district: input.district } : {}),
          ...(input.city !== undefined ? { city: input.city } : {}),
          ...(input.postalCode !== undefined ? { postalCode: input.postalCode } : {}),
          ...(input.additionalNumber !== undefined ? { additionalNumber: input.additionalNumber } : {}),
          ...(input.latitude !== undefined ? { latitude: input.latitude.toFixed(8) } : {}),
          ...(input.longitude !== undefined ? { longitude: input.longitude.toFixed(8) } : {}),
          ...(input.isDefault !== undefined ? { isDefault: input.isDefault } : {}),
        },
      });
    });
  }

  public static async deleteAddress(userId: string, addressId: string) {
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address) {
      throw new NotFoundError('Address not found', 'ADDRESS_NOT_FOUND');
    }
    if (address.userId !== userId) {
      throw new ForbiddenError('You do not own this address', 'FORBIDDEN');
    }

    await prisma.address.delete({ where: { id: addressId } });
    return { deletedAddressId: addressId };
  }
}
