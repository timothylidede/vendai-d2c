import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { category, brand, inStock } = body || {}
		let list = PRODUCTS
		if (category) list = list.filter((p) => p.category.toLowerCase() === String(category).toLowerCase())
		if (brand) list = list.filter((p) => (p.brand || "").toLowerCase() === String(brand).toLowerCase())
		if (typeof inStock === "boolean") list = list.filter((p) => p.inStock === inStock)
		return NextResponse.json({ products: list.slice(0, 200) })
	} catch {
		return NextResponse.json({ error: "invalid request" }, { status: 400 })
	}
}

export async function GET() {
	return NextResponse.json({ usage: "POST { category?, brand?, inStock? }" })
}


