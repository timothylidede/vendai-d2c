import { type NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps } from "firebase/app"
import { getFirestore, collection, addDoc, updateDoc, query, where, getDocs } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase (avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("M-Pesa callback received:", JSON.stringify(body, null, 2))

    const callbackData = body.Body?.stkCallback

    if (!callbackData) {
      console.error("Invalid callback data - no stkCallback found")
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: "Callback processed - no stkCallback data",
      })
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData

    console.log("Processing callback:", {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      hasMetadata: !!CallbackMetadata,
    })

    // Extract metadata if payment was successful
    const transactionData = {
      checkoutRequestID: CheckoutRequestID,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
      timestamp: new Date(),
      amount: null,
      mpesaReceiptNumber: null,
      phoneNumber: null,
      transactionDate: null,
      processed: false,
    }

    if (ResultCode === 0 && CallbackMetadata?.Item) {
      // Payment successful - extract transaction details
      const items = CallbackMetadata.Item

      transactionData.amount = items.find((item) => item.Name === "Amount")?.Value
      transactionData.mpesaReceiptNumber = items.find((item) => item.Name === "MpesaReceiptNumber")?.Value
      transactionData.phoneNumber = items.find((item) => item.Name === "PhoneNumber")?.Value

      const transactionDateValue = items.find((item) => item.Name === "TransactionDate")?.Value
      if (transactionDateValue) {
        // Convert M-Pesa date format (YYYYMMDDHHMMSS) to Date
        const dateStr = transactionDateValue.toString()
        const year = Number.parseInt(dateStr.substring(0, 4))
        const month = Number.parseInt(dateStr.substring(4, 6)) - 1 // JavaScript months are 0-indexed
        const day = Number.parseInt(dateStr.substring(6, 8))
        const hour = Number.parseInt(dateStr.substring(8, 10))
        const minute = Number.parseInt(dateStr.substring(10, 12))
        const second = Number.parseInt(dateStr.substring(12, 14))

        transactionData.transactionDate = new Date(year, month, day, hour, minute, second)
      }

      transactionData.processed = true
      console.log("Payment successful:", {
        amount: transactionData.amount,
        receipt: transactionData.mpesaReceiptNumber,
        phone: transactionData.phoneNumber,
      })
    } else {
      console.log("Payment failed or cancelled:", { ResultCode, ResultDesc })
    }

    // Save transaction record to Firebase
    try {
      await addDoc(collection(db, "mpesa_transactions"), transactionData)
      console.log("Transaction saved to Firebase")
    } catch (firebaseError) {
      console.error("Error saving to Firebase:", firebaseError)
    }

    // Update order status if payment was successful
    if (ResultCode === 0 && transactionData.processed) {
      try {
        console.log("Updating order status for CheckoutRequestID:", CheckoutRequestID)

        // Find and update the order
        const ordersRef = collection(db, "orders")
        const orderQuery = query(ordersRef, where("orderNumber", "==", CheckoutRequestID))
        const orderSnapshot = await getDocs(orderQuery)

        if (!orderSnapshot.empty) {
          const orderDoc = orderSnapshot.docs[0]
          await updateDoc(orderDoc.ref, {
            paymentStatus: "completed",
            status: "confirmed",
            mpesaReceiptNumber: transactionData.mpesaReceiptNumber,
            mpesaAmount: transactionData.amount,
            mpesaPhoneNumber: transactionData.phoneNumber,
            paymentCompletedAt: new Date(),
            updatedAt: new Date(),
          })
          console.log("Order status updated successfully")
        } else {
          console.log("No order found with CheckoutRequestID:", CheckoutRequestID)
        }
      } catch (updateError) {
        console.error("Error updating order status:", updateError)
      }
    }

    // Always return success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback processed successfully",
    })
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error)

    // Still return success to M-Pesa to avoid retries
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Callback received but processing failed",
    })
  }
}

// Add GET method for webhook verification if needed
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: "M-Pesa callback endpoint is active",
    timestamp: new Date().toISOString(),
  })
}
