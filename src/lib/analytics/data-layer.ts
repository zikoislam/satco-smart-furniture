export interface Ga4EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity: number;
}

export interface DataLayerEvent {
  event: string;
  ecommerce?: {
    currency: 'SAR';
    value?: number;
    transaction_id?: string;
    tax?: number;
    items: Ga4EcommerceItem[];
  };
  [key: string]: unknown;
}

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export function pushToDataLayer(payload: DataLayerEvent): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);
}

export function pushConfiguratorInteraction(params: {
  templateSlug: string;
  widthMm: number;
  heightMm: number;
  depthMm: number;
  carcassCode: string;
  shutterCode: string;
}): void {
  pushToDataLayer({
    event: 'configurator_interaction',
    template_slug: params.templateSlug,
    width_mm: params.widthMm,
    height_mm: params.heightMm,
    depth_mm: params.depthMm,
    carcass_material: params.carcassCode,
    shutter_material: params.shutterCode,
  });
}

export function pushAddToCart(item: Ga4EcommerceItem): void {
  pushToDataLayer({
    event: 'add_to_cart',
    ecommerce: {
      currency: 'SAR',
      value: Number((item.price * item.quantity).toFixed(2)),
      items: [item],
    },
  });
}

export function pushPurchase(params: {
  transactionId: string;
  valueSar: number;
  vatSar: number;
  items: Ga4EcommerceItem[];
}): void {
  pushToDataLayer({
    event: 'purchase',
    ecommerce: {
      currency: 'SAR',
      transaction_id: params.transactionId,
      value: params.valueSar,
      tax: params.vatSar,
      items: params.items,
    },
  });
}
