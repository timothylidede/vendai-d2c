import { NextResponse } from "next/server"
import { createPayment } from "@/lib/firebase-db"

// M-Pesa API credentials (use environment variables)
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE
const MPESA_PASSKEY = process.env.MPESA_PASSKEY
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL

// Generate M-Pesa access token
async function getMpesaAccessToken() {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64")

  const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  const data = await response.json()
  return data.access_token
}

// Generate timestamp and password for M-Pesa
function generateMpesaPassword() {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3)
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64")
  return { timestamp, password }
}

export async function POST(request: Request) {
  try {
    const { amount, phoneNumber, orderId, description } = await request.json()

    // Get M-Pesa access token
    const accessToken = await getMpesaAccessToken()

    // Generate password and timestamp
    const { timestamp, password } = generateMpesaPassword()

    // Prepare STK Push request
    const stkPushData = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: orderId,
      TransactionDesc: description,
    }

    // Initiate STK Push
    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stkPushData),
    })

    const result = await response.json()

    if (result.ResponseCode === "0") {
      // Save payment record to Firebase
      await createPayment({
        orderId,
        amount,
        phoneNumber,
        checkoutRequestId: result.CheckoutRequestID,
        status: "pending",
        provider: "mpesa",
        description,
      })

      return NextResponse.json({
        success: true,
        message: "Payment initiated successfully",
        checkoutRequestId: result.CheckoutRequestID,
      })
    } else {
      return NextResponse.json({
        success: false,
        message: result.ResponseDescription || "Payment initiation failed",
      })
    }
  } catch (error) {
    console.error("M-Pesa initiation error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    )
  }
}
