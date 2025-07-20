import { supabaseAdmin } from "./supabase-client"
import { PRODUCTS } from "@/data/products"

interface ProductEmbedding {
  id?: number
  product_id: number
  name: string
  description: string
  category: string
  brand?: string | null // Allow null values
  price?: number | null // Allow null values
  wholesale_price: number
  keywords: string[]
  similarity_score?: number
}

// Generate comprehensive keywords from product data
function generateKeywords(product: any): string[] {
  const keywords = new Set<string>()

  // Add name words (cleaned)
  product.name
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word: string) => word.length > 2)
    .forEach((word: string) => keywords.add(word))

  // Add description words (cleaned)
  product.description
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word: string) => word.length > 2)
    .forEach((word: string) => keywords.add(word))

  // Add category and subcategories
  const categoryParts = product.category.toLowerCase().split(/[&,\s]+/)
  categoryParts.forEach((part: string) => {
    if (part.length > 2) keywords.add(part.trim())
  })

  // Add brand if exists
  if (product.brand) {
    keywords.add(product.brand.toLowerCase())
  }

  // Add unit variations
  if (product.unit) {
    keywords.add(product.unit.toLowerCase())
  }

  // Add comprehensive synonyms and variations
  const synonymMap: { [key: string]: string[] } = {
    // Beverages
    juice: ["drink", "beverage", "liquid", "fruit", "fresh", "natural"],
    coffee: ["caffeine", "espresso", "latte", "cappuccino", "brew", "instant"],
    tea: ["chai", "herbal", "green", "black", "leaf", "bag"],
    water: ["aqua", "mineral", "spring", "pure", "bottled"],
    soda: ["soft drink", "carbonated", "fizzy", "pop"],

    // Electronics
    phone: ["mobile", "smartphone", "device", "cellular", "handset"],
    headphones: ["earphones", "earbuds", "audio", "sound", "music"],
    charger: ["cable", "adapter", "power", "usb", "charging"],

    // Food items
    milk: ["dairy", "cream", "lactose", "fresh", "long life"],
    bread: ["loaf", "slice", "wheat", "white", "brown"],
    rice: ["grain", "basmati", "jasmine", "long grain", "short grain"],
    oil: ["cooking", "kitchen", "frying", "vegetable", "olive"],

    // Personal care
    soap: ["cleaning", "wash", "hygiene", "bath", "body"],
    shampoo: ["hair", "wash", "care", "clean", "scalp"],
    toothpaste: ["dental", "teeth", "oral", "hygiene", "clean"],

    // Household
    detergent: ["washing", "laundry", "clean", "powder", "liquid"],
    tissue: ["paper", "napkin", "wipe", "soft", "absorbent"],

    // Common misspellings and variations
    juce: ["juice"],
    coffe: ["coffee"],
    tee: ["tea"],
    fone: ["phone"],
    mobil: ["mobile"],
    chager: ["charger"],
    shampo: ["shampoo"],
  }

  // Add synonyms for existing keywords
  Array.from(keywords).forEach((keyword) => {
    if (synonymMap[keyword]) {
      synonymMap[keyword].forEach((synonym) => keywords.add(synonym))
    }
  })

  // Add common search terms based on product type
  const productName = product.name.toLowerCase()
  if (productName.includes("juice") || productName.includes("drink")) {
    ;["refreshing", "thirsty", "cold", "sweet", "healthy"].forEach((term) => keywords.add(term))
  }
  if (productName.includes("phone") || productName.includes("mobile")) {
    ;["communication", "call", "text", "smart", "android", "ios"].forEach((term) => keywords.add(term))
  }
  if (productName.includes("coffee")) {
    ;["morning", "energy", "wake up", "hot", "aromatic"].forEach((term) => keywords.add(term))
  }

  return Array.from(keywords).filter((keyword) => keyword.length > 1)
}

// Initialize embeddings in Supabase
export async function initializeEmbeddings(): Promise<boolean> {
  try {
    console.log("Initializing product embeddings in Supabase...")

    // Check if embeddings already exist
    const { count } = await supabaseAdmin.from("product_embeddings").select("*", { count: "exact", head: true })

    if (count && count > 0) {
      console.log(`Found ${count} existing embeddings, skipping initialization`)
      return true
    }

    const productEmbeddings: ProductEmbedding[] = PRODUCTS.map((product) => ({
      product_id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand || null,
      price: product.price || null,
      wholesale_price: product.wholesalePrice,
      keywords: generateKeywords(product),
    }))

    // Insert embeddings in batches
    const batchSize = 100
    for (let i = 0; i < productEmbeddings.length; i += batchSize) {
      const batch = productEmbeddings.slice(i, i + batchSize)

      const { error } = await supabaseAdmin.from("product_embeddings").insert(batch)

      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
        throw error
      }
    }

    console.log(`Successfully initialized ${productEmbeddings.length} product embeddings`)
    return true
  } catch (error) {
    console.error("Error initializing embeddings:", error)
    return false
  }
}

