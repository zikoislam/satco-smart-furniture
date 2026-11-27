import { prisma } from '@/lib/prisma';
import { ForbiddenError, NotFoundError } from '@/lib/api/errors';
import { toDecimal } from '@/lib/decimal';

function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

/**
 * Generates a lightweight, standards-compliant PDF-1.4 A4 Tax Invoice buffer
 * without requiring native Chromium/Canvas binaries.
 */
export function buildSimplePdfBuffer(lines: string[]): Buffer {
  const streamLines = [
    'BT',
    '/F1 16 Tf',
    '50 780 Td',
    `(${escapePdfText(lines[0] ?? 'SATCO ZATCA TAX INVOICE')}) Tj`,
    '/F1 11 Tf',
    ...lines.slice(1).map((line) => `0 -20 Td (${escapePdfText(line)}) Tj`),
    'ET',
  ].join('\n');

  const objects: string[] = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${Buffer.byteLength(streamLines, 'utf8')} >> stream\n${streamLines}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];

  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${obj}\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'utf8');
}

export class InvoicePdfService {
  public static async generateInvoicePdf(
    invoiceId: string,
    requesterId: string,
    requesterRole: string
  ) {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        company: true,
        order: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found', 'INVOICE_NOT_FOUND');
    }

    if (
      requesterRole === 'CUSTOMER' &&
      invoice.order.customerId !== requesterId
    ) {
      throw new ForbiddenError('You do not have access to this invoice', 'FORBIDDEN');
    }

    const lines = [
      `SATCO ZATCA PHASE 2 TAX INVOICE - ${invoice.invoiceNumber}`,
      `Seller: ${invoice.company.legalNameEn} (${invoice.company.legalNameAr})`,
      `VAT Registration: ${invoice.company.vatRegistrationNumber}`,
      `Order Number: ${invoice.order.orderNumber}`,
      `Issue Date: ${invoice.issueDate.toISOString()}`,
      `Status: ${invoice.status}`,
      `------------------------------------------------------------`,
      `Net Subtotal (SAR): ${toDecimal(invoice.subtotalSar.toString()).toFixed(2)} SAR`,
      `ZATCA VAT 15% (SAR): ${toDecimal(invoice.vatAmountSar.toString()).toFixed(2)} SAR`,
      `Grand Total (SAR): ${toDecimal(invoice.totalWithVatSar.toString()).toFixed(2)} SAR`,
      `------------------------------------------------------------`,
      `ZATCA UUID: ${invoice.zatcaUuid ?? 'PROVISIONAL'}`,
      `TLV QR (Base64): ${invoice.zatcaTlvQrBase64.slice(0, 64)}...`,
    ];

    return {
      filename: `${invoice.invoiceNumber}.pdf`,
      buffer: buildSimplePdfBuffer(lines),
    };
  }
}
