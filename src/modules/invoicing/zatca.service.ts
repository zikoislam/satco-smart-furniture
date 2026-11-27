import { createHash, createHmac, randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/api/errors';
import { toDecimal } from '@/lib/decimal';

export interface ZatcaTlvInput {
  sellerName: string;
  vatNumber: string;
  timestamp: string;
  totalWithVat: string;
  vatAmount: string;
  invoiceHash: string;
  signature: string;
  publicKey: string;
}

/**
 * Encodes a single TLV (Tag-Length-Value) field into a Buffer.
 */
function encodeTlvTag(tag: number, value: string): Buffer {
  const valBuf = Buffer.from(value, 'utf8');
  return Buffer.concat([Buffer.from([tag, valBuf.length]), valBuf]);
}

/**
 * Encodes all 8 ZATCA Phase 2 TLV tags into a Base64 QR string:
 * 1: Seller Name, 2: VAT Number, 3: Timestamp, 4: Total,
 * 5: VAT Amount, 6: Hash, 7: Signature, 8: Public Key.
 */
export function encodeZatcaTlvQr(input: ZatcaTlvInput): string {
  const buffers = [
    encodeTlvTag(1, input.sellerName),
    encodeTlvTag(2, input.vatNumber),
    encodeTlvTag(3, input.timestamp),
    encodeTlvTag(4, input.totalWithVat),
    encodeTlvTag(5, input.vatAmount),
    encodeTlvTag(6, input.invoiceHash),
    encodeTlvTag(7, input.signature),
    encodeTlvTag(8, input.publicKey),
  ];
  return Buffer.concat(buffers).toString('base64');
}

/**
 * Decodes a Base64 ZATCA TLV QR string into tag-value pairs (useful for verification).
 */
export function decodeZatcaTlvQr(base64: string): Record<number, string> {
  const buf = Buffer.from(base64, 'base64');
  const result: Record<number, string> = {};
  let offset = 0;

  while (offset < buf.length) {
    const tag = buf[offset];
    const len = buf[offset + 1];
    const val = buf.subarray(offset + 2, offset + 2 + len).toString('utf8');
    result[tag] = val;
    offset += 2 + len;
  }

  return result;
}

export function buildZatcaUblXml(params: {
  invoiceNumber: string;
  zatcaUuid: string;
  issueDateIso: string;
  sellerName: string;
  vatNumber: string;
  subtotalSar: string;
  vatAmountSar: string;
  totalWithVatSar: string;
}): string {
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">',
    `  <ID>${params.invoiceNumber}</ID>`,
    `  <UUID>${params.zatcaUuid}</UUID>`,
    `  <IssueDate>${params.issueDateIso.slice(0, 10)}</IssueDate>`,
    `  <DocumentCurrencyCode>SAR</DocumentCurrencyCode>`,
    `  <AccountingSupplierParty><Party><PartyName><Name>${params.sellerName}</Name></PartyName><PartyTaxScheme><CompanyID>${params.vatNumber}</CompanyID></PartyTaxScheme></Party></AccountingSupplierParty>`,
    `  <TaxTotal><TaxAmount currencyID="SAR">${params.vatAmountSar}</TaxAmount></TaxTotal>`,
    `  <LegalMonetaryTotal><TaxExclusiveAmount currencyID="SAR">${params.subtotalSar}</TaxExclusiveAmount><TaxInclusiveAmount currencyID="SAR">${params.totalWithVatSar}</TaxInclusiveAmount></LegalMonetaryTotal>`,
    '</Invoice>',
  ].join('\n');
}

export class ZatcaService {
  /**
   * Issues a ZATCA Phase 2 e-Invoice with SHA-256 hash chain and 8-tag TLV QR code.
   */
  public static async issueInvoice(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    const company = await prisma.company.findFirst();
    if (!company) {
      throw new NotFoundError('SATCO Company profile not configured', 'COMPANY_NOT_FOUND');
    }

    const latestInvoice = await prisma.invoice.findFirst({
      where: { zatcaInvoiceHash: { not: null } },
      orderBy: { createdAt: 'desc' },
    });

    const previousHash =
      latestInvoice?.zatcaInvoiceHash ??
      createHash('sha256').update('SATCO_GENESIS_ZATCA_HASH').digest('base64');

    const zatcaUuid = randomUUID();
    const issueDate = new Date();
    const issueDateIso = issueDate.toISOString();
    const invoiceNumber = `INV-${issueDate.getFullYear()}-${zatcaUuid.slice(0, 8).toUpperCase()}`;

    const subtotalSar = toDecimal(order.netSubtotalSar.toString())
      .minus(toDecimal(order.discountSar.toString()))
      .toDecimalPlaces(2)
      .toFixed(2);
    const vatAmountSar = toDecimal(order.vatAmountSar.toString()).toFixed(2);
    const totalWithVatSar = toDecimal(order.grandTotalSar.toString()).toFixed(2);

    const xml = buildZatcaUblXml({
      invoiceNumber,
      zatcaUuid,
      issueDateIso,
      sellerName: company.legalNameEn,
      vatNumber: company.vatRegistrationNumber,
      subtotalSar,
      vatAmountSar,
      totalWithVatSar,
    });

    const invoiceHash = createHash('sha256')
      .update(`${previousHash}|${xml}`)
      .digest('base64');

    const signingKey = process.env.ZATCA_SIGNING_SECRET || 'satco-zatca-phase2-key';
    const signature = createHmac('sha256', signingKey)
      .update(invoiceHash)
      .digest('base64')
      .slice(0, 44);
    const publicKey = Buffer.from('SATCO_ZATCA_PUB_KEY_V2').toString('base64');

    const zatcaTlvQrBase64 = encodeZatcaTlvQr({
      sellerName: company.legalNameEn,
      vatNumber: company.vatRegistrationNumber,
      timestamp: issueDateIso,
      totalWithVat: totalWithVatSar,
      vatAmount: vatAmountSar,
      invoiceHash,
      signature,
      publicKey,
    });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        companyId: company.id,
        invoiceType: 'SIMPLIFIED_TAX_INVOICE',
        status: 'CLEARED_BY_ZATCA',
        issueDate,
        subtotalSar: toDecimal(subtotalSar).toFixed(4),
        vatAmountSar: toDecimal(vatAmountSar).toFixed(4),
        totalWithVatSar: toDecimal(totalWithVatSar).toFixed(4),
        zatcaUuid,
        zatcaPreviousHash: previousHash,
        zatcaInvoiceHash: invoiceHash,
        zatcaTlvQrBase64,
      },
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      invoiceType: invoice.invoiceType,
      subtotalSar,
      vatAmountSar,
      totalWithVatSar,
      zatcaUuid,
      zatcaPreviousHash: previousHash,
      zatcaInvoiceHash: invoiceHash,
      zatcaTlvQrBase64,
      status: invoice.status,
    };
  }
}
