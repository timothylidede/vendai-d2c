// app/api/mpesa/auth/route.ts
import { NextResponse } from "next/server"
import { getAccessToken } from "@/lib/mpesa"

export async function GET() {
  try {
    const accessToken = await getAccessToken()
    if (accessToken) {
      return NextResponse.json({ accessToken })
    } else {
      return NextResponse.json({ error: "Failed to retrieve access token" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in M-Pesa auth API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
