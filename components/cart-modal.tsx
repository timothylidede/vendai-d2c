"use client"

import type React from "react"
import { AnimatePresence, motion } from "framer-motion"
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
        <>
          {/* Mobile: Slide up from bottom */}
          <div className="md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Header - Sticky */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-900 rounded-t-3xl sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <ShoppingCart className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-bold text-white">Your Cart</h2>
                  {cart.length > 0 && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">{cart.length}</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10 rounded-full p-2">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-medium mb-2 text-white">Your Cart is Empty</h3>
                    <p className="text-gray-400 text-sm">Add some items to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
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

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm mb-1 truncate">{item.name}</h3>
                            <div className="flex items-center justify-between mb-3">
                              <div className="text-xs text-gray-400">{formatPrice(item.price)} each</div>
                              <div className="text-sm font-medium text-green-400">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>

                            {/* Mobile Quantity Controls */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 bg-gray-700/50 rounded-lg p-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-white/10 rounded-md"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-white font-medium min-w-[2rem] text-center">{item.quantity}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-white/10 rounded-md"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-md"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Footer - Sticky */}
              {cart.length > 0 && (
                <div className="border-t border-gray-700 p-4 bg-gray-900 sticky bottom-0">
                  <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Total Items</span>
                      <span className="text-sm font-medium text-white">
                        {cart.reduce((acc, item) => acc + item.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Total Amount</span>
                      <span className="text-xl font-bold text-green-400">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-4 text-base"
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </motion.div>
          </div>

          {/* Desktop: Centered modal */}
          <div className="hidden md:block">
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
                className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Desktop Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="h-5 w-5 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">Your Cart</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/10">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-medium mb-2 text-white">Your Cart is Empty</h3>
                    <p className="text-gray-400 text-sm">Add some items to get started!</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Cart Items */}
                    <div className="space-y-3 mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white/10">
                                {item.image ? (
                                  <Image
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-sm text-white">{item.name}</h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-400">{formatPrice(item.price)} each</span>
                                  <span className="text-xs text-gray-500">•</span>
                                  <span className="text-xs text-green-400">
                                    {formatPrice(item.price * item.quantity)} total
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              {/* Desktop Quantity Controls */}
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-white/10"
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
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

                    {/* Desktop Order Summary */}
                    <div className="space-y-4">
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">Items in cart</span>
                          <span className="text-sm font-medium text-white">{cart.length}</span>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-400">Total quantity</span>
                          <span className="text-sm font-medium text-white">
                            {cart.reduce((acc, item) => acc + item.quantity, 0)}
                          </span>
                        </div>
                        <div className="border-t border-white/10 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-white">Total Amount</span>
                            <span className="text-lg font-bold text-green-400">{formatPrice(totalPrice)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Checkout Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium py-3"
                        onClick={handleCheckout}
                      >
                        Proceed to Checkout
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export { CartModal }
