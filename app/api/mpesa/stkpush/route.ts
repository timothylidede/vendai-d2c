// app/api/mpesa/stkpush/route.ts
import { NextResponse } from "next/server"
import { initiateSTKPush } from "@/lib/mpesa"

export async function POST(req: Request) {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc } = await req.json()

    if (!phoneNumber || !amount || !accountReference || !transactionDesc) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const result = await initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc)

    if (result.success) {
      return NextResponse.json(result.data)
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in M-Pesa STK Push API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
