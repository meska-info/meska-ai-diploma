/**
 * Product fields shared by every Meta event that describes a diploma
 * (ViewContent, Lead, InitiateCheckout) in the browser and on the server, so
 * both copies of an event carry the same value and Shopify product ID.
 */

/** Shopify variant ID from a cart permalink, e.g. `/cart/41453348880430:1`. */
export function shopifyVariantId(checkoutUrl: string) {
  return /\/cart\/(\d+)/.exec(checkoutUrl)?.[1];
}

export function metaProductFields(diploma: {
  priceValue: number;
  currency: string;
  checkoutUrl: string;
}) {
  const variantId = shopifyVariantId(diploma.checkoutUrl);
  return {
    value: diploma.priceValue,
    currency: diploma.currency,
    ...(variantId ? { content_ids: [variantId], content_type: "product" } : {}),
  };
}
