import { NextResponse } from "next/server"
import { getProductsByIds, PRODUCTS } from "@/data/products"
// import { getProductById } from "@/data/products"
import { handle_NewMessage } from "@/app/api/chat/communicate"

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


export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const query = lastMessage.content

    const commsHistoryString: string = JSON.stringify(messages);
    // Simulate processing delay
    // await new Promise((resolve) => setTimeout(resolve, 600))
    const response = await handle_NewMessage("123", query, commsHistoryString);

    // Handle greetings and help first
    return NextResponse.json({
      id: Date.now().toString(),
      role: "assistant",
      content: response?.vendaiResponse? response.vendaiResponse : "Sorry, I couldn't process your request.",
      products: getProductsByIds(response?.productsIds? response.productsIds : []),
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
