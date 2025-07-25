import { createClient } from "@supabase/supabase-js"
import { PRODUCTS } from "@/data/products"

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function handle_NewMessage(
  userId: string,
  query: string,
  commsHistory: string,
): Promise<{ productsIds: string[]; vendaiResponse: string } | null> {
  try {
    const searchQuery = query.toLowerCase().trim()

    // Direct keyword search in products
    const matchedProducts = PRODUCTS.filter((product) => {
      const searchableText =
        `${product.name} ${product.description} ${product.category} ${product.brand || ""}`.toLowerCase()

      // Check if query matches any part of the product
      return (
        searchableText.includes(searchQuery) ||
        product.name.toLowerCase().includes(searchQuery) ||
        product.description.toLowerCase().includes(searchQuery) ||
        product.category.toLowerCase().includes(searchQuery) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery))
      )
    })

    // If no direct matches, try Supabase search as fallback
    let finalProducts = matchedProducts
    if (matchedProducts.length === 0) {
      try {
        const { data, error: supabaseError } = await supabase
          .from("product_embeddings")
          .select("*")
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
          .limit(10)

        if (!supabaseError && data) {
          finalProducts = PRODUCTS.filter((p) => data.some((sp) => sp.product_id === p.id))
        }
      } catch (supabaseError) {
        console.error("Supabase search error:", supabaseError)
      }
    }

    // Filter only in-stock products and limit to 8
    const inStockProducts = finalProducts.filter((product) => product.inStock).slice(0, 8)
    const productIds = inStockProducts.map((p) => p.id.toString())

    // Generate response message
    let responseMessage = ""
    if (inStockProducts.length > 0) {
      responseMessage = `Here are the available ${searchQuery} options:`
    } else {
      responseMessage = `Sorry, no products found for "${searchQuery}". Try searching for something else.`
    }

    return {
      productsIds: productIds,
      vendaiResponse: responseMessage,
    }
  } catch (error: unknown) {
    console.error("Error in handle_NewMessage:", error)
    return {
      productsIds: [],
      vendaiResponse: "Sorry, something went wrong. Please try again.",
    }
  }
}
