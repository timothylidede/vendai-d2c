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
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onCheckout: () => void
}

const CartModal: React.FC<CartModalProps> = ({ show, onClose, cart, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      onRemoveItem(productId)
      return
    }
    onUpdateQuantity(productId, quantity)
  }

  const handleRemoveItem = (productId: string) => {
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{
              y: "100%",
              opacity: 0,
              scale: 1,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
              scale: 1,
            }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="glass-effect w-full h-[90vh] md:h-auto md:max-h-[80vh] md:w-full md:max-w-2xl md:rounded-2xl overflow-hidden flex flex-col bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Sticky on mobile */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black sticky top-0 z-10">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-bold text-gradient">Cart</h2>
                {cart.length > 0 && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)} items
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-black/80">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 px-6 bg-black">
                  <ShoppingCart className="h-14 w-14 mx-auto mb-3 text-gray-600" />
                  <h3 className="text-base font-medium mb-1">Your Cart is Empty</h3>
                  <p className="text-gray-400 text-xs text-center">Add some items to get started!</p>
                </div>
              ) : (
                <div className="p-4 md:p-6 bg-black">
                  {/* Cart Items */}
                  <div className="space-y-3 mb-5 bg-black">
                    {cart.map((item) => (
                      <div key={item.id} className="glass-effect rounded-lg p-3 bg-black">
                        <div className="flex items-start gap-3">
                          {/* Product Image */}
                          <div className="relative h-18 w-18 md:h-14 md:w-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Product Info & Controls */}
                          <div className="flex-1 min-w-0 bg-black">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                              {/* Product Details */}
                              <div className="flex-1 min-w-0 bg-black">
                                <h3 className="font-medium text-sm md:text-base leading-tight mb-1">{item.name}</h3>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
                                  <span className="text-gray-400">{formatPrice(item.price)} each</span>
                                  <span className="text-gray-500 hidden sm:inline">•</span>
                                  <span className="text-green-400 font-medium">
                                    {formatPrice(item.price * item.quantity)} total
                                  </span>
                                </div>
                              </div>

                              {/* Controls Container */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 bg-black">
                                {/* Quantity Controls */}
                                <div className="flex items-center bg-black/30 rounded-lg p-1 border border-white/10">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-white/10 rounded-md touch-manipulation"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <div className="px-2 py-1 min-w-[2rem] text-center text-xs font-medium">
                                    {item.quantity}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 hover:bg-white/10 rounded-md touch-manipulation"
                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                {/* Remove Button */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300 touch-manipulation border border-red-500/30 rounded-md"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Sticky on mobile */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 bg-black p-4 md:p-6 sticky bottom-0">
                {/* Order Summary */}
                <div className="glass-effect rounded-lg p-3 mb-3 bg-black">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Items:</span>
                      <span className="text-xs font-medium">{cart.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">Quantity:</span>
                      <span className="text-xs font-medium">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Amount</span>
                      <span className="text-lg font-bold text-green-400">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-black hover:from-purple-600 hover:to-gray-900 text-white font-medium py-2 text-sm touch-manipulation"
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