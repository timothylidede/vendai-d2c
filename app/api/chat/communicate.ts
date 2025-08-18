import { PRODUCTS } from "@/data/products"
import type { Product } from "@/lib/types"

// Enhanced search configuration
const SEARCH_CONFIG = {
  MAX_RESULTS: 8,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  DEEPSEEK_TIMEOUT: 5000, // 5 second timeout for DeepSeek API
}

// Search cache interface
interface SearchCache {
  [query: string]: {
    results: Product[]
    timestamp: number
  }
}

// Agentic conversation memory
interface ConversationMemory {
  userId: string
  businessType?: 'retailer' | 'distributor'
  preferences: {
    categories: string[]
    brands: string[]
    priceRange: { min: number; max: number }
    bulkPreference: boolean
  }
  orderHistory: {
    productId: string
    quantity: number
    date: string
  }[]
  lastInteraction: string
  seasonalTrends: string[]
}

// Enhanced search intent with semantic understanding
interface SearchIntent {
  cleanQuery: string
  priceFilter?: { min?: number; max?: number }
  requiresWholesale: boolean
  requiresInStock: boolean
  boostFactors: string[]
  semanticKeywords: string[]
  category?: string
  brand?: string
  businessContext?: string
  seasonalRelevance?: boolean
}

// Agentic business intelligence
class BusinessIntelligenceAgent {
  private static readonly SEASONAL_TRENDS = {
    'december': ['beverages', 'snacks', 'cleaning-products'],
    'january': ['cleaning-products', 'personal-care---hygiene'],
    'february': ['beverages', 'snacks'],
    'march': ['beverages', 'snacks'],
    'april': ['beverages', 'snacks'],
    'may': ['beverages', 'snacks'],
    'june': ['beverages', 'snacks'],
    'july': ['beverages', 'snacks'],
    'august': ['beverages', 'snacks'],
    'september': ['beverages', 'snacks'],
    'october': ['beverages', 'snacks'],
    'november': ['beverages', 'snacks', 'cleaning-products']
  }

  private static readonly COMPLEMENTARY_PRODUCTS = {
    'beverages': ['snacks', 'cleaning-products'],
    'snacks': ['beverages', 'cleaning-products'],
    'cleaning-products': ['personal-care---hygiene', 'household-items'],
    'personal-care---hygiene': ['cleaning-products', 'household-items']
  }

  static getSeasonalRecommendations(): string[] {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase()
    return this.SEASONAL_TRENDS[currentMonth as keyof typeof this.SEASONAL_TRENDS] || []
  }

  static getComplementaryCategories(category: string): string[] {
    return this.COMPLEMENTARY_PRODUCTS[category.toLowerCase() as keyof typeof this.COMPLEMENTARY_PRODUCTS] || []
  }

  static suggestBulkPurchase(product: Product, userHistory: any[]): boolean {
    // Suggest bulk if user has ordered this product before or if it's a high-demand item
    const hasOrderedBefore = userHistory.some(order => order.productId === product.id)
    const isHighDemand = ['beverages', 'snacks', 'cleaning-products'].includes(product.category.toLowerCase())
    return hasOrderedBefore || isHighDemand
  }

  static calculateOptimalQuantity(product: Product, userHistory: any[]): number {
    const previousOrders = userHistory.filter(order => order.productId === product.id)
    if (previousOrders.length === 0) return 1
    
    const avgQuantity = previousOrders.reduce((sum, order) => sum + order.quantity, 0) / previousOrders.length
    return Math.ceil(avgQuantity * 1.2) // Suggest 20% more than average
  }
}

// Search text processor for intent recognition
class SearchTextProcessor {
  private static readonly PRICE_KEYWORDS: Record<string, { max?: number; min?: number; boost: string }> = {
    cheap: { max: 500, boost: "budget" },
    affordable: { max: 800, boost: "affordable" },
    budget: { max: 600, boost: "budget" },
    expensive: { min: 1000, boost: "premium" },
    premium: { min: 800, boost: "premium" },
    luxury: { min: 1500, boost: "luxury" },
    "low cost": { max: 600, boost: "budget" },
    "high end": { min: 1000, boost: "premium" },
  }

