import { prisma } from '@/lib/prisma';
import { toDecimal } from '@/lib/decimal';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export class MerchantFeedService {
  /**
   * Builds Google Merchant Center / Meta Catalog RSS 2.0 XML feed for active SATCO templates.
   */
  public static async generateXmlFeed(
    channel: 'google' | 'meta',
    baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://satco.sa'
  ): Promise<string> {
    const templates = await prisma.productTemplate.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: { nameEn: true, nameAr: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const itemsXml = templates
      .map((tpl) => {
        const priceSar = toDecimal(tpl.basePriceSar.toString()).toFixed(2);
        const link = `${baseUrl}/ar/configurator?template=${encodeURIComponent(tpl.slug)}`;
        const imageLink = `${baseUrl}/images/templates/${encodeURIComponent(tpl.slug)}.jpg`;
        const title = escapeXml(`${tpl.nameEn} | ${tpl.nameAr}`);
        const desc = escapeXml(
          `Custom parametric ${tpl.nameEn} (${tpl.defaultWidthMm}x${tpl.defaultHeightMm}x${tpl.defaultDepthMm}mm) manufactured in Riyadh, KSA. Includes 15% ZATCA VAT.`
        );
        const categoryName = escapeXml(tpl.category?.nameEn ?? 'Custom Furniture');

        return [
          '    <item>',
          `      <g:id>${escapeXml(tpl.id)}</g:id>`,
          `      <g:title>${title}</g:title>`,
          `      <g:description>${desc}</g:description>`,
          `      <g:link>${escapeXml(link)}</g:link>`,
          `      <g:image_link>${escapeXml(imageLink)}</g:image_link>`,
          `      <g:availability>in_stock</g:availability>`,
          `      <g:condition>new</g:condition>`,
          `      <g:price>${priceSar} SAR</g:price>`,
          `      <g:brand>SATCO Smart Furniture</g:brand>`,
          `      <g:product_type>${categoryName}</g:product_type>`,
          '    </item>',
        ].join('\n');
      })
      .join('\n');

    const channelTitle =
      channel === 'google'
        ? 'SATCO Smart Furniture - Google Merchant Feed'
        : 'SATCO Smart Furniture - Meta Catalog Feed';

    return [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
      '  <channel>',
      `    <title>${escapeXml(channelTitle)}</title>`,
      `    <link>${escapeXml(baseUrl)}</link>`,
      '    <description>Parametric Custom Furniture in Kingdom of Saudi Arabia (SAR)</description>',
      itemsXml,
      '  </channel>',
      '</rss>',
    ].join('\n');
  }
}
