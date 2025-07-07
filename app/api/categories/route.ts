import { NextResponse } from "next/server"
import { PRODUCT_CATEGORIES } from "@/data/products"
import { getCategoryStats } from "@/utils/product-management"

export async function GET() {
  try {
    const categories = Object.values(PRODUCT_CATEGORIES)
    const categoryStats = getCategoryStats()

    return NextResponse.json({
      success: true,
      data: {
        categories,
        stats: categoryStats,
      },
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 })
  }
}
