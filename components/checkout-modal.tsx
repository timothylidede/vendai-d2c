"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CreditCard, Phone, MapPin, Check, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  category: string
  description: string
  image: string
}

interface CheckoutModalProps {
  show: boolean
  onClose: () => void
  cart: CartItem[]
  onCheckoutComplete: (orderData: any) => void
  user: any
}

export function CheckoutModal({ show, onClose, cart, onCheckoutComplete, user }: CheckoutModalProps) {
  const [step, setStep] = useState(1) // 1: Details, 2: Payment, 3: Processing, 4: Success
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [isProcessing, setIsProcessing] = useState(false)
  const [deliveryInfo, setDeliveryInfo] = useState({
    phone: user?.phone || "",
    location: user?.location || "",
    city: user?.city || "",
    instructions: "",
  })
  const [mpesaPhone, setMpesaPhone] = useState(user?.phone || "")
  const [orderNumber, setOrderNumber] = useState("")

  // Generate 4-digit order number
  const generateOrderNumber = () => {
    const existingOrders = JSON.parse(localStorage.getItem("vendai-orders") || "[]")
    const nextNumber = existingOrders.length + 1
    return nextNumber.toString().padStart(4, "0")
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleDeliverySubmit = () => {
    if (!deliveryInfo.phone || !deliveryInfo.location) {
      alert("Please fill in all required fields")
      return
    }
    setStep(2)
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setStep(3)

    const orderNum = generateOrderNumber()
    setOrderNumber(orderNum)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const orderData = {
      id: `order-${orderNum}`,
      orderNumber: orderNum,
      items: [...cart],
      total: getTotalPrice(),
      status: "processing",
      paymentMethod,
      paymentStatus: "paid",
      deliveryInfo,
      date: new Date().toISOString(),
      deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }

    onCheckoutComplete(orderData)
    setStep(4)
    setIsProcessing(false)
  }

  const resetCheckout = () => {
    setStep(1)
    setIsProcessing(false)
    setPaymentMethod("mpesa")
    setOrderNumber("")
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-effect rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {step > 1 && step < 4 && (
                  <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="hover:bg-white/10">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <h2 className="text-xl font-bold text-gradient">
                  {step === 1 && "Delivery Details"}
                  {step === 2 && "Payment Method"}
                  {step === 3 && "Processing Payment"}
                  {step === 4 && "Order Confirmed"}
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        stepNum <= step
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : "bg-white/10 text-gray-400"
                      }`}
                    >
                      {stepNum < step ? <Check className="h-4 w-4" /> : stepNum}
                    </div>
                    {stepNum < 4 && (
                      <div
                        className={`w-8 h-0.5 transition-all duration-300 ${
                          stepNum < step ? "bg-gradient-to-r from-blue-500 to-purple-500" : "bg-white/10"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Delivery Details */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="glass-effect rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <div className="flex justify-between">
                      <span>{getTotalItems()} items</span>
                      <span>KES {getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>Free</span>
                    </div>
                    <div className="border-t border-white/10 pt-1 mt-2">
                      <div className="flex justify-between font-medium text-white">
                        <span>Total</span>
                        <span>KES {getTotalPrice().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={deliveryInfo.phone}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, phone: e.target.value })}
                        className="pl-10 bg-white/5 border-white/10 text-white"
                        placeholder="+254 712 345 678"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Location *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={deliveryInfo.location}
                          onChange={(e) => setDeliveryInfo({ ...deliveryInfo, location: e.target.value })}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="Westlands"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">City *</label>
                      <Input
                        value={deliveryInfo.city}
                        onChange={(e) => setDeliveryInfo({ ...deliveryInfo, city: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                        placeholder="Nairobi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Delivery Instructions</label>
                    <textarea
                      value={deliveryInfo.instructions}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, instructions: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white h-20 resize-none"
                      placeholder="e.g., Leave at gate, Call before delivery..."
                    />
                  </div>
                </div>

                <Button onClick={handleDeliverySubmit} className="w-full bg-white text-black hover:bg-gray-200">
                  Continue to Payment
                </Button>
              </motion.div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="space-y-3">
                  {/* M-Pesa Option */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`glass-effect rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                      paymentMethod === "mpesa" ? "border-2 border-green-500 bg-green-500/10" : "border border-white/10"
                    }`}
                    onClick={() => setPaymentMethod("mpesa")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                        <Phone className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">M-Pesa</h3>
                        <p className="text-sm text-gray-400">Pay with your mobile money</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                          paymentMethod === "mpesa" ? "border-green-500 bg-green-500" : "border-gray-400"
                        }`}
                      >
                        {paymentMethod === "mpesa" && <Check className="h-3 w-3 text-white m-0.5" />}
                      </div>
                    </div>
                  </motion.div>

                  {/* Card Option */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`glass-effect rounded-lg p-4 cursor-pointer transition-all duration-300 opacity-50 ${
                      paymentMethod === "card" ? "border-2 border-blue-500 bg-blue-500/10" : "border border-white/10"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">Credit/Debit Card</h3>
                        <p className="text-sm text-gray-400">Coming soon</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
                          paymentMethod === "card" ? "border-blue-500 bg-blue-500" : "border-gray-400"
                        }`}
                      >
                        {paymentMethod === "card" && <Check className="h-3 w-3 text-white m-0.5" />}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* M-Pesa Phone Input */}
                {paymentMethod === "mpesa" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">M-Pesa Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={mpesaPhone}
                          onChange={(e) => setMpesaPhone(e.target.value)}
                          className="pl-10 bg-white/5 border-white/10 text-white"
                          placeholder="+254 712 345 678"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">You'll receive an M-Pesa prompt on this number</p>
                    </div>
                  </motion.div>
                )}

                <div className="glass-effect rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-xl font-bold text-green-400">KES {getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={paymentMethod === "card" || (paymentMethod === "mpesa" && !mpesaPhone)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white disabled:opacity-50"
                >
                  {paymentMethod === "mpesa" ? "Pay with M-Pesa" : "Pay with Card"}
                </Button>
              </motion.div>
            )}

            {/* Step 3: Processing */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <Loader2 className="w-16 h-16 text-green-500" />
                </motion.div>
                <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {paymentMethod === "mpesa"
                    ? "Please check your phone for the M-Pesa prompt and enter your PIN"
                    : "Processing your payment..."}
                </p>
                <div className="glass-effect rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span>Amount</span>
                    <span>KES {getTotalPrice().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Method</span>
                    <span>{paymentMethod === "mpesa" ? "M-Pesa" : "Card"}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15 }}
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-lg font-medium mb-2">Order Confirmed!</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Your order has been placed successfully. You'll receive updates via SMS.
                </p>
                <div className="glass-effect rounded-lg p-4 mb-6">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Order ID</span>
                      <span className="font-mono">#{orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>Within 24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Paid</span>
                      <span className="font-bold text-green-400">KES {getTotalPrice().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    onClose()
                    resetCheckout()
                  }}
                  className="w-full bg-white text-black hover:bg-gray-200"
                >
                  Continue Shopping
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
