// Product Management Utilities
import { type Product, PRODUCTS } from "@/data/products"
import { type ProductImage, PRODUCT_IMAGES } from "@/data/product-images"

export interface ProductWithImages extends Product {
  images: ProductImage[]
  primaryImage?: ProductImage
}

export interface CategoryStats {
  category: string
  count: number
  totalValue: number
  averagePrice: number
}

// Enhanced product management functions
export const getAllProductsWithImages = (): ProductWithImages[] => {
  return PRODUCTS.map((product) => {
    const images = PRODUCT_IMAGES.filter((img) => img.productId === product.id)
    const primaryImage = images.find((img) => img.isPrimary)

    return {
      ...product,
      images,
      primaryImage,
    }
  })
}

export const getProductWithImages = (productId: number): ProductWithImages | undefined => {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) return undefined

  const images = PRODUCT_IMAGES.filter((img) => img.productId === productId)
  const primaryImage = images.find((img) => img.isPrimary)

  return {
    ...product,
    images,
    primaryImage,
  }
}

export const getCategoryStats = (): CategoryStats[] => {
  const stats: Record<string, CategoryStats> = {}

  PRODUCTS.forEach((product) => {
    if (!stats[product.category]) {
      stats[product.category] = {
        category: product.category,
        count: 0,
        totalValue: 0,
        averagePrice: 0,
      }
    }

    stats[product.category].count++
    stats[product.category].totalValue += product.price * product.stock
  })

  // Calculate average prices
  Object.values(stats).forEach((stat) => {
    const categoryProducts = PRODUCTS.filter((p) => p.category === stat.category)
    stat.averagePrice = categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length
  })

  return Object.values(stats).sort((a, b) => b.count - a.count)
}

export const getTopSellingProducts = (limit = 10): Product[] => {
  // This would typically come from sales data, for now we'll use stock levels as proxy
  return [...PRODUCTS].sort((a, b) => b.stock - a.stock).slice(0, limit)
}

export const getLowStockProducts = (threshold = 20): Product[] => {
  return PRODUCTS.filter((product) => product.stock <= threshold).sort((a, b) => a.stock - b.stock)
}

export const searchProductsAdvanced = (query: string, category?: string, priceRange?: [number, number]): Product[] => {
  let results = PRODUCTS

  // Filter by search query
  if (query) {
    const lowercaseQuery = query.toLowerCase()
    results = results.filter(
      (product) =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.brand?.toLowerCase().includes(lowercaseQuery),
    )
  }

  // Filter by category
  if (category && category !== "all") {
    results = results.filter((product) => product.category === category)
  }

  // Filter by price range
  if (priceRange) {
    results = results.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])
  }

  return results
}

export const getProductRecommendations = (productId: number, limit = 4): Product[] => {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) return []

  // Get products from same category, excluding the current product
  const sameCategory = PRODUCTS.filter((p) => p.category === product.category && p.id !== productId)

  // Get products with similar price range (±20%)
  const priceRange = product.price * 0.2
  const similarPrice = PRODUCTS.filter((p) => Math.abs(p.price - product.price) <= priceRange && p.id !== productId)

  // Combine and deduplicate
  const recommendations = [...sameCategory, ...similarPrice]
    .filter((product, index, self) => index === self.findIndex((p) => p.id === product.id))
    .slice(0, limit)

  return recommendations
}

// Product CRUD operations (for admin use)
export const addProduct = (productData: Omit<Product, "id">): Product => {
  const newId = Math.max(...PRODUCTS.map((p) => p.id)) + 1
  const newProduct: Product = {
    id: newId,
    ...productData,
  }

  PRODUCTS.push(newProduct)
  return newProduct
}

export const updateProduct = (productId: number, updates: Partial<Product>): Product | null => {
  const index = PRODUCTS.findIndex((p) => p.id === productId)
  if (index === -1) return null

  PRODUCTS[index] = { ...PRODUCTS[index], ...updates }
  return PRODUCTS[index]
}

export const deleteProduct = (productId: number): boolean => {
  const index = PRODUCTS.findIndex((p) => p.id === productId)
  if (index === -1) return false

  PRODUCTS.splice(index, 1)
  return true
}

export const updateProductStock = (productId: number, newStock: number): boolean => {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) return false

  product.stock = newStock
  return true
}

// Bulk operations
export const bulkUpdatePrices = (categoryOrIds: string | number[], priceMultiplier: number): number => {
  let updatedCount = 0

  if (typeof categoryOrIds === "string") {
    // Update by category
    PRODUCTS.forEach((product) => {
      if (product.category === categoryOrIds) {
        product.price = Math.round(product.price * priceMultiplier)
        updatedCount++
      }
    })
  } else {
    // Update by IDs
    categoryOrIds.forEach((id) => {
      const product = PRODUCTS.find((p) => p.id === id)
      if (product) {
        product.price = Math.round(product.price * priceMultiplier)
        updatedCount++
      }
    })
  }

  return updatedCount
}

export const exportProductsToCSV = (): string => {
  const headers = ["ID", "Name", "Price", "Category", "Description", "Stock", "Unit", "Brand", "Size"]
  const rows = PRODUCTS.map((product) => [
    product.id,
    product.name,
    product.price,
    product.category,
    product.description,
    product.stock,
    product.unit,
    product.brand || "",
    product.size || "",
  ])

  const csvContent = [headers, ...rows].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

  return csvContent
}
