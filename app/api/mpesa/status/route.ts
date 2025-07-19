import { type NextRequest, NextResponse } from "next/server"
import { mpesaService } from "@/lib/mpesa"

export async function POST(request: NextRequest) {
  try {
    const { checkoutRequestId } = await request.json()

    if (!checkoutRequestId) {
      return NextResponse.json({ success: false, error: "CheckoutRequestID is required" }, { status: 400 })
    }

    console.log("Checking payment status for:", checkoutRequestId)

    const statusResponse = await mpesaService.queryStkPushStatus(checkoutRequestId)

    console.log("Payment status response:", statusResponse)

    return NextResponse.json({
      success: true,
      data: statusResponse,
    })
  } catch (error) {
    console.error("Error checking payment status:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