  private static readonly QUANTITY_KEYWORDS: Record<string, { boost: string }> = {
    bulk: { boost: "wholesale" },
    wholesale: { boost: "wholesale" },
    quantity: { boost: "wholesale" },
    large: { boost: "wholesale" },
    many: { boost: "wholesale" },
    "in bulk": { boost: "wholesale" },
    carton: { boost: "wholesale" },
    cartons: { boost: "wholesale" },
  }

  private static readonly AVAILABILITY_KEYWORDS: Record<string, { boost: string }> = {
    available: { boost: "in_stock" },
    "in stock": { boost: "in_stock" },
    "in-stock": { boost: "in_stock" },
    stock: { boost: "in_stock" },
    ready: { boost: "in_stock" },
  }

  private static readonly BUSINESS_CONTEXT_KEYWORDS: Record<string, { context: string }> = {
    shop: { context: "retailer" },
    store: { context: "retailer" },
    duka: { context: "retailer" },
    business: { context: "retailer" },
    wholesale: { context: "distributor" },
    distributor: { context: "distributor" },
    supply: { context: "distributor" },
  }

  // Extract categories and brands from the product data
  private static readonly CATEGORIES = [...new Set(PRODUCTS.map(p => p.category.toLowerCase()))]
  private static readonly BRANDS = [...new Set(PRODUCTS.map(p => p.brand?.toLowerCase()).filter(Boolean))]

  static extractSearchIntent(query: string): SearchIntent {
    const lowerQuery = query.toLowerCase()
    const boostFactors: string[] = []
    let priceFilter: { min?: number; max?: number } | undefined
    let requiresWholesale = false
    let requiresInStock = false
    let detectedCategory: string | undefined
    let detectedBrand: string | undefined
    let businessContext: string | undefined
    let seasonalRelevance = false

    // Check business context keywords
    for (const [keyword, config] of Object.entries(this.BUSINESS_CONTEXT_KEYWORDS)) {
      if (lowerQuery.includes(keyword)) {
        businessContext = config.context
        break
      }
    }

    // Check price keywords
    for (const [keyword, config] of Object.entries(this.PRICE_KEYWORDS)) {
      if (lowerQuery.includes(keyword)) {
        if (config.max !== undefined) {
          priceFilter = { ...priceFilter, max: config.max }
        }
        if (config.min !== undefined) {
          priceFilter = { ...priceFilter, min: config.min }
        }
        boostFactors.push(config.boost)
      }
    }

    // Check quantity keywords
    for (const [keyword, config] of Object.entries(this.QUANTITY_KEYWORDS)) {
      if (lowerQuery.includes(keyword)) {
        requiresWholesale = true
        boostFactors.push(config.boost)
      }
    }

    // Check availability keywords
    for (const [keyword, config] of Object.entries(this.AVAILABILITY_KEYWORDS)) {
      if (lowerQuery.includes(keyword)) {
        requiresInStock = true
        boostFactors.push(config.boost)
      }
    }

    // Detect category
    for (const category of this.CATEGORIES) {
      if (lowerQuery.includes(category)) {
        detectedCategory = category
        // Check if category is seasonally relevant
        seasonalRelevance = BusinessIntelligenceAgent.getSeasonalRecommendations().includes(category)
        break
      }
    }

    // Detect brand
    for (const brand of this.BRANDS) {
      if (brand && lowerQuery.includes(brand)) {
        detectedBrand = brand
        break
      }
    }

    const intentKeywords = [
      ...Object.keys(this.PRICE_KEYWORDS),
      ...Object.keys(this.QUANTITY_KEYWORDS),
      ...Object.keys(this.AVAILABILITY_KEYWORDS),
      ...Object.keys(this.BUSINESS_CONTEXT_KEYWORDS),
    ]

    const cleanQuery = lowerQuery
      .split(" ")
      .filter((word) => !intentKeywords.includes(word))
      .join(" ")
      .trim()

    return {
      cleanQuery: cleanQuery || query,
      priceFilter,
      requiresWholesale,
      requiresInStock,
      boostFactors,
      semanticKeywords: [],
      category: detectedCategory,
      brand: detectedBrand,
      businessContext,
      seasonalRelevance,
    }
  }

