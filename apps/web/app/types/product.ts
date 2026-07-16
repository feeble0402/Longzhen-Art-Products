export type PriceMode = 'PUBLIC_PRICE' | 'LINE_OFFER' | 'CONTACT_PRICE'
export type SaleStatus = 'ON_SALE' | 'SOLD_OUT' | 'PAUSED'

export interface PublicCategory {
  id: string
  parentId?: string | null
  name: string
  slug: string
  description?: string | null
}

export interface PublicProductImage {
  id: string
  objectKey: string
  altText: string
  width: number
  height: number
  sortOrder: number
  isPrimary: boolean
}

export interface PublicProduct {
  id: string
  sku: string
  slug: string
  name: string
  shortDescription: string
  description: string
  specifications?: Record<string, unknown> | null
  notices?: string | null
  priceMode: PriceMode
  publicPrice?: string | number
  originalPrice?: string | number | null
  saleStatus: SaleStatus
  acceptsShopee: boolean
  shopeeUrl?: string | null
  acceptsLine: boolean
  lineInquiryTemplate?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  isNew: boolean
  isFeatured: boolean
  isBestSeller: boolean
  categories: Array<{ categoryId: string; category: PublicCategory }>
  images: PublicProductImage[]
  tags: Array<{ tag: { id: string; name: string; slug: string } }>
  relatedProducts?: PublicProduct[]
}

export interface PublicProductPage {
  items: PublicProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
