import { NextResponse } from "next/server"
import { PRODUCTS, searchProducts } from "@/data/products"
import { getAllProductsWithImages } from "@/utils/product-management"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const limit = searchParams.get("limit")
    const withImages = searchParams.get("withImages") === "true"

    let products = withImages ? getAllProductsWithImages() : PRODUCTS

    // Filter by category
    if (category && category !== "all") {
      products = products.filter((product) => product.category === category)
    }

    // Filter by search query
    if (search) {
      const searchResults = searchProducts(search)
      const searchIds = searchResults.map((p) => p.id)
      products = products.filter((product) => searchIds.includes(product.id))
    }

    // Limit results
    if (limit) {
      const limitNum = Number.parseInt(limit)
      products = products.slice(0, limitNum)
    }

    return NextResponse.json({
      success: true,
      data: products,
      total: products.length,
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const productData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "price", "category", "description", "stock", "unit"]
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json({ success: false, message: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Add new product (in a real app, this would save to database)
    const newId = Math.max(...PRODUCTS.map((p) => p.id)) + 1
    const newProduct = {
      id: newId,
      ...productData,
      image: productData.image || `/placeholder.svg?height=200&width=200`,
    }

    PRODUCTS.push(newProduct)

    return NextResponse.json({
      success: true,
      data: newProduct,
      message: "Product created successfully",
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 })
  }
}
