import { OpenAI } from "openai"
import { PRODUCTS } from "@/data/products"
import { systemPrompt } from "./systemPrompt"

const DEEPSEEK_API_KEY: string | undefined = process.env.DEEPSEEK_API_KEY

const openai = new OpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: DEEPSEEK_API_KEY,
})

// Enhanced product search function with strict relevance filtering
function searchProducts(query: string): any[] {
  const searchTerm = query.toLowerCase().trim()

  const matchedProducts = PRODUCTS.filter((product) => {
    const searchableText =
      `${product.name} ${product.description} ${product.category} ${product.brand || ""}`.toLowerCase()

    // Calculate relevance score
    let relevanceScore = 0

    // Direct exact matches (highest priority)
    if (searchableText.includes(searchTerm)) {
      relevanceScore += 100
    }

    // Enhanced synonyms with Kiswahili translations
    const synonyms: Record<string, string[]> = {
      // Eggs
      eggs: ["egg", "mayai", "yai"],
      mayai: ["eggs", "egg", "yai"],
      yai: ["eggs", "egg", "mayai"],

      // Cheese
      cheese: ["cheddar", "mozzarella", "gouda", "jibini"],
      jibini: ["cheese", "cheddar", "mozzarella", "gouda"],

      // Pasta & Noodles
      spaghetti: ["pasta", "noodles", "macaroni", "spaghetti pasta", "tambi", "mchuzi wa tambi"],
      pasta: ["spaghetti", "noodles", "macaroni", "linguine", "penne", "tambi"],
      noodles: ["pasta", "spaghetti", "macaroni", "tambi"],
      macaroni: ["pasta", "spaghetti", "noodles", "tambi"],
      tambi: ["pasta", "spaghetti", "noodles", "macaroni"],

      // Beverages & Drinks
      juice: ["drink", "beverage", "liquid", "fruit", "maji ya matunda", "kinywaji", "juisi"],
      "orange juice": ["machungwa", "juice ya machungwa", "maji ya machungwa"],
      "apple juice": ["tufaha", "juice ya tufaha", "maji ya tufaha"],
      "mango juice": ["embe", "juice ya embe", "maji ya embe"],
      "pineapple juice": ["nanasi", "juice ya nanasi", "maji ya nanasi"],
      drink: ["kinywaji", "juice", "beverage", "maji"],
      beverage: ["kinywaji", "drink", "juice", "maji"],
      juisi: ["juice", "drink", "beverage", "kinywaji"],

      // Cooking Oil
      "cooking oil": ["oil", "sunflower", "vegetable oil", "olive oil", "mafuta ya kupikia", "mafuta"],
      oil: ["cooking oil", "sunflower oil", "vegetable oil", "olive oil", "mafuta"],
      "sunflower oil": ["mafuta ya alizeti", "mafuta ya sunflower"],
      "vegetable oil": ["mafuta ya mboga", "mafuta ya kupikia"],
      "olive oil": ["mafuta ya mizeituni"],
      mafuta: ["oil", "cooking oil", "sunflower oil", "vegetable oil", "olive oil"],

      // Electronics
      phone: ["mobile", "smartphone", "cell", "galaxy", "iphone", "simu", "rununu"],
      mobile: ["phone", "smartphone", "simu", "rununu"],
      smartphone: ["phone", "mobile", "simu", "rununu"],
      simu: ["phone", "mobile", "smartphone", "rununu"],

      // Coffee
      coffee: ["espresso", "latte", "cappuccino", "brew", "arabica", "instant", "kahawa"],
      kahawa: ["coffee", "espresso", "latte", "cappuccino", "brew", "arabica", "instant"],

      // Water
      water: ["h2o", "aqua", "hydration", "bottled", "sparkling", "maji"],
      maji: ["water", "h2o", "aqua", "hydration", "bottled", "sparkling"],

      // Dairy
      milk: ["dairy", "fresh milk", "maziwa"],
      maziwa: ["milk", "dairy", "fresh milk"],
      yogurt: ["mtindi", "greek yogurt"],

      // Bakery
      bread: ["loaf", "bakery", "white bread", "brown bread", "mkate"],
      mkate: ["bread", "loaf", "bakery", "white bread", "brown bread"],

      // Grains
      rice: ["grain", "basmati", "jasmine", "mcele", "wali"],
      mcele: ["rice", "grain", "basmati", "jasmine", "wali"],
      wali: ["rice", "grain", "basmati", "jasmine", "mcele"],

      // Sweeteners
      sugar: ["sweetener", "brown sugar", "white sugar", "sukari"],
      sukari: ["sugar", "sweetener", "brown sugar", "white sugar"],
    }

    // Check synonym matches (medium priority)
    for (const [key, values] of Object.entries(synonyms)) {
      if (searchTerm.includes(key)) {
        if (searchableText.includes(key) || values.some((synonym) => searchableText.includes(synonym))) {
          relevanceScore += 80
          break
        }
      }
      if (values.some((synonym) => searchTerm.includes(synonym))) {
        if (searchableText.includes(key) || values.some((synonym) => searchableText.includes(synonym))) {
          relevanceScore += 80
          break
        }
      }
    }

    // Word-by-word matching with strict relevance (lower priority)
    const queryWords = searchTerm.split(" ").filter((word) => word.length > 2) // Only words longer than 2 chars
    const productWords = searchableText.split(" ")

    let wordMatches = 0
    for (const queryWord of queryWords) {
      for (const productWord of productWords) {
        if (productWord.includes(queryWord) || queryWord.includes(productWord)) {
          wordMatches++
          relevanceScore += 20
          break
        }
        // Fuzzy matching only for longer words and with stricter threshold
        if (queryWord.length > 4 && productWord.length > 4) {
          const distance = levenshteinDistance(queryWord, productWord)
          const maxDistance = Math.floor(Math.min(queryWord.length, productWord.length) * 0.2) // 20% tolerance
          if (distance <= maxDistance && distance <= 2) {
            wordMatches++
            relevanceScore += 10
            break
          }
        }
      }
    }

    // Only return products with meaningful relevance scores
    // For single word queries, require higher relevance
    const minRelevanceScore = queryWords.length === 1 ? 70 : 50

    return relevanceScore >= minRelevanceScore
  })

  // Sort by relevance and limit results
  const sortedProducts = matchedProducts
    .map((product) => {
      const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase()
      let score = 0

      // Exact name match gets highest score
      if (product.name.toLowerCase().includes(searchTerm)) {
        score += 1000
      }
      // Category match
      else if (product.category.toLowerCase().includes(searchTerm)) {
        score += 500
      }
      // Description match
      else if (product.description.toLowerCase().includes(searchTerm)) {
        score += 300
      }
      // General text match
      else if (searchableText.includes(searchTerm)) {
        score += 100
      }

      return { ...product, relevanceScore: score }
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3) // Limit to max 3 products to avoid overwhelming

  console.log(
    "Filtered products with scores:",
    sortedProducts.map((p) => ({
      name: p.name,
      score: p.relevanceScore,
    })),
  )

  return sortedProducts
}

// Improved Levenshtein distance function
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

async function getResponseFromDeepSeek(
  userQuery: string,
  context: string,
): Promise<{ vendaiResponse: string; productsIds: string[] }> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User query: ${userQuery}\n\nAvailable products: ${context}` },
      ],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 400,
      stream: false,
    })

    const responseContent = completion.choices[0].message.content || ""

    // Always return as plain text response
    return {
      vendaiResponse: responseContent,
      productsIds: [],
    }
  } catch (error: unknown) {
    console.error("Error calling DeepSeek API:", error)
    return {
      vendaiResponse: "I'm here to help you find products! What are you looking for today?",
      productsIds: [],
    }
  }
}

export async function handle_NewMessage(
  userId: string,
  userQuery: string,
  commsHistoryString: string,
): Promise<{ vendaiResponse: string; productsIds: string[] } | null> {
  const userInput: string = userQuery.trim()

  try {
    console.log("Searching for products with query:", userInput)

    // Search products with strict relevance filtering
    const matchedProducts = searchProducts(userInput)

    console.log(
      "Found relevant products:",
      matchedProducts.map((p) => ({ id: p.id, name: p.name, relevanceScore: p.relevanceScore })),
    )

    // Check if user is using Kiswahili
    const kiswahiliWords = [
      "nataka",
      "nina",
      "je",
      "samahani",
      "asante",
      "karibu",
      "mayai",
      "mafuta",
      "mkate",
      "maziwa",
      "sukari",
      "kahawa",
      "maji",
      "jibini",
    ]
    const isKiswahili = kiswahiliWords.some((word) => userInput.toLowerCase().includes(word))

    // Only proceed if we have truly relevant products
    if (matchedProducts.length === 0) {
      const noProductsMessage = isKiswahili
        ? `Samahani, hatuna "${userInput}" katika hifadhi yetu kwa sasa. Je, kuna kitu kingine ninaweza kukusaidia nacho?`
        : `I'm sorry, we don't currently have "${userInput}" available in our inventory. Is there something else I can help you find?`

      return {
        vendaiResponse: noProductsMessage,
        productsIds: [],
      }
    }

    // Create detailed context from matched products only
    const context = matchedProducts
      .map((p) => {
        const price = p.wholesalePrice || p.price || 0
        return `ID: ${p.id}, Name: ${p.name}, Description: ${p.description}, Category: ${p.category}, Brand: ${p.brand || "N/A"}, Price: KSh ${price}`
      })
      .join("\n")

    console.log("Context created with relevant products only")

    // Get AI response
    const aiResponse = await getResponseFromDeepSeek(userInput, context)

    // Use only the matched product IDs from our strict search
    const productIds = matchedProducts.map((p) => p.id.toString())

    return {
      vendaiResponse: aiResponse.vendaiResponse,
      productsIds: productIds,
    }
  } catch (error: unknown) {
    console.error("Error handling message:", error)
    return {
      vendaiResponse: "I'm here to help you find products! What are you looking for today?",
      productsIds: [],
    }
  }
}
