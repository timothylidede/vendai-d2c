import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"

export const maxDuration = 30

// Store for unavailable product requests and user learning
const unavailableRequests: {
  query: string
  timestamp: string
  userId?: string
  location?: string
}[] = []

const userPreferences: {
  [userId: string]: {
    preferredBrands: string[]
    commonPurchases: string[]
    priceRange: string
    location: string
  }
} = {}

const findRelevantProducts = (query: string, limit = 3) => {
  const lowercaseQuery = query.toLowerCase()

  // Enhanced search with brand matching
  const matchingProducts = PRODUCTS.filter((product) => {
    const searchTerms = [
      product.name.toLowerCase(),
      product.description.toLowerCase(),
      product.category.toLowerCase(),
      product.brand?.toLowerCase() || "",
      // Add Swahili terms
      product.name.toLowerCase().includes("mafuta") ? "oil cooking" : "",
      product.name.toLowerCase().includes("unga") ? "flour" : "",
      product.name.toLowerCase().includes("sukari") ? "sugar" : "",
    ].join(" ")

    return searchTerms.includes(lowercaseQuery) || lowercaseQuery.split(" ").some((term) => searchTerms.includes(term))
  })

  // If no direct matches, try category and keyword matching
  if (matchingProducts.length === 0) {
    const categoryKeywords = {
      // English terms
      oil: "Cooking Oils",
      cooking: "Cooking Oils",
      rice: "Rice",
      flour: "Flour",
      sugar: "Sugar",
      milk: "Dairy",
      soap: "Personal Care",
      cleaning: "Cleaning",
      baby: "Baby Care",
      diaper: "Baby Care",
      tissue: "Cleaning",
      juice: "Juices",
      // Swahili terms
      mafuta: "Cooking Oils",
      kupika: "Cooking Oils",
      unga: "Flour",
      sukari: "Sugar",
      maziwa: "Dairy",
      sabuni: "Personal Care",
      usafi: "Cleaning",
      mtoto: "Baby Care",
    }

    for (const [keyword, category] of Object.entries(categoryKeywords)) {
      if (lowercaseQuery.includes(keyword)) {
        return PRODUCTS.filter((p) => p.category.includes(category)).slice(0, limit)
      }
    }
  }

  return matchingProducts.slice(0, limit)
}

const getAlternativeProducts = (mainProducts: any[], limit = 2) => {
  if (mainProducts.length === 0) return []

  const mainCategory = mainProducts[0].category
  const mainProductIds = mainProducts.map((p) => p.id)

  return PRODUCTS.filter((p) => p.category === mainCategory && !mainProductIds.includes(p.id)).slice(0, limit)
}

