import { type NextRequest, NextResponse } from "next/server"
import { mpesaService } from "@/lib/mpesa"

export async function GET(request: NextRequest) {
  try {
    const accessToken = await mpesaService.getAccessToken()

    return NextResponse.json({
      success: true,
      access_token: accessToken,
    })
  } catch (error) {
    console.error("Mpesa auth error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get access token",
      },
      { status: 500 },
    )
  }
}
