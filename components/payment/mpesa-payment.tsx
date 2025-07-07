"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { initiateMpesaPayment, checkMpesaPaymentStatus, formatPhoneNumber } from "@/lib/mpesa"

interface MpesaPaymentProps {
  amount: number
  orderId: string
  description: string
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
  onCancel: () => void
}

export function MpesaPayment({ amount, orderId, description, onSuccess, onError, onCancel }: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "initiated" | "checking" | "success" | "failed">("idle")
  const [checkoutRequestId, setCheckoutRequestId] = useState("")
  const [statusMessage, setStatusMessage] = useState("")

  const handleInitiatePayment = async () => {
    if (!phoneNumber.trim()) {
      onError("Please enter your phone number")
      return
    }

    setIsProcessing(true)
    setPaymentStatus("initiated")
    setStatusMessage("Initiating M-Pesa payment...")

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber)
      const result = await initiateMpesaPayment({
        amount,
        phoneNumber: formattedPhone,
        orderId,
        description,
      })

      if (result.success && result.checkoutRequestId) {
        setCheckoutRequestId(result.checkoutRequestId)
        setStatusMessage("Please check your phone and enter your M-Pesa PIN")

        // Start checking payment status
        setTimeout(() => checkPaymentStatus(result.checkoutRequestId!), 5000)
      } else {
        setPaymentStatus("failed")
        setStatusMessage(result.message)
        onError(result.message)
      }
    } catch (error) {
      setPaymentStatus("failed")
      setStatusMessage("Failed to initiate payment")
      onError("Failed to initiate payment")
    } finally {
      setIsProcessing(false)
    }
  }

  const checkPaymentStatus = async (requestId: string, attempts = 0) => {
    if (attempts >= 12) {
      // Check for 2 minutes (12 * 10 seconds)
      setPaymentStatus("failed")
      setStatusMessage("Payment timeout. Please try again.")
      onError("Payment timeout")
      return
    }

    setPaymentStatus("checking")
    setStatusMessage("Checking payment status...")

    try {
      const result = await checkMpesaPaymentStatus(requestId)

      if (result.success && result.transactionId) {
        setPaymentStatus("success")
        setStatusMessage("Payment successful!")
        onSuccess(result.transactionId)
      } else if (result.message.includes("pending") || result.message.includes("processing")) {
        // Continue checking
        setTimeout(() => checkPaymentStatus(requestId, attempts + 1), 10000)
      } else {
        setPaymentStatus("failed")
        setStatusMessage(result.message)
        onError(result.message)
      }
    } catch (error) {
      setTimeout(() => checkPaymentStatus(requestId, attempts + 1), 10000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">M-Pesa Payment</h3>
        <p className="text-gray-400 text-sm">Pay KES {amount.toLocaleString()} via M-Pesa</p>
      </div>

      <AnimatePresence mode="wait">
        {paymentStatus === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678"
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-white/20 rounded-xl"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter your M-Pesa registered phone number</p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={onCancel}
                variant="ghost"
                className="flex-1 border border-white/10 hover:bg-white/5 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInitiatePayment}
                disabled={isProcessing || !phoneNumber.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-xl"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {(paymentStatus === "initiated" || paymentStatus === "checking") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
            </div>
            <div>
              <p className="font-medium">{statusMessage}</p>
              <p className="text-sm text-gray-400 mt-2">
                {paymentStatus === "initiated"
                  ? "A payment request has been sent to your phone"
                  : "Please wait while we confirm your payment"}
              </p>
            </div>
            <Button onClick={onCancel} variant="ghost" className="border border-white/10 hover:bg-white/5 rounded-xl">
              Cancel
            </Button>
          </motion.div>
        )}

        {paymentStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <p className="font-medium text-green-400">Payment Successful!</p>
              <p className="text-sm text-gray-400 mt-2">Your order has been confirmed</p>
            </div>
          </motion.div>
        )}

        {paymentStatus === "failed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <p className="font-medium text-red-400">Payment Failed</p>
              <p className="text-sm text-gray-400 mt-2">{statusMessage}</p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={onCancel}
                variant="ghost"
                className="flex-1 border border-white/10 hover:bg-white/5 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setPaymentStatus("idle")
                  setStatusMessage("")
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
