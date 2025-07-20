import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"
import type { Product } from "@/data/products"
import { handle_NewMessage } from "./communicate"

export const maxDuration = 30

export function getProductsByIds(ids: number[]): Product[] {
  return PRODUCTS.filter((product) => ids.includes(product.id))
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]
    const query = lastMessage.content

    console.log("\n\nReceived query from user:", query)

    const commsHistoryString: string = JSON.stringify(messages)

    // Get response from DeepSeek with embedded context
    const response = await handle_NewMessage("123", query, commsHistoryString)

    if (!response) {
      return NextResponse.json({
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm here to help you find products! What are you looking for today?",
        products: [],
      })
    }

    // Extract product IDs from response
    const products = response?.productsIds ? response.productsIds : []
    let productIds: number[] = []

    if (Array.isArray(products)) {
      productIds = products.map((id: string) => Number.parseInt(id, 10)).filter((id: number) => !isNaN(id))
    }

    console.log("\n\nProduct IDs extracted:", productIds)

    // Get products by IDs
    const recommendedProducts = getProductsByIds(productIds)

    console.log(
      "\n\nRecommended products:",
      recommendedProducts.map((p) => ({ id: p.id, name: p.name })),
    )

    return NextResponse.json({
      id: Date.now().toString(),
      role: "assistant",
      content: response?.vendaiResponse || "I'm here to help you find products! What are you looking for today?",
      products: recommendedProducts,
    })
  } catch (error) {
    console.error("Chat API error:", error)

    // Return a helpful fallback response instead of an error
    return NextResponse.json({
      id: Date.now().toString(),
      role: "assistant",
      content: "I'm here to help you find products! What are you looking for today?",
      products: [],
    })
  }
}

// Endpoint to get unavailable product requests for learning
export async function GET() {
  return NextResponse.json({
    message: "Chat API is working",
    timestamp: new Date().toISOString(),
  })
}
