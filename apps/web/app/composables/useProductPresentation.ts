import type { PublicProduct, PublicProductImage } from '~/types/product'

export function useProductPresentation() {
  const config = useRuntimeConfig()

  function imageUrl(image?: PublicProductImage): string | null {
    return image ? `${config.public.apiBaseUrl}/media/products/${image.objectKey}` : null
  }

  function primaryImage(product: PublicProduct): PublicProductImage | undefined {
    return product.images.find(image => image.isPrimary) ?? product.images[0]
  }

  function priceLabel(product: PublicProduct): string {
    if (product.priceMode === 'PUBLIC_PRICE' && product.publicPrice !== undefined) {
      return new Intl.NumberFormat('zh-TW', {
        style: 'currency', currency: 'TWD', maximumFractionDigits: 0,
      }).format(Number(product.publicPrice))
    }
    return product.priceMode === 'LINE_OFFER' ? '優惠價請洽 LINE' : '價格請洽詢'
  }

  function statusLabel(product: PublicProduct): string {
    if (product.saleStatus === 'SOLD_OUT') return '已售完'
    if (product.saleStatus === 'PAUSED') return '暫停販售'
    return '販售中'
  }

  return { imageUrl, primaryImage, priceLabel, statusLabel }
}
