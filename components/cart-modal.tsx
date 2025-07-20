"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShoppingCart, Plus, Minus, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import { toast } from "sonner"
import type { CartItem } from "@/lib/types"

interface CartModalProps {
  show: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemoveItem: (productId: number) => void
  onCheckout: () => void
}

const CartModal: React.FC<CartModalProps> = ({ show, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      onRemoveItem(productId)
      return
    }
    onUpdateQuantity(productId, quantity)
  }

  const handleRemoveItem = (productId: number) => {
    onRemoveItem(productId)
    toast.success("Item removed from cart.")
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty.")
      return
    }
    onCheckout()
  }

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{
              y: "100%",
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
              scale: 0.95,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="glass-effect rounded-t-3xl md:rounded-2xl w-full md:w-full md:max-w-2xl max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Sticky */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-5 w-5 text-purple-400" />
                <h2 className="text-xl font-bold text-gradient">Your Cart</h2>
                {cart.length > 0 && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)} items
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10 h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium mb-2">Your Cart is Empty</h3>
                  <p className="text-gray-400 text-sm">Add some items to get started!</p>
                </div>
              ) : (
                <div className="p-4 md:p-6 space-y-4">
                  {/* Cart Items */}
                  {cart.map((item) => (
                    <div key={item.id} className="glass-effect rounded-xl p-4">
                      <div className="flex items-start space-x-4">
                        {/* Product Image */}
                        <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm md:text-base mb-1 truncate">{item.name}</h3>
                          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
                            <div className="flex items-center space-x-2 text-xs md:text-sm">
                              <span className="text-gray-400">{formatPrice(item.price)} each</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-green-400 font-medium">
                                {formatPrice(item.price * item.quantity)} total
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Mobile Controls */}
                        <div className="flex flex-col md:flex-row items-end md:items-center space-y-2 md:space-y-0 md:space-x-3">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2 bg-white/5 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white/10 text-gray-300"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded px-3 py-1 min-w-[40px] text-center text-sm font-medium">
                              {item.quantity}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white/10 text-gray-300"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Sticky (only show when cart has items) */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 bg-gray-900/80 backdrop-blur-xl p-4 md:p-6 space-y-4">
                {/* Order Summary */}
                <div className="glass-effect rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Items in cart</span>
                    <span className="text-sm font-medium">{cart.length}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Total quantity</span>
                    <span className="text-sm font-medium">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-base md:text-lg">Total Amount</span>
                      <span className="text-lg md:text-xl font-bold text-green-400">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 h-12 text-base"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { CartModal }
