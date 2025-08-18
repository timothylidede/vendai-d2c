import { NextResponse } from "next/server"
import { PRODUCTS } from "@/data/products"
import type { Product } from "@/lib/types"

export async function POST(req: Request) {
	try {
		const body = await req.json()
		const ids: number[] = Array.isArray(body?.ids) ? body.ids : []
		if (!ids.length) return NextResponse.json({ error: "ids array required" }, { status: 400 })
		const set = new Set(ids)
		const products: Product[] = PRODUCTS.filter((p) => set.has(p.id))
		return NextResponse.json({ products })
	} catch {
		return NextResponse.json({ error: "invalid request" }, { status: 400 })
	}
}

export async function GET() {
	return NextResponse.json({ usage: "POST { ids: number[] }" })
}


