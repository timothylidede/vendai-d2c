import { type NextRequest, NextResponse } from "next/server"
import { mpesaService } from "@/lib/mpesa"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, amount, accountReference } = body

    if (!phoneNumber || !amount || !accountReference) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      )
    }

    // Format phone number (ensure it starts with 254)
    let formattedPhone = phoneNumber.replace(/\D/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.substring(1)
    } else if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone
    }

    const response = await mpesaService.initiateStkPush(formattedPhone, Math.round(amount), accountReference)

    return NextResponse.json({
      success: true,
      data: response,
    })
  } catch (error) {
    console.error("STK Push error:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to initiate payment",
      },
      { status: 500 },
    )
  }
}
