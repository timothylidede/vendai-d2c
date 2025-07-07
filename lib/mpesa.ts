// M-Pesa Integration
export interface MpesaPaymentRequest {
  amount: number
  phoneNumber: string
  orderId: string
  description: string
}

export interface MpesaResponse {
  success: boolean
  message: string
  transactionId?: string
  checkoutRequestId?: string
}

export const initiateMpesaPayment = async (paymentData: MpesaPaymentRequest): Promise<MpesaResponse> => {
  try {
    const response = await fetch("/api/mpesa/initiate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("M-Pesa payment initiation error:", error)
    return {
      success: false,
      message: "Failed to initiate M-Pesa payment",
    }
  }
}

export const checkMpesaPaymentStatus = async (checkoutRequestId: string): Promise<MpesaResponse> => {
  try {
    const response = await fetch("/api/mpesa/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkoutRequestId }),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("M-Pesa status check error:", error)
    return {
      success: false,
      message: "Failed to check M-Pesa payment status",
    }
  }
}

// Format phone number for M-Pesa (254XXXXXXXXX)
export const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "")

  // Handle different formats
  if (cleaned.startsWith("254")) {
    return cleaned
  } else if (cleaned.startsWith("0")) {
    return "254" + cleaned.substring(1)
  } else if (cleaned.length === 9) {
    return "254" + cleaned
  }

  return cleaned
}
