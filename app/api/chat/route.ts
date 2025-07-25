import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"
import type { Product } from "@/lib/types"
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

    console.log("Query:", query)

    // Get immediate response from keyword search
    const response = await handle_NewMessage("123", query, "")

    if (!response) {
      return NextResponse.json({
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm here to help you find products! What are you looking for today?",
        products: [],
      })
    }

    // Get products by IDs
    const productIds = response.productsIds
      .map((id: string) => Number.parseInt(id, 10))
      .filter((id: number) => !isNaN(id))

    const recommendedProducts = getProductsByIds(productIds)

    const result = {
      id: Date.now().toString(),
      role: "assistant",
      content: response.vendaiResponse,
      products: recommendedProducts,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Chat API error:", error)

    const fallback = {
      id: Date.now().toString(),
      role: "assistant",
      content: "I'm here to help you find products! What are you looking for today?",
      products: [],
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(fallback)
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Chat API is working",
    timestamp: new Date().toISOString(),
  })
}