// Search products using Supabase function
export async function searchProducts(query: string): Promise<{ products: any[]; context: string }> {
  try {
    console.log(`Searching for: "${query}"`)

    // Ensure embeddings are initialized
    await initializeEmbeddings()

    // Use the PostgreSQL function for advanced search
    const { data: searchResults, error } = await supabaseAdmin.rpc("search_products", {
      search_query: query,
      limit_count: 8,
    })

    if (error) {
      console.error("Search error:", error)
      throw error
    }

    if (!searchResults || searchResults.length === 0) {
      console.log("No products found, trying fallback search...")

      // Fallback: simple text search
      const { data: fallbackResults, error: fallbackError } = await supabaseAdmin
        .from("product_embeddings")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
        .limit(6)

      if (fallbackError) {
        console.error("Fallback search error:", fallbackError)
        return { products: [], context: "No products found matching your search." }
      }

      const fallbackProducts = fallbackResults || []
      const fullProducts = PRODUCTS.filter((p) => fallbackProducts.some((fp) => fp.product_id === p.id))

      return {
        products: fullProducts,
        context:
          fullProducts.length > 0
            ? `Found ${fullProducts.length} products using fallback search:\n${fullProducts.map((p) => `- ${p.name} (ID: ${p.id}): ${p.description} - KES ${p.wholesalePrice}`).join("\n")}`
            : "No products found matching your search.",
      }
    }

    // Get full product data
    const productIds = searchResults.map((result: any) => result.product_id)
    const fullProducts = PRODUCTS.filter((p) => productIds.includes(p.id))

    // Sort by similarity score
    const sortedProducts = fullProducts.sort((a, b) => {
      const scoreA = searchResults.find((r: any) => r.product_id === a.id)?.similarity_score || 0
      const scoreB = searchResults.find((r: any) => r.product_id === b.id)?.similarity_score || 0
      return scoreB - scoreA
    })

    // Generate context
    const context =
      sortedProducts.length > 0
        ? `Found ${sortedProducts.length} relevant products:\n${sortedProducts.map((p) => `- ${p.name} (ID: ${p.id}): ${p.description} - KES ${p.wholesalePrice}`).join("\n")}`
        : "No products found matching your search."

    console.log(`Search completed: ${sortedProducts.length} products found`)

    return { products: sortedProducts, context }
  } catch (error) {
    console.error("Error searching products:", error)
    return { products: [], context: "Error occurred while searching products." }
  }
}

// Get context for chat
export async function getContext(query: string): Promise<string> {
  const { context } = await searchProducts(query)
  return context
}

// Get product recommendations
export async function getProductRecommendations(query: string): Promise<number[]> {
  const { products } = await searchProducts(query)
  return products.map((p) => p.id)
}

// Update embeddings for a specific product
export async function updateProductEmbedding(productId: number): Promise<boolean> {
  try {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      console.error(`Product with ID ${productId} not found`)
      return false
    }

    const embedding: ProductEmbedding = {
      product_id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand || null,
      price: product.price || null,
      wholesale_price: product.wholesalePrice,
      keywords: generateKeywords(product),
    }

    const { error } = await supabaseAdmin.from("product_embeddings").upsert(embedding, { onConflict: "product_id" })

    if (error) {
      console.error("Error updating product embedding:", error)
      return false
    }

    console.log(`Updated embedding for product ${productId}`)
    return true
  } catch (error) {
    console.error("Error updating product embedding:", error)
    return false
  }
}

// Refresh all embeddings
export async function refreshAllEmbeddings(): Promise<boolean> {
  try {
    console.log("Refreshing all product embeddings...")

    // Delete existing embeddings
    const { error: deleteError } = await supabaseAdmin.from("product_embeddings").delete().neq("id", 0) // Delete all rows

    if (deleteError) {
      console.error("Error deleting existing embeddings:", deleteError)
      return false
    }

    // Reinitialize
    return await initializeEmbeddings()
  } catch (error) {
    console.error("Error refreshing embeddings:", error)
    return false
  }
}
