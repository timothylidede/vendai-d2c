export class MpesaService {
  private baseUrl = "https://api.safaricom.co.ke"

  constructor() {
    console.log("MpesaService initialized with baseUrl:", this.baseUrl)
  }

  async getAccessToken(): Promise<string> {
    const consumerKey = process.env.MPESA_CONSUMER_KEY
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET

    if (!consumerKey || !consumerSecret) {
      console.error("Missing MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET")
      throw new Error("Missing M-Pesa credentials")
    }

    console.log("Fetching access token...")
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64")

    try {
      const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Token request failed:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        })
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Access token response:", { status: response.status, hasToken: !!data.access_token })

      if (!data.access_token) {
        throw new Error("No access token in response")
      }

      return data.access_token
    } catch (error) {
      console.error("getAccessToken error:", error)
      throw error
    }
  }

  generateTimestamp(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")

    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`
    console.log("Generated timestamp:", timestamp)
    return timestamp
  }

  generatePassword(businessShortCode: string, passkey: string, timestamp: string): string {
    const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString("base64")
    console.log("Password generated for BusinessShortCode:", businessShortCode)
    return password
  }

  async initiateStkPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string,
  ): Promise<any> {
    try {
      console.log("Starting STK Push process...")

      // Validate inputs
      if (!phoneNumber || !phoneNumber.match(/^254[17]\d{8}$/)) {
        throw new Error("Phone number must be in format 2547XXXXXXXX or 2541XXXXXXXX")
      }
      if (!amount || amount < 1) {
        throw new Error("Amount must be at least 1 KES")
      }

      const accessToken = await this.getAccessToken()
      const timestamp = this.generateTimestamp()

      const passkey = process.env.MPESA_PASSKEY

      if (!passkey) {
        throw new Error("MPESA_PASSKEY is required")
      }

      // For Till Numbers: BusinessShortCode is H.O Number, PartyB is Till Number
      let businessShortCode: string
      let partyB: string
      let transactionType: string

      if (process.env.MPESA_TILL_NUMBER) {
        // Till Number configuration
        businessShortCode = process.env.MPESA_HO_NUMBER || "3542565"
        partyB = process.env.MPESA_TILL_NUMBER
        transactionType = "CustomerBuyGoodsOnline"
      } else {
        // Paybill configuration
        businessShortCode = process.env.MPESA_HO_NUMBER || "3542565"
        partyB = businessShortCode
        transactionType = "CustomerPayBillOnline"
      }

      const password = this.generatePassword(businessShortCode, passkey, timestamp)
      const callbackUrl = process.env.MPESA_CALLBACK_URL || "https://vendai.digital/api/mpesa/callback"

      const stkPushData = {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: Math.floor(amount), // Ensure integer
        PartyA: phoneNumber,
        PartyB: partyB,
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: accountReference.substring(0, 12), // M-Pesa has character limits
        TransactionDesc: transactionDesc.substring(0, 13), // M-Pesa has character limits
      }

      console.log("STK Push request:", {
        ...stkPushData,
        Password: "[HIDDEN]",
        TransactionType: transactionType,
        Note: `Using ${process.env.MPESA_TILL_NUMBER ? "Till Number" : "Paybill"} configuration`,
      })

      const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPushData),
      })

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response:", responseText)
        throw new Error("Invalid JSON response from M-Pesa API")
      }

      console.log("STK Push response:", {
        status: response.status,
        statusText: response.statusText,
        data: data,
      })

      if (!response.ok) {
        throw new Error(`STK Push failed: ${data.errorMessage || data.ResponseDescription || response.statusText}`)
      }

      // Check if the response indicates success
      if (data.ResponseCode !== "0") {
        throw new Error(`STK Push error: ${data.ResponseDescription || data.CustomerMessage || "Unknown error"}`)
      }

      return data
    } catch (error) {
      console.error("STK Push error:", error)
      throw error
    }
  }

  // Add method to query STK Push status
  async queryStkPushStatus(checkoutRequestId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken()
      const timestamp = this.generateTimestamp()
      const businessShortCode = process.env.MPESA_HO_NUMBER || "3542565"
      const passkey = process.env.MPESA_PASSKEY

      if (!passkey) {
        throw new Error("MPESA_PASSKEY is required")
      }

      const password = this.generatePassword(businessShortCode, passkey, timestamp)

      const queryData = {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      }

      console.log("Querying STK Push status for:", checkoutRequestId)

      const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryData),
      })

      const data = await response.json()
      console.log("STK Push query response:", data)

      return data
    } catch (error) {
      console.error("STK Push query error:", error)
      throw error
    }
  }
}

export const mpesaService = new MpesaService()
