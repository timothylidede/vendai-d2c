import { mpesaService } from "@/lib/mpesa"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, amount, accountReference, transactionDesc } = body

    console.log("STK Push API endpoint received:", {
      phoneNumber,
      amount,
      accountReference,
      transactionDesc,
    })

    // Validate required fields
    if (!phoneNumber || !amount || !accountReference || !transactionDesc) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: phoneNumber, amount, accountReference, transactionDesc",
        },
        { status: 400 },
      )
    }

    // Enhanced phone number validation for Kenya
    const cleanPhone = phoneNumber.replace(/\s+/g, "").replace(/[^\d]/g, "")
    let validatedPhone = ""

    if (cleanPhone.startsWith("0") && cleanPhone.length === 10) {
      // Convert 07XXXXXXXX to 2547XXXXXXXX
      validatedPhone = "254" + cleanPhone.substring(1)
    } else if (cleanPhone.startsWith("254") && cleanPhone.length === 12) {
      validatedPhone = cleanPhone
    } else if (cleanPhone.length === 9 && (cleanPhone.startsWith("7") || cleanPhone.startsWith("1"))) {
      validatedPhone = "254" + cleanPhone
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid phone number format. Use formats: 0712345678, 254712345678, or 712345678",
        },
        { status: 400 },
      )
    }

    // Additional validation for Kenyan mobile numbers
    if (!validatedPhone.match(/^254[17]\d{8}$/)) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number must be a valid Kenyan mobile number (Safaricom, Airtel, or Telkom)",
        },
        { status: 400 },
      )
    }

    // Validate amount
    const numericAmount = Number(amount)
    if (isNaN(numericAmount) || numericAmount < 1 || numericAmount > 70000) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be between KES 1 and KES 70,000",
        },
        { status: 400 },
      )
    }

    console.log("Validated inputs:", {
      phoneNumber: validatedPhone,
      amount: numericAmount,
      accountReference: accountReference.substring(0, 12),
      transactionDesc: transactionDesc.substring(0, 13),
    })

    // Initiate STK Push with validated data
    const stkResponse = await mpesaService.initiateStkPush(
      validatedPhone,
      numericAmount,
      accountReference,
      transactionDesc,
    )

    console.log("STK Push successful:", {
      CheckoutRequestID: stkResponse.CheckoutRequestID,
      ResponseCode: stkResponse.ResponseCode,
      ResponseDescription: stkResponse.ResponseDescription,
    })

    return NextResponse.json({
      success: true,
      data: stkResponse,
      message: "STK Push initiated successfully. Check your phone for the M-Pesa prompt.",
      validatedPhone: validatedPhone, // Return for confirmation
    })
  } catch (error) {
    console.error("STK Push endpoint error:", error)

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

    // Provide user-friendly error messages
    let userMessage = errorMessage
    if (errorMessage.includes("insufficient funds")) {
      userMessage = "Insufficient funds in your M-Pesa account"
    } else if (errorMessage.includes("invalid phone")) {
      userMessage = "Invalid phone number. Please check and try again."
    } else if (errorMessage.includes("timeout")) {
      userMessage = "Request timeout. Please try again."
    } else if (errorMessage.includes("network")) {
      userMessage = "Network error. Please check your connection and try again."
    }

    return NextResponse.json(
      {
        success: false,
        error: userMessage,
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 },
    )
  }
}
