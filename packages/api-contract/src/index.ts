export type HealthResponse = {
  status: 'ok'
  service: 'longzhen-api'
}

export type PriceMode = 'PUBLIC_PRICE' | 'LINE_OFFER' | 'CONTACT_PRICE'
export type SaleStatus = 'ON_SALE' | 'SOLD_OUT' | 'PAUSED' | 'DRAFT' | 'UNLISTED'
