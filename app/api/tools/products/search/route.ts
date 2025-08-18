import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"
import type { Product } from "@/lib/types"

function normalize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
		.split(" ")
		.filter(Boolean)
}

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const query: string = body?.query || ""
		const filters: { category?: string; brand?: string; inStock?: boolean } = body?.filters || {}
		if (!query || typeof query !== "string") {
			return NextResponse.json({ error: "query is required" }, { status: 400 })
		}

		const keywords = normalize(query)
		let results: Product[] = PRODUCTS.filter((p) => {
			if (filters.category && p.category.toLowerCase() !== filters.category.toLowerCase()) return false
			if (filters.brand && (p.brand || "").toLowerCase() !== filters.brand.toLowerCase()) return false
			if (typeof filters.inStock === "boolean" && p.inStock !== filters.inStock) return false

			const hay = `${p.name} ${p.description} ${p.category} ${p.brand || ""} ${p.code || ""}`.toLowerCase()
			return keywords.some((k) => hay.includes(k))
		})

		// Simple relevance scoring
		results = results
			.map((p) => ({
				p,
				score: keywords.reduce((acc, k) => {
					let s = 0
					if (p.name.toLowerCase().includes(k)) s += 15
					if (p.category.toLowerCase().includes(k)) s += 8
					if ((p.brand || "").toLowerCase().includes(k)) s += 6
					if (p.description.toLowerCase().includes(k)) s += 3
					return acc + s
				}, 0),
			}))
			.sort((a, b) => b.score - a.score)
			.slice(0, 24)
			.map(({ p }) => p)

		return NextResponse.json({ products: results })
	} catch (e) {
		return NextResponse.json({ error: "invalid request" }, { status: 400 })
	}
}

export async function GET() {
	return NextResponse.json({
		usage: "POST { query: string, filters?: { category?: string, brand?: string, inStock?: boolean } }",
		example: { query: "acacia juice", filters: { inStock: true } },
	})
}


