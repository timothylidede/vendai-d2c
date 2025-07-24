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

    const commsHistoryString: string = JSON.stringify(messages)

    // Start processing immediately - no delays
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

    // Get products by IDs and filter only in-stock products
    const allRecommendedProducts = getProductsByIds(productIds)
    const recommendedProducts = allRecommendedProducts.filter((product) => product.inStock)

    // Clean the response text - remove JSON formatting if present
    let cleanResponse =
      response?.vendaiResponse || "I'm here to help you find products! What are you looking for today?"

    // Check if the response is JSON formatted and extract the actual message
    if (cleanResponse.includes("```json") || cleanResponse.startsWith("{")) {
      try {
        // Remove markdown code blocks
        cleanResponse = cleanResponse.replace(/```json\s*/, "").replace(/```\s*$/, "")

        // Try to parse as JSON
        const jsonResponse = JSON.parse(cleanResponse)
        if (jsonResponse.vendaiResponse) {
          cleanResponse = jsonResponse.vendaiResponse
        }
      } catch (parseError) {
        // If parsing fails, try to extract text between quotes
        const match = cleanResponse.match(/"vendaiResponse":\s*"([^"]*)"/)
        if (match && match[1]) {
          cleanResponse = match[1]
        } else {
          // Fallback: remove common JSON artifacts
          cleanResponse = cleanResponse
            .replace(/```json\s*/, "")
            .replace(/```\s*$/, "")
            .replace(/^\s*{\s*/, "")
            .replace(/\s*}\s*$/, "")
            .replace(/"vendaiResponse":\s*"/, "")
            .replace(/"productsIds".*$/, "")
            .replace(/",\s*$/, "")
            .replace(/^"/, "")
            .replace(/"$/, "")
            .trim()
        }
      }
    }

    // Add note about out-of-stock products if any were filtered out
    if (allRecommendedProducts.length > recommendedProducts.length) {
      const outOfStockCount = allRecommendedProducts.length - recommendedProducts.length
      cleanResponse += ` (Note: ${outOfStockCount} product${outOfStockCount > 1 ? "s are" : " is"} currently out of stock)`
    }

    return NextResponse.json({
      id: Date.now().toString(),
      role: "assistant",
      content: cleanResponse,
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