  static normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }
}

// Query cache
const queryCache: SearchCache = {}

// DeepSeek → structured params for deterministic tool calls
async function enhanceQueryWithDeepSeek(query: string): Promise<{
  keywords: string[]
  semanticMatches: string[]
  suggestions: string[]
  structured?: {
    category?: string
    brand?: string
    size?: string
    inStock?: boolean
    bulk?: boolean
  }
}> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SEARCH_CONFIG.DEEPSEEK_TIMEOUT);
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: `You translate noisy retail queries into structured product filters.
Return strict JSON: { keywords: string[], semanticMatches: string[], suggestions: string[], structured?: { category?: string, brand?: string, size?: string, inStock?: boolean, bulk?: boolean } }.
Consider Kenyan slang and Kiswahili (e.g., "soda kubwa" ≈ 500ml bottle). Do not include text outside JSON.`,
            },
            { role: "user", content: `Query: ${query}` },
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      console.log(`DeepSeek attempt ${attempt} succeeded. Response:`, content);

      try {
        const parsed = JSON.parse(content);
        return {
          keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
          semanticMatches: Array.isArray(parsed.semanticMatches) ? parsed.semanticMatches : [],
          suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
          structured: parsed.structured || undefined,
        };
      } catch {
        console.warn(`DeepSeek attempt ${attempt}: Failed to parse JSON, extracting keywords from text`);
        const keywords = content
          .toLowerCase()
          .split(/[,\s]+/)
          .filter((k: string) => k.length > 1)
          .slice(0, 10);
        return { keywords, semanticMatches: [], suggestions: [] };
      }
    } catch (error) {
      console.warn(`DeepSeek attempt ${attempt} failed:`, error);
      if (attempt === 3) {
        console.error("DeepSeek failed after 3 attempts, falling back to normalized query");
        const fallbackKeywords = SearchTextProcessor.normalizeQuery(query)
          .split(" ")
          .filter(k => k.length > 1);
        return { keywords: fallbackKeywords, semanticMatches: [], suggestions: [] };
      }
      await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
    }
  }
  const fallbackKeywords = SearchTextProcessor.normalizeQuery(query)
    .split(" ")
    .filter(k => k.length > 1);
  return { keywords: fallbackKeywords, semanticMatches: [], suggestions: [] };
}