const generateProductResponse = (query: string, products: any[]) => {
  const lowercaseQuery = query.toLowerCase()
  const isSwahili =
    lowercaseQuery.includes("nataka") ||
    lowercaseQuery.includes("ninahitaji") ||
    lowercaseQuery.includes("mafuta") ||
    lowercaseQuery.includes("unga")

  if (products.length === 0) {
    // Track unavailable product request for learning
    unavailableRequests.push({
      query,
      timestamp: new Date().toISOString(),
    })

    return {
      content: isSwahili
        ? `Samahani, hatuna "${query}" kwa sasa. Nimerejelea ombi lako na tutazingatia kuongeza kwenye stock. Je, kuna kitu kingine unachohitaji?`
        : `Sorry, we don't have "${query}" in stock right now. I've noted your request for future inventory. What else can I help you find?`,
      products: [],
    }
  }

  // Get alternatives for better recommendations
  const alternatives = getAlternativeProducts(products, 2)
  const allProducts = [...products, ...alternatives]

  // Generate contextual responses based on product category
  if (lowercaseQuery.includes("oil") || lowercaseQuery.includes("mafuta") || lowercaseQuery.includes("cooking")) {
    return {
      content: isSwahili
        ? `🛍️ Mafuta ya kupika ya hali ya juu kwa bei ya jumla. RINA ni mzuri sana, na Fresh Fry pia ni nzuri:`
        : `🛍️ Premium cooking oils at wholesale prices. RINA is top quality, Fresh Fry offers great value:`,
      products: allProducts,
    }
  }

  if (lowercaseQuery.includes("rice") || lowercaseQuery.includes("mcele")) {
    return {
      content: isSwahili
        ? `🍚 Mcele wa hali ya juu! Pishori ni wa kilimo, Basmati na Biriyani ni mazuri kwa chakula maalum:`
        : `🍚 Quality rice varieties! Pishori is premium grade, Basmati and Biriyani perfect for special meals:`,
      products: allProducts,
    }
  }

  if (lowercaseQuery.includes("flour") || lowercaseQuery.includes("unga")) {
    return {
      content: isSwahili
        ? `🌾 Unga wa hali ya juu kutoka kwa makampuni ya kuaminika. Kuna 1kg na 2kg kwa bei ya jumla:`
        : `🌾 Quality flour from trusted brands. Available in 1kg and 2kg at wholesale prices:`,
      products: allProducts,
    }
  }

  if (
    lowercaseQuery.includes("clean") ||
    lowercaseQuery.includes("soap") ||
    lowercaseQuery.includes("sabuni") ||
    lowercaseQuery.includes("usafi")
  ) {
    return {
      content: isSwahili
        ? `🧽 Vitu vya usafi kwa nyumba na biashara. Kuna wingi:`
        : `🧽 Cleaning essentials for home and business. Bulk quantities available:`,
      products: allProducts,
    }
  }

  if (lowercaseQuery.includes("baby") || lowercaseQuery.includes("diaper") || lowercaseQuery.includes("mtoto")) {
    return {
      content: isSwahili
        ? `👶 Vitu vya mtoto kutoka kwa makampuni ya kuaminika. Saizi mbalimbali:`
        : `👶 Baby care products from trusted brands. Different sizes available:`,
      products: allProducts,
    }
  }

  if (lowercaseQuery.includes("dairy") || lowercaseQuery.includes("milk") || lowercaseQuery.includes("maziwa")) {
    return {
      content: isSwahili
        ? `🥛 Mazao ya maziwa kutoka Lato na makampuni mengine. Mazuri kwa nyumba na biashara:`
        : `🥛 Fresh dairy products from Lato and other quality brands. Perfect for homes and businesses:`,
      products: allProducts,
    }
  }

  // Default response
  return {
    content: isSwahili ? `✅ Nimepata bidhaa hizi kwa bei ya jumla:` : `✅ Found these products at wholesale prices:`,
    products: allProducts,
  }
}

const handleGreetingOrHelp = (query: string) => {
  const lowercaseQuery = query.toLowerCase()
  const isSwahili =
    lowercaseQuery.includes("habari") ||
    lowercaseQuery.includes("mambo") ||
    lowercaseQuery.includes("niaje") ||
    lowercaseQuery.includes("sasa")

  if (
    lowercaseQuery.includes("hello") ||
    lowercaseQuery.includes("hi") ||
    lowercaseQuery.includes("habari") ||
    lowercaseQuery.includes("mambo") ||
    lowercaseQuery.includes("niaje")
  ) {
    return {
      content: isSwahili
        ? `Habari! Mimi ni VendAI, msaidizi wako wa ununuzi. Ninasaidia kupata bidhaa za nyumbani kwa bei ya jumla Kenya. Unahitaji nini leo?`
        : `Hello! I'm VendAI, your shopping assistant. I help find household essentials at wholesale prices in Kenya. What do you need today?`,
      products: PRODUCTS.slice(0, 4), // Show some popular products
    }
  }

  if (lowercaseQuery.includes("help") || lowercaseQuery.includes("msaada")) {
    return {
      content: isSwahili
        ? `🛍️ Ninaweza kukusaidia: \n• Kutafuta bidhaa (mfano: "nataka mafuta ya kupika")\n• Kuongeza kwenye cart\n• Maelezo ya bei na delivery\n• Mapendekezo ya bidhaa\n\nUnahitaji nini?`
        : `🛍️ I can help you:\n• Find products (e.g. "I need cooking oil")\n• Add items to cart\n• Check prices and delivery\n• Get product recommendations\n\nWhat do you need?`,
      products: PRODUCTS.slice(0, 3),
    }
  }

  return null
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const query = lastMessage.content

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Handle greetings and help first
    const greetingResponse = handleGreetingOrHelp(query)
    if (greetingResponse) {
      return NextResponse.json({
        id: Date.now().toString(),
        role: "assistant",
        content: greetingResponse.content,
        products: greetingResponse.products,
      })
    }

    // Find relevant products
    const relevantProducts = findRelevantProducts(query, 3)

    // Generate response with alternatives
    const response = generateProductResponse(query, relevantProducts)

    return NextResponse.json({
      id: Date.now().toString(),
      role: "assistant",
      content: response.content,
      products: response.products,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat message" }, { status: 500 })
  }
}

// Endpoint to get unavailable product requests for learning
export async function GET() {
  return NextResponse.json({
    unavailableRequests,
    totalRequests: unavailableRequests.length,
    userPreferences,
  })
}
