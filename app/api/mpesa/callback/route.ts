import { NextResponse } from "next/server"
import { updatePaymentStatus } from "@/lib/firebase-db"

export async function POST(request: Request) {
  try {
    const callbackData = await request.json()

    const { Body } = callbackData
    const { stkCallback } = Body

    const { CheckoutRequestID, ResultCode, ResultDesc } = stkCallback

    if (ResultCode === 0) {
      // Payment successful
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || []
      const transactionData = {}

      callbackMetadata.forEach((item: any) => {
        switch (item.Name) {
          case "Amount":
            transactionData.amount = item.Value
            break
          case "MpesaReceiptNumber":
            transactionData.transactionId = item.Value
            break
          case "PhoneNumber":
            transactionData.phoneNumber = item.Value
            break
        }
      })

      // Update payment status
      await updatePaymentStatus(CheckoutRequestID, "completed", transactionData)

      // You might want to update the order status as well
      // await updateOrderStatus(orderId, 'paid')
    } else {
      // Payment failed
      await updatePaymentStatus(CheckoutRequestID, "failed", {
        error: ResultDesc,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("M-Pesa callback error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