// Enhanced local product search function
function searchProductsLocally(
  keywords: string[],
  intent: SearchIntent,
  enhancedData?: { semanticMatches: string[]; suggestions: string[] }
): Product[] {
  const allKeywords = [
    ...keywords,
    ...(enhancedData?.semanticMatches || []),
    ...(enhancedData?.suggestions || [])
  ]

  let results = PRODUCTS.filter((product) => {
    // Apply intent filters first
    if (intent.priceFilter?.min && product.price < intent.priceFilter.min) return false
    if (intent.priceFilter?.max && product.price > intent.priceFilter.max) return false
    if (intent.requiresInStock && !product.inStock) return false
    if (intent.category && product.category.toLowerCase() !== intent.category) return false
    if (intent.brand && product.brand?.toLowerCase() !== intent.brand) return false

    // Search in product fields
    const searchText = `${product.name} ${product.description} ${product.category} ${product.brand || ""} ${product.code || ""}`.toLowerCase()

    // Check if any keyword matches
    return allKeywords.some((keyword) => {
      const cleanKeyword = keyword.toLowerCase().trim()
      return cleanKeyword.length > 1 && searchText.includes(cleanKeyword)
    })
  })

  // Enhanced relevance scoring
  results = results.sort((a, b) => {
    let scoreA = 0
    let scoreB = 0

    allKeywords.forEach((keyword) => {
      const cleanKeyword = keyword.toLowerCase().trim()
      if (cleanKeyword.length <= 1) return

      // Name matches get highest score
      if (a.name.toLowerCase().includes(cleanKeyword)) scoreA += 15
      if (b.name.toLowerCase().includes(cleanKeyword)) scoreB += 15

      // Exact name matches get bonus
      if (a.name.toLowerCase() === cleanKeyword) scoreA += 25
      if (b.name.toLowerCase() === cleanKeyword) scoreB += 25

      // Category matches
      if (a.category.toLowerCase().includes(cleanKeyword)) scoreA += 8
      if (b.category.toLowerCase().includes(cleanKeyword)) scoreB += 8

      // Brand matches
      if (a.brand?.toLowerCase().includes(cleanKeyword)) scoreB += 6
      if (b.brand?.toLowerCase().includes(cleanKeyword)) scoreB += 6

      // Description matches
      if (a.description.toLowerCase().includes(cleanKeyword)) scoreA += 3
      if (b.description.toLowerCase().includes(cleanKeyword)) scoreB += 3

      // Code matches
      if (a.code?.toLowerCase().includes(cleanKeyword)) scoreA += 4
      if (b.code?.toLowerCase().includes(cleanKeyword)) scoreB += 4
    })

    // Boost factors from intent
    intent.boostFactors.forEach(factor => {
      if (factor === "budget" && a.price < b.price) scoreA += 5
      if (factor === "budget" && b.price < a.price) scoreB += 5
      if (factor === "premium" && a.price > b.price) scoreA += 5
      if (factor === "premium" && b.price > a.price) scoreB += 5
    })

    // Boost in-stock products
    if (a.inStock && !b.inStock) scoreA += 3
    if (b.inStock && !a.inStock) scoreB += 3

    // If scores are equal, sort by price (ascending)
    if (scoreA === scoreB) {
      return a.price - b.price
    }

    return scoreB - scoreA
  })

  return results.slice(0, SEARCH_CONFIG.MAX_RESULTS)
}

