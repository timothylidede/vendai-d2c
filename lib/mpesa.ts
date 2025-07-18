interface MpesaAuthResponse {
  access_token: string
  expires_in: string
}

interface MpesaStkPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

interface MpesaStkPushRequest {
  BusinessShortCode: string
  Password: string
  Timestamp: string
  TransactionType: string
  Amount: string
  PartyA: string
  PartyB: string
  PhoneNumber: string
  CallBackURL: string
  AccountReference: string
  TransactionDesc: string
}

export class MpesaService {
  private consumerKey: string
  private consumerSecret: string
  private environment: "sandbox" | "production"
  private baseUrl: string

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || ""
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || ""
    this.environment = (process.env.MPESA_ENVIRONMENT as "sandbox" | "production") || "sandbox"
    this.baseUrl = this.environment === "sandbox" ? "https://sandbox.safaricom.co.ke" : "https://api.safaricom.co.ke"
  }

  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString("base64")

    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get access token")
    }

    const data: MpesaAuthResponse = await response.json()
    return data.access_token
  }

  generatePassword(shortcode: string, passkey: string, timestamp: string): string {
    const data = shortcode + passkey + timestamp
    return Buffer.from(data).toString("base64")
  }

  generateTimestamp(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const hour = String(now.getHours()).padStart(2, "0")
    const minute = String(now.getMinutes()).padStart(2, "0")
    const second = String(now.getSeconds()).padStart(2, "0")

    return `${year}${month}${day}${hour}${minute}${second}`
  }

  async initiateStkPush(phoneNumber: string, amount: number, accountReference: string): Promise<MpesaStkPushResponse> {
    const accessToken = await this.getAccessToken()
    const timestamp = this.generateTimestamp()
    const shortcode = process.env.MPESA_SHORTCODE || "174379"
    const passkey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
    const password = this.generatePassword(shortcode, passkey, timestamp)

    const requestBody: MpesaStkPushRequest = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount.toString(),
      PartyA: phoneNumber,
      PartyB: shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
      AccountReference: accountReference,
      TransactionDesc: `Payment for ${accountReference}`,
    }

    const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error("Failed to initiate STK push")
    }

    return await response.json()
  }
}

export const mpesaService = new MpesaService()
