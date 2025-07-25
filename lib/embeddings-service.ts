import { createClient } from "@supabase/supabase-js"
import { PRODUCTS } from "@/data/products"
import { HfInference, type FeatureExtractionOutput } from "@huggingface/inference"

const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || undefined)

interface ProductEmbedding {
  id?: number
  product_id: number
  name: string
  description: string
  category: string
  brand: string
  price: number
  wholesale_price: number
  keywords: string[]
  embedding: number[] | null
}

async function generateKeywords(product: any): Promise<string[]> {
  const keywords = new Set<string>()
  const safeName = product.name || "unknown"
  const safeDescription = product.description || "no description"
  const safeCategory = product.category || "uncategorized"
  const safeBrand = product.brand || ""
  const safeUnit = product.unit || ""

  safeName
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word: string) => word.length > 2)
    .forEach((word: string) => keywords.add(word))

  safeDescription
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word: string) => word.length > 2)
    .forEach((word: string) => keywords.add(word))

  safeCategory
    .toLowerCase()
    .split(/[&,\s]+/)
    .forEach((part: string) => {
      if (part.length > 2) keywords.add(part.trim())
    })

  if (safeBrand) keywords.add(safeBrand.toLowerCase())
  if (safeUnit) keywords.add(safeUnit.toLowerCase())

  const synonymMap: { [key: string]: string[] } = {
    juice: ["drink", "beverage", "liquid", "fruit", "fresh", "natural", "maji ya matunda"],
    coffee: ["caffeine", "espresso", "latte", "cappuccino", "brew", "instant", "kahawa"],
    tea: ["chai", "herbal", "green", "black", "leaf", "bag"],
    water: ["aqua", "mineral", "spring", "pure", "bottled", "maji"],
    rice: ["grain", "basmati", "jasmine", "long grain", "short grain", "brown", "white", "mchele", "mpunga", "wali"],
  }

  Array.from(keywords).forEach((keyword) => {
    if (synonymMap[keyword]) {
      synonymMap[keyword].forEach((synonym) => keywords.add(synonym))
    }
  })

  if (safeName.toLowerCase().includes("rice") || safeDescription.toLowerCase().includes("rice")) {
    ;["aromatic", "cooking", "staple", "grain"].forEach((term) => keywords.add(term))
  }

  return Array.from(keywords).filter((keyword) => keyword.length > 1)
}

async function generateEmbedding(text: string, retries = 3): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!process.env.HUGGINGFACE_API_KEY) {
        console.warn("HUGGINGFACE_API_KEY not set, using free tier (may have rate limits)")
      }

      console.log(`Generating embedding for: "${text}" (Attempt ${attempt})`)

      const hfEmbedding: FeatureExtractionOutput = await hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: text,
      })

      let embedding: number[] = []
      if (Array.isArray(hfEmbedding)) {
        if (typeof hfEmbedding[0] === "number") {
          embedding = hfEmbedding as number[]
        } else if (Array.isArray(hfEmbedding[0])) {
          embedding = (hfEmbedding as number[][])[0]
        }
      }

      console.log(`Hugging Face embedding success for "${text}", length: ${embedding.length}`)
      return embedding
    } catch (error: any) {
      console.error(`Hugging Face embedding failed for "${text}" (Attempt ${attempt}):`, error.message)
      if (error.message.includes("Rate limit") && attempt < retries) {
        console.log(`Rate limit hit, retrying after ${attempt * 2000}ms...`)
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000))
      } else if (attempt === retries) {
        console.error(`Max retries reached for "${text}"`)
        return []
      }
    }
  }
  return []
}

export async function initializeEmbeddings(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    console.log("Attempting to fetch Hugging Face API...")
    const response = await fetch("https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2", {
      headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: "Test sentence for initialization" }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log("Hugging Face response status:", response.status)
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`)
    }

    const data = await response.json()
    if (!data) {
      throw new Error("Empty response from Hugging Face API")
    }

    console.log("Embeddings API test successful")
    return true
  } catch (error: any) {
    console.error("Local embedding initialization failed:", error.message)
    return false
  }
}

// Fast keyword search function
export async function searchProducts(query: string): Promise<{ products: any[]; context: string }> {
  try {
    console.log(`Fast searching for: "${query}"`)
    const searchQuery = query.toLowerCase().trim()

    // First try direct search in PRODUCTS array (fastest)
    const directMatches = PRODUCTS.filter((product) => {
      const searchableText =
        `${product.name} ${product.description} ${product.category} ${product.brand || ""}`.toLowerCase()
      return searchableText.includes(searchQuery) && product.inStock
    }).slice(0, 8)

    if (directMatches.length > 0) {
      return {
        products: directMatches,
        context: `Here are the available ${searchQuery} options:`,
      }
    }

    // Fallback to Supabase if no direct matches
    const { data: searchResults, error: searchError } = await supabaseAdmin
      .from("product_embeddings")
      .select("*")
      .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
      .limit(8)

    if (searchError) {
      console.error("Keyword search error:", searchError.message)
      return { products: [], context: `No products found matching "${searchQuery}".` }
    }

    const fallbackProducts = searchResults || []
    const fullProducts = PRODUCTS.filter((p) => fallbackProducts.some((fp) => fp.product_id === p.id) && p.inStock)

    return {
      products: fullProducts,
      context:
        fullProducts.length > 0
          ? `Here are the available ${searchQuery} options:`
          : `No products found matching "${searchQuery}". Try searching for something else.`,
    }
  } catch (error: any) {
    console.error("Error searching products:", error.message)
    return {
      products: [],
      context: `Error occurred while searching for "${query}". Please try again.`,
    }
  }
}

export async function getContext(query: string): Promise<string> {
  const { context } = await searchProducts(query)
  return context
}

export async function getProductRecommendations(query: string): Promise<number[]> {
  const { products } = await searchProducts(query)
  return products.map((p) => p.id)
}

export async function updateProductEmbedding(productId: number): Promise<boolean> {
  try {
    const product = PRODUCTS.find((p) => p.id === productId)
    if (!product) {
      console.error(`Product with ID ${productId} not found`)
      return false
    }

    const content = `${product.name} ${product.description} ${product.category} ${product.brand || ""}`
    const embedding = await generateEmbedding(content)

    const embeddingData: ProductEmbedding = {
      product_id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      brand: product.brand || "",
      price: product.price,
      wholesale_price: product.wholesalePrice,
      keywords: await generateKeywords(product),
      embedding: embedding.length ? embedding : null,
    }

    const { error } = await supabaseAdmin.from("product_embeddings").upsert(embeddingData, { onConflict: "product_id" })

    if (error) {
      console.error("Error updating product embedding:", error.message)
      return false
    }

    console.log(`Updated embedding for product ${productId}`)
    return true
  } catch (error: any) {
    console.error("Error updating product embedding:", error.message)
    return false
  }
}

export async function refreshAllEmbeddings(): Promise<boolean> {
  try {
    console.log("Refreshing all product embeddings...")

    const { error: deleteError } = await supabaseAdmin.from("product_embeddings").delete().neq("id", 0)

    if (deleteError) {
      console.error("Error deleting existing embeddings:", deleteError.message)
      return false
    }

    return await initializeEmbeddings()
  } catch (error: any) {
    console.error("Error refreshing embeddings:", error.message)
    return false
  }
}