// Agentic response generator
function generateAgenticResponse(
  results: Product[],
  intent: SearchIntent,
  searchMode: "fast" | "deep",
  userContext?: any
): string {
  let responseMessage = ""

  if (results.length > 0) {
    const categories = [...new Set(results.map((p) => p.category))]
    
    // Build contextual response based on intent and business context
    if (intent.businessContext === "retailer") {
      responseMessage = `Perfect! I found ${results.length} ${intent.cleanQuery || "product"} options for your shop.`
      
      // Add business insights
      if (intent.seasonalRelevance) {
        responseMessage += ` This is a great time to stock up on ${intent.category} - it's in high demand right now!`
      }
      
      // Suggest bulk purchases for better margins
      const bulkProducts = results.filter(p => BusinessIntelligenceAgent.suggestBulkPurchase(p, userContext?.orderHistory || []))
      if (bulkProducts.length > 0) {
        responseMessage += ` I recommend ordering the ${bulkProducts[0].name} in bulk for better profit margins.`
      }
      
      // Suggest complementary products
      if (intent.category) {
        const complementary = BusinessIntelligenceAgent.getComplementaryCategories(intent.category)
        if (complementary.length > 0) {
          responseMessage += ` Would you also like to see some ${complementary[0]} options? They pair well with ${intent.category}.`
        }
      }
    } else if (intent.businessContext === "distributor") {
      responseMessage = `Excellent! Here are ${results.length} ${intent.cleanQuery || "product"} options for your distribution business.`
      
      // Add wholesale insights
      if (intent.requiresWholesale) {
        responseMessage += ` All these products are available in wholesale quantities.`
      }
    } else {
      // Default response with proactive suggestions
      if (intent.boostFactors.includes("budget") || intent.boostFactors.includes("affordable")) {
        responseMessage = `Here are affordable ${intent.cleanQuery || "product"} options I found:`
      } else if (intent.boostFactors.includes("premium") || intent.boostFactors.includes("luxury")) {
        responseMessage = `Here are premium ${intent.cleanQuery || "product"} options:`
      } else if (intent.requiresWholesale) {
        responseMessage = `Here are bulk/wholesale ${intent.cleanQuery || "product"} options:`
      } else if (intent.requiresInStock) {
        responseMessage = `Here are available ${intent.cleanQuery || "product"} options in stock:`
      } else if (categories.length === 1) {
        responseMessage = `Here are ${categories[0].toLowerCase()} options I found:`
      } else if (intent.category) {
        responseMessage = `Here are ${intent.category} products:`
      } else if (intent.brand) {
        responseMessage = `Here are ${intent.brand} products:`
      } else {
        responseMessage = `Here are the ${intent.cleanQuery || "product"} options I found:`
      }
    }

    // Add price range if available
    if (results.length > 1) {
      const prices = results.map((p) => p.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      if (minPrice !== maxPrice) {
        responseMessage += ` (KES ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()})`
      }
    }

    // Add search mode indicator for deep search
    if (searchMode === "deep") {
      responseMessage += " ✨"
    }
  } else {
    // No results found with proactive suggestions
    const suggestions = []
    if (intent.priceFilter) {
      suggestions.push("try searching without price filters")
    }
    if (intent.requiresInStock) {
      suggestions.push("try searching without stock requirements")
    }
    if (intent.category || intent.brand) {
      suggestions.push("try a broader search")
    }

    responseMessage = `Sorry, no products found for "${intent.cleanQuery}".`
    if (suggestions.length > 0) {
      responseMessage += ` You could ${suggestions.join(" or ")}.`
    } else {
      responseMessage += " Try searching with different keywords or check our categories."
    }
    
    // Add seasonal recommendations
    const seasonalCategories = BusinessIntelligenceAgent.getSeasonalRecommendations()
    if (seasonalCategories.length > 0) {
      responseMessage += ` This month, ${seasonalCategories[0]} and ${seasonalCategories[1]} are trending well.`
    }
  }

  // Handle Swahili responses (basic detection)
  if (intent.cleanQuery.toLowerCase().includes("nataka") || 
      intent.cleanQuery.toLowerCase().includes("hapa") ||
      intent.cleanQuery.toLowerCase().includes("nina") ||
      intent.cleanQuery.toLowerCase().includes("tafuta")) {
    responseMessage = responseMessage.replace("Here are the", "Hapa ni")
                                   .replace("Here are", "Hapa ni")
                                   .replace("Sorry, no products found", "Pole, hakuna bidhaa")
                                   .replace("Perfect!", "Vizuri!")
                                   .replace("Excellent!", "Bora!")
  }

  return responseMessage
}

// Main search function
async function searchProducts(
  query: string,
  searchMode: "fast" | "deep",
  intent: SearchIntent,
): Promise<Product[]> {
  const cacheKey = `${searchMode}_${query}_${JSON.stringify(intent)}`
  const cached = queryCache[cacheKey]

  if (cached && Date.now() - cached.timestamp < SEARCH_CONFIG.CACHE_DURATION) {
    console.log(`📦 Using cached results for "${query}" (${searchMode})`)
    return cached.results
  }

  let keywords: string[]
  let enhancedData: { semanticMatches: string[]; suggestions: string[] } | undefined
  let structured: { category?: string; brand?: string; size?: string; inStock?: boolean; bulk?: boolean } | undefined

  if (searchMode === "deep") {
    try {
      const deepSeekResult = await enhanceQueryWithDeepSeek(intent.cleanQuery)
      keywords = deepSeekResult.keywords
      enhancedData = {
        semanticMatches: deepSeekResult.semanticMatches,
        suggestions: deepSeekResult.suggestions
      }
      structured = deepSeekResult.structured
      console.log(`🤖 DeepSeek enhanced search for "${query}":`, deepSeekResult)
    } catch (error) {
      console.warn("DeepSeek enhancement failed, falling back to fast mode:", error)
      keywords = SearchTextProcessor.normalizeQuery(intent.cleanQuery).split(" ")
    }
  } else {
    // Fast mode: use simple keyword extraction
    keywords = SearchTextProcessor.normalizeQuery(intent.cleanQuery).split(" ")
  }

  // Prefer deterministic tools when we have structured hints (category/brand/inStock)
  if (structured?.category || structured?.brand || typeof structured?.inStock === "boolean") {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/tools/products/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: structured?.category,
          brand: structured?.brand,
          inStock: structured?.inStock,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const listResults = (data?.products || []) as Product[]
        if (listResults.length > 0) {
          // If we also have keywords, filter by them lightly for precision
          const filtered = keywords && keywords.length > 0
            ? listResults.filter((p) =>
                keywords.some((k) => `${p.name} ${p.brand || ""} ${p.description}`.toLowerCase().includes(k.toLowerCase())),
              )
            : listResults
          return filtered.slice(0, SEARCH_CONFIG.MAX_RESULTS)
        }
      }
    } catch (e) {
      console.warn("Tool list call failed, falling back to local search", e)
    }
  }

  const results = searchProductsLocally(keywords, intent, enhancedData)

  // Cache results
  queryCache[cacheKey] = { results, timestamp: Date.now() }

  console.log(`🔍 Found ${results.length} products for "${query}" (${searchMode})`)
  return results
}

