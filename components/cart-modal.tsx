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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-effect rounded-t-3xl sm:rounded-2xl w-full sm:w-full sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg sm:text-xl font-bold text-gradient">Your Cart</h2>
                {cart.length > 0 && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {cart.reduce((acc, item) => acc + item.quantity, 0)}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10 h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                <div className="text-center">
                  <ShoppingCart className="h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-4 text-gray-600" />
                  <h3 className="text-lg font-medium mb-2">Your Cart is Empty</h3>
                  <p className="text-gray-400 text-sm">Add some items to get started!</p>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                  {cart.map((item) => (
                    <motion.div key={item.id} layout className="glass-effect rounded-lg p-3 sm:p-4">
                      <div className="flex items-start space-x-3">
                        {/* Product Image */}
                        <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base text-white truncate">{item.name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1">
                            <span className="text-xs text-gray-400">{formatPrice(item.price)} each</span>
                            <span className="hidden sm:inline text-xs text-gray-500">•</span>
                            <span className="text-xs sm:text-sm font-medium text-green-400">
                              {formatPrice(item.price * item.quantity)} total
                            </span>
                          </div>

                          {/* Mobile Controls */}
                          <div className="flex items-center justify-between mt-3 sm:hidden">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white/10"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-2 py-1 min-w-[2rem] text-center">
                                {item.quantity}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-white/10"
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
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

                        {/* Desktop Controls */}
                        <div className="hidden sm:flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white/10"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1 min-w-[2.5rem] text-center">
                              {item.quantity}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white/10"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
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
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-white/10 p-4 sm:p-6 space-y-4 flex-shrink-0">
                  {/* Order Summary */}
                  <div className="glass-effect rounded-lg p-3 sm:p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Items in cart</span>
                      <span className="font-medium">{cart.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Total quantity</span>
                      <span className="font-medium">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total Amount</span>
                        <span className="text-lg font-bold text-green-400">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3 h-12"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { CartModal }
