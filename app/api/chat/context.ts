import { PRODUCTS } from "@/data/products"

export async function getContext(userQuery: string): Promise<string> {
  try {
    const searchTerm = userQuery.toLowerCase()

    // Simple search through products
    const relevantProducts = PRODUCTS.filter((product) => {
      const searchableText = `${product.name} ${product.description} ${product.category}`.toLowerCase()
      return searchableText.includes(searchTerm) || searchTerm.split(" ").some((word) => searchableText.includes(word))
    })

    if (relevantProducts.length === 0) {
      return "No products found matching the search criteria."
    }

    // Format products for context
    return relevantProducts
      .slice(0, 10) // Limit to 10 products
      .map(
        (product) =>
          `ID: ${product.id}, Name: ${product.name}, Description: ${product.description}, Price: KSh ${product.price}`,
      )
      .join("\n")
  } catch (error) {
    console.error("Error getting context:", error)
    return "Error retrieving product information."
  }
}