// Main search handler function
export async function handle_Search(
  userId: string,
  query: string,
  searchMode: "fast" | "deep",
  userContext?: any
): Promise<{ productIds: string[]; vendaiResponse: string; products: Product[] }> {
  try {
    console.log(`🔍 ${searchMode.toUpperCase()} search for: "${query}"`)
    const intent = SearchTextProcessor.extractSearchIntent(query)
    const results = await searchProducts(query, searchMode, intent)

    const productIds = results.map((p) => p.id.toString())

    // Generate agentic response
    const responseMessage = generateAgenticResponse(results, intent, searchMode, userContext)

    return {
      productIds,
      vendaiResponse: responseMessage,
      products: results,
    }
  } catch (error) {
    console.error(`❌ ${searchMode} search failed:`, error)
    return {
      productIds: [],
      vendaiResponse: "Sorry, something went wrong with the search. Please try again.",
      products: [],
    }
  }
}

// Health check function
export async function healthCheck(): Promise<{
  status: "healthy" | "degraded" | "unhealthy"
  details: {
    deepseek: boolean
    cache_size: number
    products_count: number
  }
}> {
  const details = {
    deepseek: false,
    cache_size: Object.keys(queryCache).length,
    products_count: PRODUCTS.length,
  }

  try {
    // Test DeepSeek API with a simple request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)

    const response = await fetch("https://api.deepseek.com/v1/models", {
      headers: { 
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    details.deepseek = response.ok
  } catch (error) {
    console.warn("DeepSeek health check failed:", error)
    details.deepseek = false
  }

  const healthyServices = details.deepseek ? 1 : 0
  const hasProducts = details.products_count > 0

  let status: "healthy" | "degraded" | "unhealthy"
  if (hasProducts && healthyServices === 1) {
    status = "healthy"
  } else if (hasProducts) {
    status = "degraded" // Products available but DeepSeek might be down
  } else {
    status = "unhealthy"
  }

  return {
    status,
    details,
  }
}