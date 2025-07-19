import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"
import { Product } from "@/data/products"
// import {getProductsByIds} from '@/data/products';
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

export function getProductsByIds(ids: number[]): Product[] {
  return PRODUCTS.filter(product => ids.includes(product.id));
}


export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const query = lastMessage.content
    console.log("\n\nReceived query fom user:", query)

    const commsHistoryString: string = JSON.stringify(messages);
    // Simulate processing delay
    // await new Promise((resolve) => setTimeout(resolve, 600))
    const response = await handle_NewMessage("123", query, commsHistoryString);

    // into a variable that is a list of extract response.productsIds to a list of numbers from the response 
    // and then use the getProductsByIds function to get the products
    let products = response?.productsIds ? response.productsIds : [] 
    let productIds: number[] = [];
    if (Array.isArray(products)) {
      productIds = products.map((id: string) => parseInt(id, 10)).filter((id: number) => !isNaN(id));
    }
    console.log("\n\nProduct IDs extracted:", productIds)

    // Handle greetings and help first
    return NextResponse.json({
      id: Date.now().toString(),
      role: "assistant",
      content: response?.vendaiResponse? response.vendaiResponse : "Sorry, I couldn't process your request.",
      products: getProductsByIds(productIds),
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
