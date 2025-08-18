import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"

export async function GET() {
	const categories = Array.from(new Set(PRODUCTS.map((p) => p.category))).sort()
	const brands = Array.from(new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))).sort()
	return NextResponse.json({ categories, brands })
}


