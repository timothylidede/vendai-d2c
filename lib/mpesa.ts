// lib/mpesa.ts
import { Buffer } from "buffer"

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET
const SHORTCODE = process.env.MPESA_SHORTCODE
const PASSKEY = process.env.MPESA_PASSKEY
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL

if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !PASSKEY || !CALLBACK_URL) {
  console.error("Missing M-Pesa environment variables. Please check your .env.local file.")
}

export async function getAccessToken(): Promise<string | null> {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    console.error("M-Pesa consumer key or secret is missing.")
    return null
  }

  const authString = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64")
  try {
    const response = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: {
        Authorization: `Basic ${authString}`,
      },
    })
    const data = await response.json()
    if (response.ok) {
      return data.access_token
    } else {
      console.error("Failed to get M-Pesa access token:", data)
      return null
    }
  } catch (error) {
    console.error("Error fetching M-Pesa access token:", error)
    return null
  }
}

export async function initiateSTKPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string,
): Promise<any> {
  if (!SHORTCODE || !PASSKEY || !CALLBACK_URL) {
    console.error("M-Pesa STK Push configuration is incomplete.")
    return { success: false, message: "M-Pesa configuration error." }
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14)
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString("base64")

  const accessToken = await getAccessToken()
  if (!accessToken) {
    return { success: false, message: "Failed to get M-Pesa access token." }
  }

  try {
    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      }),
    })
    const data = await response.json()
    if (response.ok) {
      return { success: true, data }
    } else {
      console.error("STK Push request failed:", data)
      return { success: false, message: data.errorMessage || "STK Push failed." }
    }
  } catch (error) {
    console.error("Error initiating STK Push:", error)
    return { success: false, message: "Network error or invalid request." }
  }
}
